"use client";

import { ArrowLeft, Upload, Save, X, Eye } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { updateMotor } from "@/lib/actions";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button 
      type="submit"
      disabled={pending}
      className="px-6 py-2.5 rounded-lg bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary)]/90 transition-colors flex items-center gap-2 disabled:opacity-70"
    >
      <Save size={18} />
      {pending ? "Menyimpan..." : "Simpan Perubahan"}
    </button>
  );
}

export default function EditMotorClient({ motor }: { motor: any }) {
  const [previews, setPreviews] = useState<string[]>([
    motor.image || "", 
    motor.images?.[0] || "", 
    motor.images?.[1] || "", 
    motor.images?.[2] || ""
  ]);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Auto-Save Draft
  const draftKey = `editMotorDraft_${motor.id}`;

  useEffect(() => {
    const draft = localStorage.getItem(draftKey);
    if (draft && formRef.current) {
      try {
        const data = JSON.parse(draft);
        Object.entries(data).forEach(([key, value]) => {
          const input = formRef.current?.elements.namedItem(key);
          if (input) {
            if (input instanceof RadioNodeList) {
              input.value = value as string;
            } else if (input instanceof HTMLInputElement && (input.type === 'checkbox' || input.type === 'radio')) {
              if (input.value === value) input.checked = true;
            } else {
              (input as any).value = value;
            }
          }
        });
      } catch (e) {
        console.error("Failed to load draft", e);
      }
    }
  }, [draftKey]);

  const handleFormChange = () => {
    if (!formRef.current) return;
    const formData = new FormData(formRef.current);
    const data = Object.fromEntries(formData.entries());
    delete data.image_0; delete data.image_1; delete data.image_2; delete data.image_3;
    localStorage.setItem(draftKey, JSON.stringify(data));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          
          const text = "TIMBUL MOTOR";
          ctx.translate(img.width / 2, img.height / 2);
          
          // Calculate the exact diagonal angle
          const angle = Math.atan2(-img.height, img.width);
          ctx.rotate(angle);
          
          let fontSize = 100; 
          ctx.font = `bold ${fontSize}px Arial`;
          let textWidth = ctx.measureText(text).width;
          
          // Max allowed width is 80% of the image's diagonal length
          const diagonal = Math.sqrt(img.width * img.width + img.height * img.height);
          const maxTextWidth = diagonal * 0.8;
          
          // Scale font size so it fits perfectly without cropping
          fontSize = fontSize * (maxTextWidth / textWidth);
          ctx.font = `bold ${fontSize}px Arial`;
          
          ctx.fillStyle = "rgba(255, 255, 255, 0.25)"; // 25% opacity
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          
          ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
          ctx.shadowBlur = 10;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;
          
          ctx.fillText(text, 0, 0);
          
          ctx.rotate(-angle);
          ctx.translate(-img.width / 2, -img.height / 2);
          
          // Convert back to file
          canvas.toBlob((blob) => {
            if (blob) {
              const watermarkedFile = new File([blob], file.name, { type: "image/jpeg" });
              const dt = new DataTransfer();
              dt.items.add(watermarkedFile);
              
              if (fileInputRefs.current[index]) {
                fileInputRefs.current[index]!.files = dt.files;
              }
              
              // Update preview safely using previous state
              const watermarkedUrl = URL.createObjectURL(watermarkedFile);
              setPreviews(prev => {
                const next = [...prev];
                next[index] = watermarkedUrl;
                return next;
              });
            }
          }, "image/jpeg", 0.9);
        }
        
        URL.revokeObjectURL(objectUrl);
      };
      
      img.src = objectUrl;
    }
  };

  const removeImage = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const newPreviews = [...previews];
    newPreviews[index] = "";
    setPreviews(newPreviews);
    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index]!.value = "";
    }
  };

  const [km, setKm] = useState(motor.km.toLocaleString('id-ID'));
  const [price, setPrice] = useState(motor.price.toLocaleString('id-ID'));
  const [dp, setDp] = useState(motor.dp_min.toLocaleString('id-ID'));

  const handleNumberFormat = (value: string, setter: (val: string) => void) => {
    const numericVal = value.replace(/\D/g, "");
    setter(numericVal ? Number(numericVal).toLocaleString("id-ID") : "");
  };

  const labels = ["Utama (Depan)", "Samping Kiri", "Samping Kanan", "Speedometer"];

  const updateMotorWithId = updateMotor.bind(null, motor.id);
  
  const [taxMonth, taxYear] = motor.tax_expiry ? motor.tax_expiry.split(" ") : ["", ""];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 relative">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/inventory" 
          className="p-2 hover:bg-[var(--muted)] rounded-lg transition-colors text-[var(--muted-foreground)]"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Edit Motor: {motor.name}</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Kode Unit: {motor.code}</p>
        </div>
      </div>

      <form 
        ref={formRef}
        onChange={handleFormChange}
        onSubmit={() => localStorage.removeItem(draftKey)}
        className="space-y-6" 
        action={updateMotorWithId}
      >
        
        {/* Foto Unit */}
        <div className="bg-white p-6 rounded-xl border border-[var(--border)] shadow-sm space-y-4 mt-6">
          <h2 className="font-bold text-lg border-b border-[var(--border)] flex items-center justify-between pb-2">
            <span>Foto Unit</span>
            <span className="text-xs font-normal text-blue-600 bg-blue-50 px-2 py-1 rounded">Auto-Watermark Aktif</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {previews.map((preview, index) => (
              <div key={index} className="space-y-2">
                <div 
                  className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center relative overflow-hidden cursor-pointer transition-colors ${preview ? 'border-[var(--primary)]' : 'border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/5'}`}
                  onClick={() => fileInputRefs.current[index]?.click()}
                >
                  {preview ? (
                    <>
                      <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute top-2 right-2 flex gap-1">
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setSelectedImage(preview); }}
                          className="p-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 shadow-sm"
                        >
                          <Eye size={14} />
                        </button>
                        <button 
                          type="button"
                          onClick={(e) => removeImage(e, index)}
                          className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-sm"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload className="text-[var(--muted-foreground)] mb-2" size={24} />
                      <span className="text-xs text-[var(--muted-foreground)] text-center px-2">Upload Foto</span>
                    </>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    name={`image_${index}`}
                    className="hidden" 
                    ref={(el) => {
                      if (el) fileInputRefs.current[index] = el;
                    }}
                    onChange={(e) => handleImageUpload(e, index)}
                  />
                  <input type="hidden" name={`existing_image_${index}`} value={preview || ""} />
                </div>
                <div className="text-center">
                  <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded-full">{labels[index]}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-[var(--muted-foreground)]">Format: JPG, PNG. Max 5MB/foto. Watermark logo Timbul Motor akan ditambahkan otomatis di sudut kanan bawah.</p>
        </div>

        {/* Info Dasar */}
        <div className="bg-white p-6 rounded-xl border border-[var(--border)] shadow-sm space-y-4 mt-6">
          <h2 className="font-bold text-lg border-b border-[var(--border)] pb-2">Informasi Dasar</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Merek <span className="text-red-500">*</span></label>
              <select name="brand" defaultValue={motor.brand} required className="w-full px-3 py-2 rounded-lg border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] text-sm bg-white">
                <option value="Honda">Honda</option>
                <option value="Yamaha">Yamaha</option>
                <option value="Suzuki">Suzuki</option>
                <option value="Kawasaki">Kawasaki</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Tipe Motor <span className="text-red-500">*</span></label>
              <select name="type" defaultValue={motor.type} required className="w-full px-3 py-2 rounded-lg border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] text-sm bg-white">
                <option value="matic">Matic</option>
                <option value="bebek">Bebek</option>
                <option value="sport">Sport</option>
              </select>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-sm font-medium">Nama/Seri Lengkap <span className="text-red-500">*</span></label>
              <input type="text" name="name" defaultValue={motor.name} required className="w-full px-3 py-2 rounded-lg border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Tahun Pembuatan <span className="text-red-500">*</span></label>
              <input type="number" name="year" defaultValue={motor.year} required className="w-full px-3 py-2 rounded-lg border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Warna Motor <span className="text-red-500">*</span></label>
              <input type="text" name="color" defaultValue={motor.color} placeholder="Cth: Hitam Doff" required className="w-full px-3 py-2 rounded-lg border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Kilometer (Odo) <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                name="km"
                required
                value={km}
                onChange={(e) => handleNumberFormat(e.target.value, setKm)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] text-sm" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Link Video Walkaround (Opsional)
              </label>
              <div className="relative">
                <input type="url" name="videoUrl" defaultValue={motor.videoUrl || ""} className="w-full pl-3 pr-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] outline-none" />
              </div>
            </div>
            <div className="space-y-1 sm:col-span-2 mt-2">
              <label className="text-sm font-bold text-[var(--foreground)]">Deskripsi Promosi Kendaraan</label>
              <p className="text-xs text-[var(--muted-foreground)] mb-2">Tuliskan keunggulan motor ini untuk menarik minat pembeli. Teks ini akan muncul di bagian atas halaman detail.</p>
              <textarea name="description" defaultValue={motor.description} rows={3} placeholder="Contoh: Motor simpanan, KM rendah asli, surat lengkap tangan pertama. Beli sekarang gratis ganti oli!" className="w-full px-3 py-2 rounded-lg border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] text-sm resize-none"></textarea>
            </div>
          </div>
        </div>

        {/* Harga & Status */}
        <div className="bg-white p-6 rounded-xl border border-[var(--border)] shadow-sm space-y-4">
          <h2 className="font-bold text-lg border-b border-[var(--border)] pb-2">Harga & Status</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Harga Jual (Rp) <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                name="price"
                required
                value={price}
                onChange={(e) => handleNumberFormat(e.target.value, setPrice)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] text-sm" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Minimal DP (Rp) <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                name="dp_min"
                required
                value={dp}
                onChange={(e) => handleNumberFormat(e.target.value, setDp)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] text-sm" 
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-sm font-medium">Status <span className="text-red-500">*</span></label>
              <select name="status" defaultValue={motor.status} required className="w-full px-3 py-2 rounded-lg border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] text-sm bg-white">
                <option value="Baru Masuk">Baru Masuk</option>
                <option value="Tersedia">Tersedia</option>
                <option value="Sedang Dipesan">Sedang Dipesan</option>
                <option value="Terjual">Terjual</option>
              </select>
            </div>
          </div>
        </div>

        {/* Kondisi & Surat */}
        <div className="bg-white p-6 rounded-xl border border-[var(--border)] shadow-sm space-y-4">
          <h2 className="font-bold text-lg border-b border-[var(--border)] pb-2">Surat & Kondisi Fisik</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-sm font-medium">Status Pajak <span className="text-red-500">*</span></label>
              <div className="flex gap-2">
                <select name="tax_status" defaultValue={motor.tax_status} required className="w-1/4 px-3 py-2 rounded-lg border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] text-sm bg-white">
                  <option value="Hidup">Hidup</option>
                  <option value="Mati">Mati</option>
                </select>
                <select name="tax_expiry_month" defaultValue={taxMonth} required className="w-1/4 px-3 py-2 rounded-lg border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] text-sm bg-white">
                  <option value="">Bulan</option>
                  {["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <input type="number" name="tax_expiry_year" defaultValue={taxYear} placeholder="Tahun (Cth: 2025)" required className="w-1/2 px-3 py-2 rounded-lg border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] text-sm" />
              </div>
            </div>
            <div className="flex gap-4 items-end pb-2">
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input type="checkbox" name="bpkb_ready" defaultChecked={motor.bpkb_ready} className="w-4 h-4 accent-[var(--primary)]" />
                BPKB Ready
              </label>
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input type="checkbox" name="stnk_ready" defaultChecked={motor.stnk_ready} className="w-4 h-4 accent-[var(--primary)]" />
                STNK Ready
              </label>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-sm font-medium">Kondisi Bodi</label>
              <input type="text" name="body_condition" defaultValue={motor.body_condition} placeholder="Cth: Mulus 95%, lecet pemakaian wajar" className="w-full px-3 py-2 rounded-lg border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] text-sm" />
            </div>
          </div>
        </div>

        {/* Laporan Inspeksi */}
        <div className="bg-white p-6 rounded-xl border border-[var(--border)] shadow-sm space-y-4">
          <h2 className="font-bold text-lg border-b border-[var(--border)] pb-2">Laporan Inspeksi (Digital Check-Sheet)</h2>
          
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
            {[
              { id: 'engine_sound', label: 'Suara & Performa Mesin', val: motor.engine_sound },
              { id: 'cvt_chain', label: 'CVT / Rantai', val: motor.cvt_chain },
              { id: 'electrical_lights', label: 'Kelistrikan & Lampu', val: motor.electrical_lights },
              { id: 'brakes', label: 'Sistem Pengereman', val: motor.brakes },
              { id: 'suspension', label: 'Suspensi & Kaki-kaki', val: motor.suspension }
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 border border-[var(--border)] rounded-lg">
                <span className="text-sm font-medium">{item.label}</span>
                <div className="flex gap-2">
                  <label className="flex items-center gap-1 text-xs cursor-pointer">
                    <input type="radio" name={`inspection.${item.id}`} value="Aman" defaultChecked={item.val !== "Catatan"} className="accent-green-600" />
                    <span className="text-green-700 font-medium">Aman</span>
                  </label>
                  <label className="flex items-center gap-1 text-xs cursor-pointer">
                    <input type="radio" name={`inspection.${item.id}`} value="Catatan" defaultChecked={item.val === "Catatan"} className="accent-yellow-600" />
                    <span className="text-yellow-700 font-medium">Catatan</span>
                  </label>
                </div>
              </div>
            ))}
            
            <div className="space-y-1 sm:col-span-2 mt-2 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <label className="text-sm font-bold text-yellow-900">Catatan Kekurangan Fisik / Minus</label>
              <p className="text-xs text-yellow-700 mb-2">Tuliskan kekurangan motor (jika ada) sebagai bentuk transparansi dealer. Teks ini akan disorot kuning di dalam kotak Hasil Inspeksi pembeli.</p>
              <textarea name="inspection.notes" defaultValue={motor.notes} rows={2} placeholder="Contoh: Lecet pemakaian di spakbor depan, mika sein kiri ada retak rambut sedikit." className="w-full px-3 py-2 rounded-lg border border-yellow-300 focus:outline-none focus:border-yellow-500 text-sm resize-none bg-white"></textarea>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Link 
            href="/admin/inventory"
            className="px-6 py-2.5 rounded-lg border border-[var(--border)] font-medium hover:bg-[var(--muted)] transition-colors"
          >
            Batal
          </Link>
          <SubmitButton />
        </div>
      </form>

      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img src={selectedImage} alt="Preview Fullscreen" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
          <button 
            className="absolute top-4 right-4 p-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <X size={24} />
          </button>
        </div>
      )}
    </div>
  );
}
