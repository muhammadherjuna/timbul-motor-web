export interface Motor {
  id: string;
  code: string;
  brand: string;
  name: string;
  type: 'matic' | 'bebek' | 'sport';
  year: number;
  km: number;
  price: number;
  dp_min: number;
  status: 'Tersedia' | 'Sedang Dipesan' | 'Terjual' | 'Baru Masuk';
  image: string;
  images: string[];
  specs: {
    cc: number;
    transmission: string;
    fuel: string;
  };
  condition: {
    tax: string;
    bpkb: boolean;
    stnk: boolean;
    body: string;
    engine: string;
    tires: string;
    minus: string;
  };
  inspection?: {
    engine_sound: 'Aman' | 'Catatan';
    cvt_chain: 'Aman' | 'Catatan';
    electrical_lights: 'Aman' | 'Catatan';
    brakes: 'Aman' | 'Catatan';
    suspension: 'Aman' | 'Catatan';
    notes: string;
  };
  videoUrl?: string;
}

export const mockMotors: Motor[] = [
  {
    id: "1",
    code: "TMK-024",
    brand: "Honda",
    name: "Honda Beat Deluxe",
    type: "matic",
    year: 2022,
    km: 12400,
    price: 15500000,
    dp_min: 1500000,
    status: "Tersedia",
    image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80"
    ],
    videoUrl: "https://www.youtube.com/shorts/dQw4w9WgXcQ",
    specs: {
      cc: 110,
      transmission: "CVT",
      fuel: "Injeksi (PGM-FI)"
    },
    condition: {
      tax: "Hidup (Okt 2024)",
      bpkb: true,
      stnk: true,
      body: "Mulus 95%, lecet pemakaian wajar",
      engine: "Halus, tarikan enteng",
      tires: "Depan 80%, Belakang 70%",
      minus: "Tidak ada"
    },
    inspection: {
      engine_sound: 'Aman',
      cvt_chain: 'Aman',
      electrical_lights: 'Aman',
      brakes: 'Catatan',
      suspension: 'Aman',
      notes: 'Kampas rem depan mulai tipis, masih aman untuk 2 bulan.'
    }
  },
  {
    id: "2",
    code: "TMK-025",
    brand: "Yamaha",
    name: "Yamaha NMAX 155 Connected",
    type: "matic",
    year: 2021,
    km: 25000,
    price: 24500000,
    dp_min: 3000000,
    status: "Tersedia",
    image: "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=800&auto=format&fit=crop&q=80"
    ],
    specs: {
      cc: 155,
      transmission: "CVT",
      fuel: "Injeksi (Blue Core)"
    },
    condition: {
      tax: "Mati (Lewat 3 Bulan)",
      bpkb: true,
      stnk: true,
      engine: "Servis rutin Yamaha",
      body: "Lecet halus di dek bawah",
      minus: "Tidak ada"
    }
  },
  {
    id: "3",
    code: "KWS-NJA-20",
    brand: "Kawasaki",
    name: "Kawasaki Ninja 250 FI",
    type: "sport",
    year: 2020,
    km: 15000,
    price: 52000000,
    dp_min: 10000000,
    status: "Sedang Dipesan",
    image: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=600",
    images: [
      "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=600"
    ],
    specs: {
      cc: 250,
      transmission: "Manual 6 Speed",
      fuel: "Injeksi"
    },
    condition: {
      tax: "Mati 1 Tahun",
      bpkb: true,
      stnk: true,
      body: "Lecet pemakaian 85%",
      engine: "Normal, rajin servis rutin",
      tires: "Depan 60%, Belakang 80%",
      minus: "Pajak telat"
    }
  },
  {
    id: "4",
    code: "TMK-027",
    brand: "Yamaha",
    name: "Yamaha Aerox 155 VVA",
    type: "matic",
    year: 2020,
    km: 28000,
    price: 23500000,
    dp_min: 2500000,
    status: "Tersedia",
    image: "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=800&auto=format&fit=crop&q=80"
    ],
    specs: {
      cc: 155,
      transmission: "CVT",
      fuel: "Injeksi (Blue Core)"
    },
    condition: {
      tax: "Hidup (Des 2024)",
      bpkb: true,
      stnk: true,
      body: "Mulus 95%, full orisinil",
      engine: "Halus, tarikan mantap",
      tires: "Depan 70%, Belakang 70%",
      minus: "Kunci kontak sedikit seret"
    }
  }
];
