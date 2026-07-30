"use server";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// In production, this should be in .env
// We'll use a hardcoded secret for this demo
const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "timbul-motor-super-secret-key-2026"
);

export async function createSession(role: string, name: string, email: string) {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day
  const session = await new SignJWT({ role, name, email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(SECRET_KEY);

  (await cookies()).set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function verifySession(session: string) {
  try {
    const { payload } = await jwtVerify(session, SECRET_KEY, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function logout() {
  (await cookies()).delete("session");
  redirect("/login");
}

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email dan password harus diisi!" };
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.password) {
    return { error: "Email atau password salah!" };
  }

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (isValidPassword) {
    await createSession(user.role, user.name, user.email);
    redirect("/admin");
  } else {
    return { error: "Email atau password salah!" };
  }
}
