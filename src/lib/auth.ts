"use server";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// In production, this should be in .env
// We'll use a hardcoded secret for this demo
const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "timbul-motor-super-secret-key-2026"
);

export async function createSession() {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day
  const session = await new SignJWT({ role: "admin" })
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

export async function login(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  // Hardcoded admin credentials for now (since it's a single admin system)
  // In a real system, you'd check this against a User table in DB
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@timbulmotor.com";
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    await createSession();
    redirect("/admin");
  } else {
    return { error: "Email atau password salah!" };
  }
}
