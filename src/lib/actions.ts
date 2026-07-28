"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { uploadImageToSupabase } from "@/lib/supabase";

function generateCode(brand: string, type: string) {
  const prefix = brand.substring(0, 3).toUpperCase();
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${suffix}`;
}

export async function createMotor(formData: FormData) {
  const brand = formData.get("brand") as string;
  const name = formData.get("name") as string;
  const type = formData.get("type") as string;
  const price = parseInt((formData.get("price") as string).replace(/\D/g, ""), 10);
  const dp_min = parseInt((formData.get("dp_min") as string).replace(/\D/g, ""), 10);
  const year = parseInt(formData.get("year") as string, 10);
  const km = parseInt((formData.get("km") as string).replace(/\D/g, ""), 10);
  const status = formData.get("status") as string;
  const color = (formData.get("color") as string) || "Hitam";
  const cc = parseInt((formData.get("cc") as string) || "150", 10);
  const transmission = (formData.get("transmission") as string) || "Automatic";
  const tax_status = (formData.get("tax_status") as string) || "Hidup";
  const tax_expiry = `${formData.get("tax_expiry_month")} ${formData.get("tax_expiry_year")}`.trim();
  const bpkb_ready = formData.get("bpkb_ready") === "on";
  const stnk_ready = formData.get("stnk_ready") === "on";
  const body_condition = formData.get("body_condition") as string;
  const engine_condition = formData.get("engine_condition") as string;
  const videoUrl = formData.get("videoUrl") as string;
  const description = formData.get("description") as string;

  // For inspection
  const engine_sound = formData.get("inspection.engine_sound") as string;
  const cvt_chain = formData.get("inspection.cvt_chain") as string;
  const electrical_lights = formData.get("inspection.electrical_lights") as string;
  const brakes = formData.get("inspection.brakes") as string;
  const suspension = formData.get("inspection.suspension") as string;
  const notes = formData.get("inspection.notes") as string;

  // Process image uploads
  const uploadedUrls: string[] = [];
  for (let i = 0; i < 4; i++) {
    const file = formData.get(`image_${i}`) as File | null;
    if (file && file.size > 0 && file.name !== "undefined") {
      const url = await uploadImageToSupabase(file);
      if (url) uploadedUrls.push(url);
    }
  }

  // Fallback placeholder if no images uploaded
  const fallbackImage = "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=800&auto=format&fit=crop";
  const mainImage = uploadedUrls.length > 0 ? uploadedUrls[0] : fallbackImage;
  const allImages = uploadedUrls.length > 0 ? uploadedUrls : [fallbackImage];

  await prisma.motor.create({
    data: {
      code: generateCode(brand, type),
      brand,
      name,
      type,
      year,
      km,
      price,
      dp_min,
      status,
      image: mainImage,
      images: allImages,
      videoUrl: videoUrl || null,
      cc,
      transmission,
      color,
      tax_status,
      tax_expiry,
      bpkb_ready,
      stnk_ready,
      body_condition,
      engine_condition,
      description,
      engine_sound,
      cvt_chain,
      electrical_lights,
      brakes,
      suspension,
      notes,
    },
  });

  revalidatePath("/admin/inventory");
  revalidatePath("/stok");
  revalidatePath("/");
  redirect("/admin/inventory");
}

export async function updateMotor(id: string, formData: FormData) {
  const brand = formData.get("brand") as string;
  const name = formData.get("name") as string;
  const type = formData.get("type") as string;
  const price = parseInt((formData.get("price") as string).replace(/\D/g, ""), 10);
  const dp_min = parseInt((formData.get("dp_min") as string).replace(/\D/g, ""), 10);
  const year = parseInt(formData.get("year") as string, 10);
  const km = parseInt((formData.get("km") as string).replace(/\D/g, ""), 10);
  const status = formData.get("status") as string;
  const color = (formData.get("color") as string) || "Hitam";
  const cc = parseInt((formData.get("cc") as string) || "150", 10);
  const transmission = (formData.get("transmission") as string) || "Automatic";
  const tax_status = (formData.get("tax_status") as string) || "Hidup";
  const tax_expiry = `${formData.get("tax_expiry_month")} ${formData.get("tax_expiry_year")}`.trim();
  const bpkb_ready = formData.get("bpkb_ready") === "on";
  const stnk_ready = formData.get("stnk_ready") === "on";
  const body_condition = formData.get("body_condition") as string;
  const engine_condition = formData.get("engine_condition") as string;
  const videoUrl = formData.get("videoUrl") as string;
  const description = formData.get("description") as string;

  const engine_sound = formData.get("inspection.engine_sound") as string;
  const cvt_chain = formData.get("inspection.cvt_chain") as string;
  const electrical_lights = formData.get("inspection.electrical_lights") as string;
  const brakes = formData.get("inspection.brakes") as string;
  const suspension = formData.get("inspection.suspension") as string;
  const notes = formData.get("inspection.notes") as string;

  // Process image uploads
  const uploadedUrls: string[] = [];
  for (let i = 0; i < 4; i++) {
    const file = formData.get(`image_${i}`) as File | null;
    const existingUrl = formData.get(`existing_image_${i}`) as string;
    
    if (file && file.size > 0 && file.name !== "undefined") {
      const url = await uploadImageToSupabase(file);
      if (url) uploadedUrls.push(url);
    } else if (existingUrl) {
      uploadedUrls.push(existingUrl);
    }
  }

  const dataToUpdate: any = {
    brand, name, type, year, km, price, dp_min, status, color, cc, transmission, tax_status, tax_expiry, bpkb_ready, stnk_ready, body_condition, engine_condition, videoUrl: videoUrl || null, description,
    engine_sound, cvt_chain, electrical_lights, brakes, suspension, notes,
  };

  if (uploadedUrls.length > 0) {
    dataToUpdate.image = uploadedUrls[0];
    dataToUpdate.images = uploadedUrls;
  }

  await prisma.motor.update({
    where: { id },
    data: dataToUpdate,
  });

  revalidatePath("/admin/inventory");
  revalidatePath(`/admin/inventory/${id}/edit`);
  revalidatePath("/stok");
  revalidatePath(`/stok/${id}`);
  revalidatePath("/");
  redirect("/admin/inventory");
}

export async function deleteMotor(id: string) {
  await prisma.motor.delete({
    where: { id },
  });
  
  revalidatePath("/admin/inventory");
  revalidatePath("/stok");
  revalidatePath("/");
}
