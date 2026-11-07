import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  MapPin,
  MapPinned,
  Search,
  ShieldCheck,
  Users,
  Wrench,
  AlertCircle,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const initialStats = [
  { key: "total", label: "Total laporan", value: "0", note: "Seluruh laporan masuk", icon: ClipboardCheck },
  { key: "pending", label: "Menunggu", value: "0", note: "Menanti tindak lanjut", icon: Clock3 },
  { key: "processing", label: "Diproses", value: "0", note: "Sedang ditangani", icon: Wrench },
  { key: "completed", label: "Selesai", value: "0", note: "Telah ditindaklanjuti", icon: CheckCircle2 },
];

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Temukan masalah",
    description: "Temukan fasilitas publik di kawasan TOD Tangsel yang bermasalah lewat peta.",
  },
  {
    number: "02",
    icon: Camera,
    title: "Kirim laporan",
    description: "Tambahkan foto, kategori kerusakan, deskripsi, dan titik lokasi.",
  },
  {
    number: "03",
    icon: ClipboardCheck,
    title: "Pantau tindak lanjut",
    description: "Pantau status laporan mulai dari menunggu hingga selesai ditangani.",
  },
];

function formatNumber(value) {
  return new Intl.NumberFormat("id-ID").format(value);
}

export default function Home() {
  const navigate = useNavigate();
  const { user, profile, role } = useAuth();
  const { showToast } = useToast();

  const [stats, setStats] = useState(initialStats);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(false);

  const currentRole = role || profile?.role;

  const isStaff = ["petugas", "staff", "admin"].includes(
    String(currentRole || "").toLowerCase()
  );

  useEffect(() => {
    let active = true;

    async function fetchStats() {
      try {
        const { data, error } = await supabase
          .from("reports")
          .select("status");

        if (error) throw error;

        const reports = data || [];

        const counts = {
          total: reports.length,
          pending: reports.filter((item) => item.status === "Pending").length,
          processing: reports.filter((item) => item.status === "Diproses").length,
          completed: reports.filter((item) => item.status === "Selesai").length,
        };

        if (active) {
          setStats(
            initialStats.map((item) => ({
              ...item,
              value: formatNumber(counts[item.key]),
            }))
          );
        }
      } catch (error) {
        console.error("Gagal mengambil statistik laporan:", error);

        if (active) setStatsError(true);
      } finally {
        if (active) setStatsLoading(false);
      }
    }

    fetchStats();

    return () => {
      active = false;
    };
  }, []);

  function handleCreateReport() {
    if (isStaff) {
      showToast({
        type: "info",
        title: "Area petugas",
        message: "Petugas dapat memantau laporan melalui halaman Kelola Laporan.",
      });

      navigate("/kelola-laporan");
      return;
    }

    // CreateReport menangani notifikasi dan redirect untuk pengguna yang belum login.
    navigate("/buat-laporan");
  }

  function handleMainAction() {
    if (isStaff) {
      navigate("/kelola-laporan");
    } else if (user) {
      navigate("/buat-laporan");
    } else {
      navigate("/peta");
    }
  }

  function displayStat(value) {
    if (statsLoading) return "…";
    if (statsError) return "—";
    return value;
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f8faf9] text-slate-800">
      {/* HERO */}
      <section className="relative">
        <div className="pointer-events-none absolute -right-24 -top-20 h-72 w-72 rounded-full bg-emerald-100/60 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-5 py-10 sm:px-8 sm:py-12 lg:grid-cols-2 lg:gap-10 lg:px-10 lg:py-16">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3.5 py-2 text-sm font-medium text-emerald-800 shadow-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              LaporTOD · Kawasan TOD
            </div>

            <h1 className="max-w-xl text-4xl font-bold leading-[1.12] tracking-tight text-slate-900 sm:text-5xl">
              Fasilitas TOD Tangsel <br /> 
              lebih baik,
              <span className="mt-1 block text-emerald-700">
                dimulai dari laporanmu.
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              Temukan dan laporkan kerusakan fasilitas publik di kawasan
              Transit Oriented Development (TOD) Tangerang Selatan. Bantu wujudkan lingkungan Tangsel
              yang lebih nyaman, aman, dan terawat untuk semua.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleCreateReport}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white shadow-md shadow-emerald-900/10 transition hover:bg-emerald-800"
              >
                {isStaff ? "Kelola Laporan" : "Buat Laporan"}
                <ArrowRight size={18} />
              </button>

              <Link
                to="/peta"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50"
              >
                <MapPinned size={18} />
                Peta Persebaran
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck size={17} className="text-emerald-700" />
                Pelaporan terstruktur
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin size={17} className="text-emerald-700" />
                Berbasis lokasi
              </span>
            </div>
          </div>

          {/* ILUSTRASI PETA */}
          <div className="mx-auto w-full max-w-lg">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-2.5 shadow-xl shadow-slate-900/5 sm:p-4">
              <div className="flex items-center justify-between border-b border-slate-100 px-3 py-3">
                <div>
                  <p className="font-bold text-slate-800">
                    Peta fasilitas publik
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Ilustrasi kawasan TOD
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <MapPinned size={21} />
                </div>
              </div>

              <div className="relative h-56 overflow-hidden rounded-2xl bg-[#edf4ef] sm:h-72">
                <svg
                  viewBox="0 0 500 350"
                  className="absolute inset-0 h-full w-full"
                  preserveAspectRatio="xMidYMid slice"
                  role="img"
                  aria-label="Ilustrasi peta fasilitas publik"
                >
                  <rect width="500" height="350" fill="#edf4ef" />

                  <g
                    stroke="#d4e2d8"
                    strokeWidth="35"
                    fill="none"
                    strokeLinecap="round"
                  >
                    <path d="M-20 70 L120 105 L200 55 L300 95 L520 30" />
                    <path d="M-30 230 L100 200 L200 240 L310 190 L530 245" />
                    <path d="M115 -20 L150 100 L130 200 L175 370" />
                    <path d="M330 -20 L300 90 L340 180 L300 370" />
                  </g>

                  <g
                    stroke="white"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                  >
                    <path d="M-20 70 L120 105 L200 55 L300 95 L520 30" />
                    <path d="M-30 230 L100 200 L200 240 L310 190 L530 245" />
                    <path d="M115 -20 L150 100 L130 200 L175 370" />
                    <path d="M330 -20 L300 90 L340 180 L300 370" />
                  </g>

                  <g fill="#d8e9dc">
                    <rect x="30" y="125" width="70" height="48" rx="8" />
                    <rect x="190" y="105" width="68" height="44" rx="8" />
                    <rect x="370" y="115" width="80" height="54" rx="8" />
                    <rect x="195" y="270" width="65" height="43" rx="8" />
                    <rect x="375" y="275" width="70" height="40" rx="8" />
                  </g>

                  <path
                    d="M70 65 C130 110 175 175 245 178 S350 145 415 205"
                    stroke="#10b981"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray="9 8"
                    fill="none"
                  />

                  <circle cx="245" cy="178" r="23" fill="#10b981" opacity=".15" />
                  <circle cx="245" cy="178" r="14" fill="#059669" />
                  <circle cx="245" cy="178" r="5" fill="white" />

                  <g transform="translate(102 102)">
                    <circle r="18" fill="#fef3c7" />
                    <circle r="11" fill="#f59e0b" />
                    <path
                      d="M0 -5 V1 M0 6 V6.5"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </g>

                  <g transform="translate(365 215)">
                    <circle r="18" fill="#d1fae5" />
                    <circle r="11" fill="#059669" />
                    <path
                      d="M-5 0 L-1 4 L6 -4"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </g>

                  <g transform="translate(410 75)">
                    <circle r="18" fill="#fee2e2" />
                    <circle r="11" fill="#ef4444" />
                    <path
                      d="M0 -5 V1 M0 6 V6.5"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </g>
                </svg>

                <div className="absolute left-3 top-3 rounded-lg bg-white/95 px-3 py-2 shadow-sm">
                  <span className="flex items-center gap-2 text-xs font-medium text-slate-700">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                    Menunggu
                  </span>
                </div>

                <div className="absolute bottom-3 right-3 rounded-lg bg-white/95 px-3 py-2 shadow-sm">
                  <span className="flex items-center gap-2 text-xs font-medium text-slate-700">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
                    Selesai
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-3">
                {stats.slice(1).map((stat, index) => (
                  <div key={stat.key} className="rounded-xl bg-slate-50 p-3">
                    <div
                      className={`mb-2 h-2 w-2 rounded-full ${
                        index === 0
                          ? "bg-amber-500"
                          : index === 1
                            ? "bg-blue-500"
                            : "bg-emerald-600"
                      }`}
                    />
                    <p className="text-xs text-slate-500">{stat.label}</p>
                    <p className="mt-1 text-lg font-bold text-slate-800">
                      {displayStat(stat.value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATISTIK */}
      <section className="mx-auto max-w-7xl px-5 pb-10 sm:px-8 lg:px-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Ringkasan laporan
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
                Kondisi laporan saat ini
              </h2>
            </div>

            <p className="text-sm text-slate-500">
              Data laporan LaporTOD
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;

              const iconColors = [
                "bg-emerald-100 text-emerald-700",
                "bg-amber-100 text-amber-700",
                "bg-blue-100 text-blue-700",
                "bg-teal-100 text-teal-700",
              ];

              return (
                <div
                  key={stat.key}
                  className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 transition hover:border-emerald-200"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-slate-600">
                      {stat.label}
                    </p>
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconColors[index]}`}
                    >
                      <Icon size={18} />
                    </div>
                  </div>

                  <p className="mt-3 text-2xl font-bold text-slate-900">
                    {displayStat(stat.value)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{stat.note}</p>
                </div>
              );
            })}
          </div>

          {statsError && (
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <p>
                Statistik belum dapat dimuat. Periksa koneksi Supabase dan
                kebijakan akses SELECT pada tabel reports.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* TENTANG LAPORTOD */}
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Tentang LaporTOD
            </p>

            <h2 className="mt-3 max-w-xl text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
              Satu tempat untuk melaporkan fasilitas kawasan TOD Tangsel.
            </h2>

            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
              LaporTOD membantu warga Tangerang Selatan melaporkan kerusakan fasilitas 
              di kawasan Transit Oriented Development (TOD) yaitu area sekitar stasiun atau terminal transit 
              yang dirancang terintegrasi dengan pejalan kaki dan transportasi publik. 
              Dengan informasi lokasi presisi dan data terstruktur, 
              perkembangannya dapat dipantau secara transparan.
            </p>

            <Link
              to="/peta"
              className="mt-5 inline-flex items-center gap-2 font-semibold text-emerald-800 transition hover:gap-3"
            >
              Jelajahi peta
              <ArrowRight size={18} />
            </Link>
          </div>

          {/* Grid ini tidak menggunakan translate-y sehingga kartu tidak bertumpuk */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <MapPinned size={23} />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">
                Lokasi lebih jelas
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Gunakan peta untuk menentukan titik fasilitas publik di kawasan TOD yang perlu
                diperbaiki.
              </p>
            </div>

            <div className="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <ClipboardCheck size={23} />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">
                Status terpantau
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Ketahui perkembangan laporan melalui status yang tercatat
                di sistem.
              </p>
            </div>

            <div className="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <Camera size={23} />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">
                Bukti foto
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Tambahkan foto untuk membantu menjelaskan kondisi fasilitas
                yang dilaporkan.
              </p>
            </div>

            <div className="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                <Users size={23} />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">
                Kolaborasi warga
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Berpartisipasi menjaga fasilitas publik di kawasan TOD agar lebih nyaman
                digunakan bersama.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CARA KERJA */}
      <section className="bg-white py-10 sm:py-12">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Cara kerja
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Melaporkan masalah jadi lebih mudah
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
              Tiga langkah sederhana untuk membantu menyampaikan kondisi
              fasilitas publik di kawasan TOD.
            </p>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {steps.map((step) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.number}
                  className="rounded-2xl border border-slate-200 bg-[#fbfcfb] p-5 transition hover:border-emerald-200 hover:shadow-md sm:p-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                      <Icon size={23} />
                    </div>
                    <span className="text-2xl font-bold text-emerald-200">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-slate-900">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-12 lg:px-10">
        <div className="relative overflow-hidden rounded-3xl bg-emerald-800 px-6 py-8 sm:px-9 sm:py-10">
          <div className="pointer-events-none absolute -right-10 -top-20 h-56 w-56 rounded-full border-[35px] border-white/5" />

          <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                Berkontribusi sekarang
              </p>

              <h2 className="mt-2 text-2xl font-bold leading-tight text-white sm:text-3xl">
                Mari jaga fasilitas kawasan TOD bersama.
              </h2>

              <p className="mt-3 text-sm leading-6 text-emerald-100 sm:text-base">
                Bantu dokumentasikan masalah fasilitas publik di kawasan TOD Tangsel dan 
                pantau perkembangannya melalui LaporTOD.
              </p>
            </div>

            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={handleMainAction}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50"
              >
                {isStaff
                  ? "Kelola Laporan"
                  : user
                    ? "Buat Laporan"
                    : "Jelajahi Peta"}
                <ArrowUpRight size={18} />
              </button>

              <Link
                to="/peta"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                <Search size={17} />
                Lihat Persebaran
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
