"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { uploadImageToSupabase } from "@/lib/supabase";

function generateCode(brand: string, type: string) {
  const prefix = brand ? brand.substring(0, 3).toUpperCase() : "MTR";
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${suffix}`;
}

const parseIntSafe = (val: string | null | undefined, fallback: number = 0) => {
  if (!val) return fallback;
  const parsed = parseInt(val.replace(/\D/g, ""), 10);
  return isNaN(parsed) ? fallback : parsed;
};

const parseFormData = (formData: FormData) => {
  // Tab 1 (Motor Core)
  const brand = formData.get("brand") as string;
  const name = formData.get("name") as string;
  const type = formData.get("type") as string;
  const location = formData.get("location") as string;
  const variant = formData.get("variant") as string;
  const year = parseIntSafe(formData.get("year") as string);
  const color = formData.get("color") as string;
  const cc = parseIntSafe(formData.get("cc") as string, 150);
  const transmission = formData.get("transmission") as string;
  const fuel_system = formData.get("fuel_system") as string;
  const km = parseIntSafe(formData.get("km") as string);
  
  // Tab 2 (MotorDocument)
  const plate_number = formData.get("plate_number") as string;
  const plate_area = formData.get("plate_area") as string;
  const tax_status = formData.get("tax_status") as string;
  const tax_expiry = formData.get("tax_expiry") as string;
  const stnk_expiry = formData.get("stnk_expiry") as string;
  const stnk_status = formData.get("stnk_status") as string;
  const bpkb_status = formData.get("bpkb_status") as string;
  const chassis_match = formData.get("chassis_match") as string;
  const engine_match = formData.get("engine_match") as string;
  const faktur = formData.get("faktur") as string;
  const ktp_owner = formData.get("ktp_owner") as string;
  const chassis_number = formData.get("chassis_number") as string;
  const engine_number = formData.get("engine_number") as string;
  const bpkb_ready = formData.get("bpkb_ready") === "on";
  const stnk_ready = formData.get("stnk_ready") === "on";
  
  // Tab 3 (MotorHistory)
  const previous_owners = formData.get("previous_owners") as string;
  const usage_type = formData.get("usage_type") as string;
  const crash_history = formData.get("crash_history") as string;
  const flood_history = formData.get("flood_history") as string;
  const engine_rebuild = formData.get("engine_rebuild") as string;
  const odo_status = formData.get("odo_status") as string;
  
  // Tab 4 (MotorInspection)
  const inspection_grade = formData.get("inspection_grade") as string;
  const inspector_name = formData.get("inspector_name") as string;
  const engine_start = formData.get("engine_start") as string;
  const engine_sound = formData.get("engine_sound") as string;
  const cvt_chain = formData.get("cvt_chain") as string;
  const electrical_lights = formData.get("electrical_lights") as string;
  const brakes = formData.get("brakes") as string;
  const suspension = formData.get("suspension") as string;
  const body_paint = formData.get("body_paint") as string;
  const test_drive = formData.get("test_drive") as string;
  const notes = formData.get("notes") as string;
  
  // Tab 5 (Motor Core - Medias)
  const videoUrl = formData.get("videoUrl") as string;
  const description = formData.get("description") as string;

  // Tab 6 (MotorPricing)
  const status = formData.get("status") as string;
  const trade_in_avail = formData.get("trade_in_avail") === "true";
  const is_nego = formData.get("is_nego") === "true";
  const price = parseIntSafe(formData.get("price") as string);
  const credit_price = parseIntSafe(formData.get("credit_price") as string, 0) || null;
  const dp_min = parseIntSafe(formData.get("dp_min") as string);
  const monthly_install = parseIntSafe(formData.get("monthly_install") as string, 0) || null;
  const tenor_options = formData.get("tenor_options") as string;

  // Tab 7 (MotorPricing - Internal)
  const purchase_price = parseIntSafe(formData.get("purchase_price") as string, 0) || null;
  const recondition_cost = parseIntSafe(formData.get("recondition_cost") as string, 0) || null;
  const supplier_name = formData.get("supplier_name") as string;
  const sales_rep = formData.get("sales_rep") as string;
  const internal_notes = formData.get("internal_notes") as string;

  return {
    core: {
      brand, name, type, location, variant, year, color, cc, transmission, fuel_system, km,
      videoUrl, description, status
    },
    document: {
      plate_number, plate_area, tax_status, tax_expiry, stnk_expiry, stnk_status, bpkb_status,
      chassis_match, engine_match, faktur, ktp_owner, chassis_number, engine_number, bpkb_ready, stnk_ready
    },
    history: {
      previous_owners, usage_type, crash_history, flood_history, engine_rebuild, odo_status
    },
    inspection: {
      inspection_grade, inspector_name, engine_start, engine_sound, cvt_chain, electrical_lights,
      brakes, suspension, body_paint, test_drive, notes
    },
    pricing: {
      trade_in_avail, is_nego, price, credit_price, dp_min, monthly_install, tenor_options,
      purchase_price, recondition_cost, supplier_name, sales_rep, internal_notes
    }
  };
};

export async function createMotor(formData: FormData) {
  const parsed = parseFormData(formData);

  // Process image uploads
  const uploadedUrls: string[] = [];
  for (let i = 0; i < 6; i++) {
    const file = formData.get(`image_${i}`) as File | null;
    if (file && file.size > 0 && file.name !== "undefined") {
      const url = await uploadImageToSupabase(file);
      if (url) uploadedUrls.push(url);
    }
  }

  const fallbackImage = "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=800&auto=format&fit=crop";
  const mainImage = uploadedUrls.length > 0 ? uploadedUrls[0] : fallbackImage;
  const allImages = uploadedUrls.length > 0 ? uploadedUrls : [fallbackImage];

  await prisma.motor.create({
    data: {
      ...parsed.core,
      code: generateCode(parsed.core.brand, parsed.core.type),
      image: mainImage,
      images: allImages,
      document: { create: parsed.document },
      history: { create: parsed.history },
      inspection: { create: parsed.inspection },
      pricing: { create: parsed.pricing },
    },
  });

  revalidatePath("/admin/inventory");
  revalidatePath("/stok");
  revalidatePath("/");
  redirect("/admin/inventory");
}

export async function updateMotor(id: string, formData: FormData) {
  const parsed = parseFormData(formData);

  // Process image uploads
  const uploadedUrls: string[] = [];
  for (let i = 0; i < 6; i++) {
    const file = formData.get(`image_${i}`) as File | null;
    const existingUrl = formData.get(`existing_image_${i}`) as string;
    
    if (file && file.size > 0 && file.name !== "undefined") {
      const url = await uploadImageToSupabase(file);
      if (url) uploadedUrls.push(url);
    } else if (existingUrl) {
      uploadedUrls.push(existingUrl);
    }
  }

  const dataToUpdate: any = { ...parsed.core };

  if (uploadedUrls.length > 0) {
    dataToUpdate.image = uploadedUrls[0];
    dataToUpdate.images = uploadedUrls;
  }

  await prisma.motor.update({
    where: { id },
    data: {
      ...dataToUpdate,
      document: { upsert: { create: parsed.document, update: parsed.document } },
      history: { upsert: { create: parsed.history, update: parsed.history } },
      inspection: { upsert: { create: parsed.inspection, update: parsed.inspection } },
      pricing: { upsert: { create: parsed.pricing, update: parsed.pricing } },
    },
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
