"use client";

import { BarChart3, TrendingUp, Download, Calendar } from "lucide-react";

export default function ReportsPage() {
  const salesData = [
    { month: "Jan", sales: 12 },
    { month: "Feb", sales: 19 },
    { month: "Mar", sales: 15 },
    { month: "Apr", sales: 22 },
    { month: "Mei", sales: 28 },
    { month: "Jun", sales: 24 },
  ];
  
  const maxSales = Math.max(...salesData.map(d => d.sales));

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Laporan Penjualan</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Analisis performa bisnis dealer Anda.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-white border border-[var(--border)] text-[var(--foreground)] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--muted)] transition-colors">
            <Calendar size={18} />
            Bulan Ini
          </button>
          <button className="flex items-center gap-2 bg-[var(--primary)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--primary)]/90 transition-colors" onClick={() => alert('Fitur unduh laporan PDF akan aktif setelah terhubung ke database.')}>
            <Download size={18} />
            Unduh Laporan
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border border-[var(--border)] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[var(--foreground)]">Total Terjual</h3>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <BarChart3 size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-[var(--foreground)]">120 <span className="text-sm font-normal text-[var(--muted-foreground)]">Unit</span></p>
          <p className="text-sm text-green-600 flex items-center gap-1 mt-2 font-medium">
            <TrendingUp size={16} />
            +12.5% dari bulan lalu
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-[var(--border)] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[var(--foreground)]">Pendapatan Kotor</h3>
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <span className="font-bold">Rp</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-[var(--foreground)]">1.8M</p>
          <p className="text-sm text-green-600 flex items-center gap-1 mt-2 font-medium">
            <TrendingUp size={16} />
            +8.2% dari bulan lalu
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-[var(--border)] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[var(--foreground)]">Rata-rata Harga Jual</h3>
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
              <TrendingUp size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-[var(--foreground)]">15.4 <span className="text-sm font-normal text-[var(--muted-foreground)]">Juta</span></p>
          <p className="text-sm text-gray-500 mt-2">Stabil di angka 15 jutaan.</p>
        </div>
      </div>

      {/* Bar Chart Simulation */}
      <div className="bg-white p-6 rounded-xl border border-[var(--border)] shadow-sm">
        <h2 className="font-bold text-lg mb-6 border-b border-[var(--border)] pb-4">Grafik Penjualan 6 Bulan Terakhir</h2>
        <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 pt-4">
          {salesData.map((data, index) => {
            const heightPercentage = (data.sales / maxSales) * 100;
            return (
              <div key={index} className="flex flex-col items-center flex-1 gap-2 group">
                <div className="w-full flex justify-center relative">
                  <div className="absolute -top-8 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {data.sales} Unit
                  </div>
                  <div 
                    className="w-full max-w-[40px] bg-blue-100 group-hover:bg-blue-200 rounded-t-sm relative overflow-hidden transition-colors"
                    style={{ height: '200px' }}
                  >
                    <div 
                      className="absolute bottom-0 left-0 right-0 bg-[var(--primary)] transition-all duration-1000 ease-out"
                      style={{ height: `${heightPercentage}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-xs sm:text-sm font-medium text-[var(--muted-foreground)]">{data.month}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
