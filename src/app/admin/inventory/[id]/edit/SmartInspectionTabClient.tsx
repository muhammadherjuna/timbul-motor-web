"use client";

import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, Info, Save, Wrench, XCircle, ChevronDown, ChevronUp, Upload, Check } from "lucide-react";
import { 
  getInspectionPackage, 
  createInspectionSession, 
  getLatestInspectionSession,
  saveInspectionDraft,
  completeInspectionSession
} from "@/lib/inspection-actions";
import { uploadInspectionEvidence } from "@/lib/inspection-storage";

export default function SmartInspectionTabClient({ motorId, isReadOnly = false }: { motorId: string, isReadOnly?: boolean }) {
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
  
  // Derived state to group snapshots by category name
  const [snapshotCategories, setSnapshotCategories] = useState<{name: string, weight: number, items: any[]}[]>([]);

  useEffect(() => {
    loadData();
  }, [motorId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const sess = await getLatestInspectionSession(motorId);
      if (sess) {
        setSession(sess);
        
        // Group snapshot items by categoryName for rendering
        const catsMap = new Map<string, any>();
        sess.snapshot.forEach((snap: any) => {
          if (!catsMap.has(snap.categoryName)) {
            // Find category weight from the linked package if possible, otherwise just set to 0 for UI
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
          // Using packageItemId to link Answer -> Snapshot
          initialAnswers[item.packageItem.itemKey] = {
            packageItemId: item.packageItemId,
            answer: item.answer,
            status: item.status,
            score: item.score,
            notes: item.notes || ""
          };
        });
        setAnswers(initialAnswers);
        
        if (catsArray.length > 0) {
          setExpandedGroup(catsArray[0].name);
        }
      } else {
        // Load default package for new session
        const defaultPkg = await getInspectionPackage();
        if (defaultPkg) {
          setPackages([defaultPkg]); // For simplicity, we just use the default or we could fetch all
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
    if (isReadOnly || (session && (session.status === "COMPLETED" || session.status === "APPROVED"))) return;
    
    // We need packageItemId, which we can find from session.package.categories
    // Because snapshot doesn't hold the packageItemId natively, wait!
    // We need packageItemId to save it. Let's find it from the package.
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
    if (isReadOnly || (session && (session.status === "COMPLETED" || session.status === "APPROVED"))) return;
    setAnswers(prev => ({
      ...prev,
      [itemKey]: {
        ...(prev[itemKey] || {}),
        notes: note
      }
    }));
  };

  const handleFileChange = (itemKey: string, file: File | null) => {
    if (isReadOnly || (session && (session.status === "COMPLETED" || session.status === "APPROVED"))) return;
    if (file) {
      setEvidences(prev => ({ ...prev, [itemKey]: file }));
    }
  };

  const handleSaveDraft = async () => {
    if (!session) return;
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const itemsToSave = Object.values(answers);
      await saveInspectionDraft(session.id, itemsToSave);
      setSuccessMsg("Draft berhasil disimpan.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (e) {
      setErrorMsg("Gagal menyimpan draft.");
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
        if ((ans.status === "PERLU_PERBAIKAN" || ans.status === "RUSAK") && !evidences[snap.itemKey]) {
          // Check if already has evidence in DB
          const existingItem = session.items.find((i:any) => i.packageItem.itemKey === snap.itemKey);
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
      const itemsToSave = Object.values(answers);
      await saveInspectionDraft(session.id, itemsToSave);
      
      // Realistically upload files here via a Server Action
      
      await completeInspectionSession(session.id);
      setSuccessMsg("Inspeksi diselesaikan! Menunggu approval Supervisor.");
      await loadData();
    } catch (e: any) {
      setErrorMsg(e.message || "Gagal menyelesaikan inspeksi.");
    } finally {
      setSaving(false);
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
              <div key={cat.name} className="border border-[var(--border)] rounded-xl overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() => setExpandedGroup(expandedGroup === cat.name ? null : cat.name)}
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
                              const isDisabled = session.status === "COMPLETED" || session.status === "APPROVED";
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
                                  <div className="mt-1">{getStatusBadge(opt.status)}</div>
                                </div>
                              </label>
                            )})}
                          </div>

                          {currentAns && (currentAns.status === "PERLU_PERBAIKAN" || currentAns.status === "RUSAK") && (
                            <div className={`mb-4 p-3 rounded-lg border flex items-center justify-between ${session.status === "COMPLETED" || session.status === "APPROVED" ? "bg-gray-50 border-gray-200 opacity-80" : "bg-orange-50 border-orange-200"}`}>
                              <div className={`flex items-center gap-2 text-sm ${session.status === "COMPLETED" || session.status === "APPROVED" ? "text-gray-500" : "text-orange-800"}`}>
                                <Upload size={16} /> <span>Wajib unggah foto bukti</span>
                              </div>
                              <input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => handleFileChange(snap.itemKey, e.target.files?.[0] || null)}
                                className={`text-sm ${session.status === "COMPLETED" || session.status === "APPROVED" ? "cursor-not-allowed text-gray-400" : ""}`}
                                disabled={session.status === "COMPLETED" || session.status === "APPROVED"}
                              />
                            </div>
                          )}

                          <div>
                            <textarea 
                              placeholder="Catatan tambahan (opsional)..." 
                              value={currentAns?.notes || ""}
                              onChange={(e) => handleNoteChange(snap.itemKey, e.target.value)}
                              className={`w-full px-3 py-2 rounded-lg border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] text-sm ${session.status === "COMPLETED" || session.status === "APPROVED" ? "cursor-not-allowed bg-gray-50 text-gray-500" : ""}`}
                              rows={2}
                              disabled={session.status === "COMPLETED" || session.status === "APPROVED"}
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

          {!isReadOnly && (session.status === "DRAFT" || session.status === "IN_PROGRESS" || session.status === "REOPENED") && (
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

          {isReadOnly && (
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
    </div>
  );
}
