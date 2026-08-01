"use client";

import { useState, useEffect } from "react";
import { AlertCircle, AlertTriangle, Camera, CheckCircle, Info, Save, Wrench, XCircle, ChevronDown, ChevronUp, Upload, Check, Trash2 } from "lucide-react";
import { 
  getInspectionPackage, 
  createInspectionSession, 
  getLatestInspectionSession,
  saveInspectionDraft,
  completeInspectionSession,
  approveInspectionSession,
  rejectInspectionSession,
  revokeInspectionSession
} from "@/lib/inspection-actions";
import { uploadInspectionEvidence } from "@/lib/inspection-storage";

export default function SmartInspectionTabClient({ motorId, userRole = "GUEST", isReadOnly = false }: { motorId: string, userRole?: string, isReadOnly?: boolean }) {
  const [packages, setPackages] = useState<any[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<string>("");
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [evidences, setEvidences] = useState<Record<string, File>>({});
  const [evidencePreviews, setEvidencePreviews] = useState<Record<string, string>>({});
  
  const [rejectNote, setRejectNote] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [revokeNote, setRevokeNote] = useState("");
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  
  // Derived state to group snapshots by category name
  const [snapshotCategories, setSnapshotCategories] = useState<{name: string, weight: number, items: any[]}[]>([]);

  useEffect(() => {
    loadData();
  }, [motorId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const sess: any = await getLatestInspectionSession(motorId);
      if (sess) {
        setSession(sess);
        
        // Group snapshot items by categoryName for rendering
        const catsMap = new Map<string, any>();
        sess.snapshot.forEach((snap: any) => {
          if (!catsMap.has(snap.categoryName)) {
            const pkgCat = sess.package?.categories?.find((c: any) => c.name === snap.categoryName);
            catsMap.set(snap.categoryName, {
              name: snap.categoryName,
              weight: pkgCat?.weight || 0,
              items: []
            });
          }
          catsMap.get(snap.categoryName).items.push(snap);
        });
        
        const catsArray = Array.from(catsMap.values());
        setSnapshotCategories(catsArray);

        // Map existing items to answers state
        const initialAnswers: Record<string, any> = {};
        sess.items.forEach((item: any) => {
          initialAnswers[item.packageItem.itemKey] = {
            packageItemId: item.packageItemId,
            answer: item.answer,
            status: item.status,
            score: item.score,
            notes: item.notes || "",
            evidenceUrl: item.evidence?.[0]?.storagePath || null
          };
        });
        setAnswers(initialAnswers);
        
        if (catsArray.length > 0) {
          setExpandedGroup(catsArray[0].name);
        }
      } else {
        const defaultPkg = await getInspectionPackage();
        if (defaultPkg) {
          setPackages([defaultPkg]);
          setSelectedPackageId(defaultPkg.id);
        }
      }
    } catch (e) {
      console.error(e);
      setErrorMsg("Gagal memuat data inspeksi.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async () => {
    if (!selectedPackageId) return;
    setSaving(true);
    try {
      await createInspectionSession(motorId, selectedPackageId, "Admin");
      await loadData();
    } catch (e) {
      setErrorMsg("Gagal membuat sesi inspeksi.");
    } finally {
      setSaving(false);
    }
  };

  const handleAnswerSelect = (snapItem: any, status: string, answerText: string) => {
    if (isReadOnly || (session && session.status === "COMPLETED")) return;
    
    const pkgCat = session.package.categories.find((c: any) => c.name === snapItem.categoryName);
    const pkgItem = pkgCat?.items.find((i: any) => i.itemKey === snapItem.itemKey);

    if (!pkgItem) {
      setErrorMsg("Error: Item tidak ditemukan di paket asal.");
      return;
    }

    setAnswers(prev => ({
      ...prev,
      [snapItem.itemKey]: {
        ...prev[snapItem.itemKey],
        packageItemId: pkgItem.id,
        answer: answerText,
        status: status,
      }
    }));
  };

  const handleNoteChange = (itemKey: string, note: string) => {
    if (isReadOnly || (session && session.status === "COMPLETED")) return;
    setAnswers(prev => ({
      ...prev,
      [itemKey]: {
        ...(prev[itemKey] || {}),
        notes: note
      }
    }));
  };

  const handleFileChange = (itemKey: string, file: File | null) => {
    if (isReadOnly || (session && session.status === "COMPLETED")) return;
    if (file) {
      setEvidences(prev => ({ ...prev, [itemKey]: file }));
      const previewUrl = URL.createObjectURL(file);
      setEvidencePreviews(prev => ({ ...prev, [itemKey]: previewUrl }));
    } else {
      setEvidences(prev => {
        const next = { ...prev };
        delete next[itemKey];
        return next;
      });
      setEvidencePreviews(prev => {
        const next = { ...prev };
        delete next[itemKey];
        return next;
      });
      setAnswers(prev => ({
        ...prev,
        [itemKey]: {
          ...(prev[itemKey] || {}),
          evidenceUrl: null
        }
      }));
    }
  };

  const uploadAndPrepareItems = async () => {
    const itemsCopy = { ...answers };
    for (const [itemKey, file] of Object.entries(evidences)) {
      if (file && session) {
        try {
          let url = await uploadInspectionEvidence(file, session.id, itemKey);
          if (!url) {
            // Fallback for mock/local environment if Supabase storage isn't active
            url = evidencePreviews[itemKey] || null;
          }
          if (url && itemsCopy[itemKey]) {
            itemsCopy[itemKey].evidenceUrl = url;
          }
        } catch (e) {
          console.error("Gagal mengunggah foto bukti:", itemKey, e);
        }
      }
    }
    return Object.values(itemsCopy);
  };

  const handleSaveDraft = async () => {
    if (!session) return;
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const itemsToSave = await uploadAndPrepareItems();
      await saveInspectionDraft(session.id, itemsToSave);
      setSuccessMsg("Draft berhasil disimpan.");
      setTimeout(() => setSuccessMsg(""), 3000);
      await loadData();
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSupervisorAction = async (action: "APPROVE" | "REJECT" | "REVOKE", note?: string) => {
    if (!session) return;
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      if (action === "APPROVE") {
        await approveInspectionSession(session.id, "Admin / Supervisor", note);
        setSuccessMsg("Hasil inspeksi berhasil disetujui dan dipublikasikan!");
      } else if (action === "REJECT") {
        await rejectInspectionSession(session.id, "Admin / Supervisor", note);
        setSuccessMsg("Hasil inspeksi telah dikembalikan ke mekanik untuk diperbaiki.");
      } else if (action === "REVOKE") {
        await revokeInspectionSession(session.id);
        setSuccessMsg("Persetujuan hasil inspeksi berhasil ditarik kembali.");
      }
      
      setShowRejectModal(false);
      setShowRevokeModal(false);
      setRejectNote("");
      setRevokeNote("");
      
      // Auto-hide success message after 4s
      setTimeout(() => setSuccessMsg(""), 4000);
      
      await loadData();
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || "Gagal memproses persetujuan.");
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    if (!session) return;
    
    // Validasi
    for (const cat of snapshotCategories) {
      for (const snap of cat.items) {
        const ans = answers[snap.itemKey];
        if (!ans) {
          setErrorMsg(`Pertanyaan "${snap.question}" belum dijawab.`);
          setExpandedGroup(cat.name);
          return;
        }
        if ((ans.status === "PERLU_PERBAIKAN" || ans.status === "RUSAK") && !evidences[snap.itemKey] && !ans.evidenceUrl) {
          const existingItem = session.items?.find((i:any) => i.packageItem?.itemKey === snap.itemKey);
          if (!existingItem?.evidence?.length) {
            setErrorMsg(`Foto bukti wajib diunggah untuk status PERBAIKAN/RUSAK pada "${snap.question}".`);
            setExpandedGroup(cat.name);
            return;
          }
        }
      }
    }

    setSaving(true);
    setErrorMsg("");
    
    try {
      const itemsToSave = await uploadAndPrepareItems();
      await saveInspectionDraft(session.id, itemsToSave);
      await completeInspectionSession(session.id);
      setSuccessMsg("Inspeksi diselesaikan! Menunggu approval Supervisor.");
      await loadData();
    } catch (e: any) {
      setErrorMsg(e.message || "Gagal menyelesaikan inspeksi.");
    } finally {
      setSaving(false);
    }
  };

  const toggleGroup = (categoryName: string) => {
    if (expandedGroup === categoryName) {
      setExpandedGroup(null);
    } else {
      setExpandedGroup(categoryName);
      setTimeout(() => {
        const safeId = `category-group-${categoryName.replace(/[^a-zA-Z0-9]/g, '-')}`;
        const el = document.getElementById(safeId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "NORMAL":
      case "LENGKAP": return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 font-medium">{status}</span>;
      case "PERLU_PERBAIKAN": return <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-700 font-medium">PERBAIKAN</span>;
      case "RUSAK":
      case "TIDAK_LENGKAP":
      case "PERLU_GANTI": return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700 font-medium">{status}</span>;
      default: return null;
    }
  };

  const standardOptions = [
    { text: 'Normal', status: 'NORMAL' },
    { text: 'Perlu Perbaikan', status: 'PERLU_PERBAIKAN' },
    { text: 'Rusak', status: 'RUSAK' },
  ];
  const documentOptions = [
    { text: 'Lengkap / Sesuai', status: 'LENGKAP' },
    { text: 'Tidak Lengkap', status: 'TIDAK_LENGKAP' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="font-bold text-lg border-b border-[var(--border)] pb-2 flex items-center gap-2">
        <Wrench className="text-[var(--primary)]" size={20} /> Tab 4: Inspeksi & Kondisi Cerdas
      </h2>

      {errorMsg && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-center gap-2 text-sm border border-red-200">
          <XCircle size={16} /> {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="bg-green-50 text-green-700 p-3 rounded-lg flex items-center gap-2 text-sm border border-green-200">
          <CheckCircle size={16} /> {successMsg}
        </div>
      )}

      {!session ? (
        <div className="bg-white border border-[var(--border)] rounded-xl p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto">
            <Info size={32} />
          </div>
          <h3 className="text-xl font-bold">Belum Ada Sesi Inspeksi</h3>
          <p className="text-[var(--muted-foreground)]">Buat sesi inspeksi baru menggunakan template standar terbaru.</p>
          <button 
            type="button"
            onClick={handleCreateSession}
            disabled={saving || !selectedPackageId}
            className="px-6 py-2 bg-[var(--primary)] text-white rounded-lg font-medium"
          >
            {saving ? "Membuat..." : "Mulai Inspeksi Baru"}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-[var(--border)]">
            <div>
              <p className="text-sm text-[var(--muted-foreground)]">Status Sesi</p>
              <p className="font-bold text-lg">{session.status}</p>
            </div>
            {(session.status === "COMPLETED" || session.status === "APPROVED") && (
              <div className="text-right">
                <p className="text-sm text-[var(--muted-foreground)]">Grade</p>
                <p className={`font-bold text-2xl ${session.grade === 'A' ? 'text-green-600' : session.grade === 'B' ? 'text-blue-600' : session.grade === 'C' ? 'text-orange-600' : 'text-red-600'}`}>
                  {session.grade || "-"}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {snapshotCategories.map((cat) => (
              <div 
                key={cat.name} 
                id={`category-group-${cat.name.replace(/[^a-zA-Z0-9]/g, '-')}`}
                className="border border-[var(--border)] rounded-xl overflow-hidden bg-white scroll-mt-28"
              >
                <button
                  type="button"
                  onClick={() => toggleGroup(cat.name)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{cat.name}</span>
                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">Bobot Asli: {cat.weight}%</span>
                  </div>
                  {expandedGroup === cat.name ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                
                {expandedGroup === cat.name && (
                  <div className="p-4 space-y-6 divide-y divide-gray-100">
                    {cat.items.map((snap: any, idx: number) => {
                      const currentAns = answers[snap.itemKey];
                      const options = snap.categoryName.toLowerCase().includes('dokumen') ? documentOptions : standardOptions;
                      
                      return (
                        <div key={snap.itemKey} className={idx > 0 ? "pt-6" : ""}>
                          <div className="mb-3 flex items-center gap-2">
                            <p className="font-medium text-[var(--foreground)]">{idx + 1}. {snap.question}</p>
                            {snap.isSafetyItem && <span className="bg-red-100 text-red-700 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">Keselamatan</span>}
                            {snap.isCriticalItem && <span className="bg-purple-100 text-purple-700 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">Kritikal</span>}
                          </div>
                          
                          <div className="grid sm:grid-cols-3 gap-3 mb-4">
                            {options.map((opt, i) => {
                              const isDisabled = session.status === "COMPLETED"; // APPROVED is no longer disabled per Rule 2
                              return (
                              <label 
                                key={i} 
                                className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                                  isDisabled ? "cursor-not-allowed opacity-90" : "cursor-pointer hover:bg-gray-50"
                                } ${
                                  currentAns?.status === opt.status 
                                    ? "border-[var(--primary)] bg-[var(--primary)]/5" 
                                    : "border-gray-200"
                                }`}
                              >
                                <input 
                                  type="radio" 
                                  name={`ans_${snap.itemKey}`} 
                                  checked={currentAns?.status === opt.status}
                                  onChange={() => handleAnswerSelect(snap, opt.status, opt.text)}
                                  className={`mt-1 text-[var(--primary)] focus:ring-[var(--primary)] ${isDisabled ? "cursor-not-allowed" : ""}`}
                                  disabled={isDisabled}
                                />
                                <div>
                                  <p className="text-sm font-medium">{opt.text}</p>
                                </div>
                              </label>
                            )})}
                          </div>

                          {currentAns && (currentAns.status === "PERLU_PERBAIKAN" || currentAns.status === "RUSAK") && (
                            <div className={`mb-4 p-4 rounded-xl border space-y-3 ${
                              session.status === "COMPLETED" 
                                ? "bg-gray-50 border-gray-200 opacity-80" 
                                : "bg-amber-50/80 border-amber-200"
                            }`}>
                              <div className="flex items-start gap-2.5">
                                <AlertTriangle size={18} className={session.status === "COMPLETED" ? "text-gray-400 mt-0.5" : "text-amber-600 mt-0.5 flex-shrink-0"} />
                                <div>
                                  <p className={`text-xs font-bold uppercase tracking-wide ${session.status === "COMPLETED" ? "text-gray-600" : "text-amber-900"}`}>
                                    Wajib Unggah Foto Bukti
                                  </p>
                                  <p className={`text-xs mt-0.5 leading-relaxed ${session.status === "COMPLETED" ? "text-gray-500" : "text-amber-800"}`}>
                                    Kondisi komponen ini tercatat <strong>{currentAns.status.replace("_", " ")}</strong>. Mohon unggah 1 foto yang jelas sebagai bukti kondisi aktual.
                                  </p>
                                </div>
                              </div>

                              <div className="pt-2 border-t border-amber-200/60 flex flex-wrap items-center gap-3">
                                <input 
                                  id={`file-input-${snap.itemKey.replace(/[^a-zA-Z0-9]/g, '-')}`}
                                  type="file" 
                                  accept="image/*"
                                  onChange={(e) => handleFileChange(snap.itemKey, e.target.files?.[0] || null)}
                                  className="hidden"
                                  disabled={session.status === "COMPLETED"}
                                />

                                {evidencePreviews[snap.itemKey] || currentAns.evidenceUrl ? (
                                  <div className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-amber-300 shadow-sm">
                                    <img 
                                      src={evidencePreviews[snap.itemKey] || currentAns.evidenceUrl} 
                                      alt="Foto bukti" 
                                      className="w-14 h-14 object-cover rounded-md border border-gray-200 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                                      onClick={() => setZoomedImage(evidencePreviews[snap.itemKey] || currentAns.evidenceUrl)}
                                      title="Klik untuk memperbesar"
                                    />
                                    <div className="text-xs space-y-1">
                                      <span className="font-bold text-green-700 flex items-center gap-1">
                                        <CheckCircle size={13} /> Foto Bukti Terlampir
                                      </span>
                                      {evidences[snap.itemKey] && (
                                        <p className="text-gray-500 text-[11px] truncate max-w-[180px]">
                                          {evidences[snap.itemKey].name}
                                        </p>
                                      )}
                                      {session.status !== "COMPLETED" && (
                                        <div className="flex items-center gap-3 pt-0.5">
                                          <label 
                                            htmlFor={`file-input-${snap.itemKey.replace(/[^a-zA-Z0-9]/g, '-')}`}
                                            className="text-[11px] font-bold text-amber-700 hover:text-amber-900 underline cursor-pointer"
                                          >
                                            Ganti Foto
                                          </label>
                                          <button
                                            type="button"
                                            onClick={() => handleFileChange(snap.itemKey, null)}
                                            className="text-[11px] font-bold text-red-600 hover:text-red-800 flex items-center gap-0.5"
                                          >
                                            <Trash2 size={11} /> Hapus
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <label 
                                    htmlFor={`file-input-${snap.itemKey.replace(/[^a-zA-Z0-9]/g, '-')}`}
                                    className={`inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-semibold text-xs rounded-lg shadow-sm cursor-pointer transition-colors ${
                                      session.status === "COMPLETED" ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
                                    }`}
                                  >
                                    <Camera size={15} /> Pilih / Ambil Foto Bukti
                                  </label>
                                )}

                                {!evidencePreviews[snap.itemKey] && !currentAns.evidenceUrl && (
                                  <span className="text-xs text-amber-700 font-medium italic">
                                    * Belum ada foto yang dipilih
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          <div>
                            <textarea 
                              placeholder="Catatan tambahan (opsional)..." 
                              value={currentAns?.notes || ""}
                              onChange={(e) => handleNoteChange(snap.itemKey, e.target.value)}
                              className={`w-full px-3 py-2 rounded-lg border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] text-sm ${session.status === "COMPLETED" ? "cursor-not-allowed bg-gray-50 text-gray-500" : ""}`}
                              rows={2}
                              disabled={session.status === "COMPLETED"}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          {!isReadOnly && (session.status === "DRAFT" || session.status === "IN_PROGRESS" || session.status === "REOPENED" || session.status === "REJECTED") && (
            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
              <button 
                type="button" 
                onClick={handleSaveDraft}
                disabled={saving}
                className="px-5 py-2.5 rounded-lg border border-[var(--border)] bg-white text-[var(--foreground)] font-medium hover:bg-gray-50 transition-colors"
              >
                {saving ? "Menyimpan..." : "Simpan Draft"}
              </button>
              <button 
                type="button" 
                onClick={handleComplete}
                disabled={saving}
                className="px-5 py-2.5 rounded-lg bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary)]/90 transition-colors flex items-center gap-2"
              >
                <Check size={18} /> {saving ? "Memproses..." : "Selesaikan Sesi"}
              </button>
            </div>
          )}

          {/* Supervisor Actions */}
          {(userRole === "SUPER_ADMIN" || userRole === "ADMIN") && session.status === "COMPLETED" && (
            <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl mt-8">
              <h3 className="font-bold text-amber-800 text-lg mb-2 flex items-center gap-2"><CheckCircle size={20}/> Review Supervisor</h3>
              <p className="text-amber-700 text-sm mb-4">Mekanik telah menyelesaikan inspeksi unit ini. Silakan periksa hasil temuan dan foto bukti di atas, lalu beri persetujuan untuk ditayangkan ke publik atau minta perbaikan jika ada kesalahan.</p>
              <div className="flex items-center gap-3">
                <button 
                  type="button"
                  onClick={() => handleSupervisorAction("APPROVE")}
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2"
                >
                  <CheckCircle size={18} /> Setujui & Publikasikan
                </button>
                <button 
                  type="button"
                  onClick={() => setShowRejectModal(true)}
                  disabled={saving}
                  className="bg-white border border-red-200 text-red-600 hover:bg-red-50 font-medium px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2"
                >
                  <XCircle size={18} /> Minta Perbaikan ke Mekanik
                </button>
              </div>
            </div>
          )}

          {/* Audit Trail & Revoke */}
          {session.status === "APPROVED" && (
            <div className="bg-green-50 border border-green-200 p-6 rounded-xl mt-8 flex items-start justify-between">
              <div>
                <h3 className="font-bold text-green-800 text-lg mb-1 flex items-center gap-2"><CheckCircle size={20}/> Telah Disetujui</h3>
                <p className="text-green-700 text-sm">Disetujui oleh <span className="font-bold">{session.approvedByName || "Admin"}</span> pada {new Date(session.approvedAt).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
              </div>
              {(userRole === "SUPER_ADMIN" || userRole === "ADMIN") && (
                <button 
                  type="button"
                  onClick={() => setShowRevokeModal(true)}
                  className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  Tarik Kembali Persetujuan
                </button>
              )}
            </div>
          )}

          {session.status === "REJECTED" && (
            <div className="bg-red-50 border border-red-200 p-6 rounded-xl mt-8">
              <h3 className="font-bold text-red-800 text-lg mb-1 flex items-center gap-2"><XCircle size={20}/> Sesi Dikembalikan ke Mekanik</h3>
              <p className="text-red-700 text-sm mb-2">Dikembalikan oleh <span className="font-bold">{session.rejectedByName || "Admin"}</span> pada {new Date(session.rejectedAt).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}</p>
              <div className="bg-white p-3 rounded-lg border border-red-100 text-sm italic text-red-800">
                "{session.rejectionNote}"
              </div>
              <p className="text-red-600 text-xs mt-3">Silakan perbaiki temuan yang dimaksud lalu tekan Selesaikan Sesi kembali.</p>
            </div>
          )}

          {isReadOnly && !(userRole === "SUPER_ADMIN" || userRole === "ADMIN") && (
            <div className="bg-blue-50 text-blue-700 p-4 rounded-xl border border-blue-200 mt-8 flex items-center gap-3">
              <Info size={24} />
              <div>
                <p className="font-bold">Mode Hanya Baca</p>
                <p className="text-sm">Hanya Mekanik (Tim Inspeksi) yang berwenang untuk merubah isi form ini.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Minta Perbaikan ke Mekanik</h3>
            <p className="text-gray-500 text-sm mb-4">Laporan inspeksi ini akan dikembalikan kepada mekanik untuk diperbaiki. Hasil inspeksi tidak akan ditayangkan ke pembeli sebelum diperbaiki dan disetujui kembali.</p>
            <textarea 
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="Tuliskan catatan detail bagian yang perlu diperbaiki (misal: foto spakbor buram, mohon diunggah ulang)..."
              className="w-full border border-gray-300 rounded-lg p-3 text-sm min-h-[100px] mb-4 focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
            <div className="flex items-center justify-end gap-3">
              <button 
                type="button"
                onClick={() => { setShowRejectModal(false); setRejectNote(""); }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
              >
                Batal
              </button>
              <button 
                type="button"
                onClick={() => handleSupervisorAction("REJECT", rejectNote)}
                disabled={saving || !rejectNote.trim()}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {saving ? "Memproses..." : "Kirim Catatan Perbaikan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revoke Modal */}
      {showRevokeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Tarik Kembali Persetujuan</h3>
            <p className="text-gray-500 text-sm mb-4">Status persetujuan akan dibatalkan dan laporan inspeksi akan disembunyikan sementara dari halaman publik hingga disetujui kembali.</p>
            <textarea 
              value={revokeNote}
              onChange={(e) => setRevokeNote(e.target.value)}
              placeholder="Tuliskan alasan penarikan persetujuan ini..."
              className="w-full border border-gray-300 rounded-lg p-3 text-sm min-h-[100px] mb-4 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
            <div className="flex items-center justify-end gap-3">
              <button 
                type="button"
                onClick={() => { setShowRevokeModal(false); setRevokeNote(""); }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
              >
                Batal
              </button>
              <button 
                type="button"
                onClick={() => handleSupervisorAction("REVOKE", revokeNote)}
                disabled={saving || !revokeNote.trim()}
                className="px-4 py-2 bg-amber-600 text-white hover:bg-amber-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {saving ? "Memproses..." : "Konfirmasi Penarikan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Zoomed Image Modal */}
      {zoomedImage && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center">
            <button 
              type="button"
              onClick={() => setZoomedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 flex items-center gap-2 font-medium"
            >
              <XCircle size={24} /> Tutup
            </button>
            <img 
              src={zoomedImage} 
              alt="Foto Diperbesar" 
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
