import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ClipboardList,
  ExternalLink,
  FileText,
  LoaderCircle,
  MapPin,
  MessageSquare,
  Plus,
  RefreshCw,
  X,
  Camera,
  Eye,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

const filters = [
  { label: "Semua", value: "Semua" },
  { label: "Menunggu", value: "Pending" },
  { label: "Diproses", value: "Diproses" },
  { label: "Selesai", value: "Selesai" },
];

const statusConfig = {
  Pending: {
    label: "Menunggu",
    icon: Clock3,
    badge: "bg-amber-50 text-amber-700 ring-amber-200",
    dot: "bg-amber-500",
    description: "Menunggu tindak lanjut petugas.",
  },
  Diproses: {
    label: "Sedang Diproses",
    icon: RefreshCw,
    badge: "bg-blue-50 text-blue-700 ring-blue-200",
    dot: "bg-blue-500",
    description: "Sedang ditangani petugas.",
  },
  Selesai: {
    label: "Selesai",
    icon: CheckCircle2,
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    dot: "bg-emerald-500",
    description: "Laporan telah selesai ditangani.",
  },
};

function formatDate(date) {
  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.Pending;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold ring-1 ring-inset ${config.badge}`}
    >
      <Icon size={13} />
      {config.label}
    </span>
  );
}

function EmptyState({ filter }) {
  const filtered = filter !== "Semua";

  return (
    <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-5 py-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800">
        <ClipboardList size={27} />
      </div>

      <h2 className="mt-4 text-lg font-bold text-stone-900">
        {filtered
          ? `Belum ada laporan ${filter === "Pending" ? "menunggu" : filter.toLowerCase()}`
          : "Belum ada laporan"}
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-500">
        {filtered
          ? "Coba pilih filter status lainnya."
          : "Bantu menjaga fasilitas publik dengan mengirim laporan pertamamu."}
      </p>

      {filtered ? (
        <Link
          to="/laporan-saya"
          className="mt-4 inline-flex items-center rounded-full border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50"
        >
          Lihat Semua
        </Link>
      ) : (
        <Link
          to="/buat-laporan"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900"
        >
          <Plus size={16} />
          Buat Laporan
        </Link>
      )}
    </div>
  );
}

/* KARTU LAPORAN RINGKAS */
function ReportCard({ report, responseCount, onDetail }) {
  const config = statusConfig[report.status] || statusConfig.Pending;

  const hasCoordinates =
    report.latitude != null && report.longitude != null;

  const mapUrl = hasCoordinates
    ? `https://www.openstreetmap.org/?mlat=${report.latitude}&mlon=${report.longitude}#map=17/${report.latitude}/${report.longitude}`
    : null;

  return (
    <article className="overflow-hidden rounded-2xl border border-stone-200 bg-white transition hover:border-emerald-200 hover:shadow-sm">
      <div className="flex gap-3 p-3 sm:gap-4 sm:p-4">
        {/* Foto dibuat tetap agar kartu tidak memanjang */}
        <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-stone-100 sm:h-32 sm:w-32">
          {report.photo_url ? (
            <img
              src={report.photo_url}
              alt={`Foto ${report.title}`}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-1 text-stone-400">
              <FileText size={25} />
              <span className="text-[10px]">Tanpa foto</span>
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <span className="max-w-full truncate rounded-md bg-stone-100 px-2 py-1 text-[11px] font-medium text-stone-600">
              {report.category}
            </span>
            <StatusBadge status={report.status} />
          </div>

          <h2 className="mt-2 line-clamp-2 break-words text-sm font-bold leading-5 text-stone-900 sm:text-base sm:leading-6">
            {report.title}
          </h2>

          <p className="mt-1 line-clamp-2 text-xs leading-5 text-stone-500 sm:text-sm">
            {report.description}
          </p>

          <div className="mt-2 flex min-w-0 items-center gap-1.5 text-xs text-stone-500">
            <MapPin size={14} className="shrink-0 text-emerald-700" />
            <span className="truncate">
              {report.location_name || "Lokasi tidak tersedia"}
            </span>
          </div>

          <div className="mt-1 flex items-center gap-1.5 text-xs text-stone-400">
            <CalendarDays size={13} className="shrink-0" />
            <span>{formatDate(report.created_at)}</span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onDetail(report)}
              className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg bg-emerald-800 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-900 sm:text-sm"
            >
              <Eye size={15} />
              Lihat Detail
            </button>

            {mapUrl && (
              <a
                href={mapUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Lihat lokasi laporan di peta"
                title="Lihat lokasi"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 text-stone-600 transition hover:bg-stone-50"
              >
                <ExternalLink size={15} />
              </a>
            )}

            {responseCount > 0 ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                <MessageSquare size={14} />
                {responseCount} tanggapan
              </span>
            ) : (
              <span className="text-xs text-stone-400">
                Belum ada tanggapan
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}


/* POP-UP DETAIL LAPORAN */
function ReportDetailModal({
  report,
  responses,
  onClose,
  responsesLoading,
  responsesError,
}) {
  if (!report) return null;

  const hasCoordinates =
    report.latitude != null && report.longitude != null;

  const mapUrl = hasCoordinates
    ? `https://www.openstreetmap.org/?mlat=${report.latitude}&mlon=${report.longitude}#map=17/${report.latitude}/${report.longitude}`
    : null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 top-[76px] z-[100] flex items-center justify-center overflow-y-auto bg-black/50 px-3 py-4 sm:px-5 sm:py-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >


      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-detail-title"
        className="mx-auto flex max-h-[calc(100dvh-108px)] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >

        {/* HEADER */}
        <div className="flex shrink-0 items-center justify-between border-b border-stone-200 px-4 py-3 sm:px-5">
          <div>
            <p className="text-[10px] font-semibold tracking-wider text-emerald-700">
              DETAIL LAPORAN
            </p>
            <h2 className="mt-0.5 text-base font-bold text-stone-900">
              Informasi Laporan
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup detail laporan"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-stone-500 transition hover:bg-stone-100"
          >
            <X size={19} />
          </button>
        </div>

        {/* KONTEN YANG BISA DI-SCROLL */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-stone-400">
              ID: {String(report.id).slice(0, 8).toUpperCase()}
            </span>
            <StatusBadge status={report.status} />
          </div>

          <h3
            id="report-detail-title"
            className="mt-2 break-words text-lg font-bold leading-6 text-stone-900"
          >
            {report.title}
          </h3>

          <p className="mt-1.5 text-xs text-stone-500">
            {report.category} · {formatDate(report.created_at)}
          </p>

          {/* FOTO LAPORAN */}
          {report.photo_url && (
            <a
              href={report.photo_url}
              target="_blank"
              rel="noreferrer"
              className="mt-4 flex max-h-44 items-center justify-center overflow-hidden rounded-xl border border-stone-200 bg-stone-50"
            >
              <img
                src={report.photo_url}
                alt={`Foto laporan ${report.title}`}
                loading="lazy"
                className="max-h-44 w-full object-contain"
              />
            </a>
          )}

          {/* DESKRIPSI */}
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-stone-900">
              Deskripsi
            </h4>
            <p className="mt-1.5 whitespace-pre-wrap break-words text-sm leading-6 text-stone-600">
              {report.description || "Tidak ada deskripsi."}
            </p>
          </div>

          {/* LOKASI */}
          <div className="mt-4 rounded-xl bg-stone-50 p-3">
            <div className="flex items-start gap-2">
              <MapPin
                size={17}
                className="mt-0.5 shrink-0 text-emerald-700"
              />

              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-stone-900">
                  Lokasi
                </h4>

                <p className="mt-1 break-words text-sm leading-5 text-stone-600">
                  {report.location_name || "Lokasi tidak tersedia"}
                </p>

                {mapUrl && (
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:underline"
                  >
                    Lihat di peta
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* TANGGAPAN PETUGAS */}
          <div className="mt-5 border-t border-stone-200 pt-4">
            <div className="flex items-center gap-2">
              <MessageSquare
                size={17}
                className="text-emerald-800"
              />
              <h4 className="text-sm font-bold text-stone-900">
                Tanggapan Petugas
              </h4>
            </div>

            {responsesLoading ? (
              <div className="mt-3 flex items-center gap-2 text-sm text-stone-500">
                <LoaderCircle size={16} className="animate-spin" />
                Memuat tanggapan...
              </div>
            ) : responsesError ? (
              <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                Tanggapan belum dapat dimuat. Coba perbarui halaman.
              </p>
            ) : responses.length === 0 ? (
              <div className="mt-3 rounded-xl border border-dashed border-stone-200 bg-stone-50 p-3">
                <p className="text-sm font-medium text-stone-700">
                  Belum ada tanggapan petugas
                </p>
                <p className="mt-1 text-xs leading-5 text-stone-500">
                  Pesan dan foto penanganan akan muncul di sini jika
                  petugas sudah mengirimkannya.
                </p>
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                {responses.map((response) => (
                  <article
                    key={response.id}
                    className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-emerald-900">
                        Petugas LaporTOD
                      </span>

                      <span className="text-[11px] text-stone-500">
                        {formatDate(response.created_at)}
                      </span>
                    </div>

                    {response.message && (
                      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-stone-700">
                        {response.message}
                      </p>
                    )}

                    {response.photo_url && (
                      <div className="mt-3">
                        <a
                          href={response.photo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex max-h-44 items-center justify-center overflow-hidden rounded-lg border border-stone-200 bg-white"
                        >
                          <img
                            src={response.photo_url}
                            alt="Foto penanganan petugas"
                            loading="lazy"
                            className="max-h-44 w-full object-contain"
                          />
                        </a>

                        <a
                          href={response.photo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-emerald-800 hover:underline"
                        >
                          <Camera size={13} />
                          Lihat foto penanganan
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex shrink-0 justify-end border-t border-stone-200 bg-white px-4 py-3 sm:px-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
          >
            Tutup
          </button>
        </div>
      </section>
    </div>
  );
}

export default function MyReports() {
  const { user, loading: authLoading } = useAuth();

  const [reports, setReports] = useState([]);
  const [responsesByReport, setResponsesByReport] = useState({});
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [selectedReport, setSelectedReport] = useState(null);

  const [loading, setLoading] = useState(true);
  const [responsesLoading, setResponsesLoading] = useState(false);
  const [error, setError] = useState("");
  const [responsesError, setResponsesError] = useState(false);

  const fetchReports = useCallback(async () => {
    if (!user?.id) {
      setReports([]);
      setResponsesByReport({});
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    setResponsesError(false);
    setResponsesLoading(false);

    try {
      const { data, error: fetchError } = await supabase
        .from("reports")
        .select(
          "id, title, category, description, location_name, latitude, longitude, photo_url, status, created_at"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      const reportList = data || [];
      setReports(reportList);

      if (reportList.length === 0) {
        setResponsesByReport({});
        return;
      }

      setResponsesLoading(true);

      const reportIds = reportList.map((report) => report.id);

      const {
        data: responseData,
        error: responseFetchError,
      } = await supabase
        .from("report_responses")
        .select("id, report_id, staff_id, message, photo_url, created_at")
        .in("report_id", reportIds)
        .order("created_at", { ascending: false });

      if (responseFetchError) throw responseFetchError;

      const grouped = {};

      for (const response of responseData || []) {
        if (!grouped[response.report_id]) {
          grouped[response.report_id] = [];
        }

        grouped[response.report_id].push(response);
      }

      setResponsesByReport(grouped);
    } catch (err) {
      console.error("Gagal mengambil laporan atau tanggapan:", err);

      if (!reports.length) {
        setError(
          "Laporan belum dapat dimuat. Periksa koneksi atau konfigurasi akses Supabase, lalu coba lagi."
        );
      } else {
        setResponsesError(true);
      }
    } finally {
      setLoading(false);
      setResponsesLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (authLoading) return;

    if (!user?.id) {
      setReports([]);
      setResponsesByReport({});
      setLoading(false);
      return;
    }

    fetchReports();
  }, [authLoading, user?.id, fetchReports]);

  // Tutup pop-up menggunakan tombol Escape.
  useEffect(() => {
    if (!selectedReport) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") setSelectedReport(null);
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedReport]);

  const filteredReports =
    activeFilter === "Semua"
      ? reports
      : reports.filter((report) => report.status === activeFilter);

  const counts = {
    Semua: reports.length,
    Pending: reports.filter((report) => report.status === "Pending").length,
    Diproses: reports.filter((report) => report.status === "Diproses").length,
    Selesai: reports.filter((report) => report.status === "Selesai").length,
  };

  if (authLoading) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center bg-[#fafbf8]">
        <div className="flex flex-col items-center gap-3 text-stone-500">
          <LoaderCircle
            size={30}
            className="animate-spin text-emerald-800"
          />
          <p className="text-sm">Memeriksa akun...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-[#fafbf8] px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-7 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800">
            <ClipboardList size={28} />
          </div>

          <h1 className="mt-4 text-2xl font-bold text-stone-900">
            Laporan Saya
          </h1>

          <p className="mt-2 text-sm leading-6 text-stone-500">
            Masuk ke akunmu untuk melihat laporan dan tanggapan petugas.
          </p>

          <Link
            to="/login"
            state={{ from: "/laporan-saya" }}
            className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-emerald-800 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-900"
          >
            Masuk ke Akun
          </Link>

          <Link
            to="/"
            className="mt-4 inline-flex items-center gap-2 text-sm text-stone-500 hover:text-emerald-800"
          >
            <ArrowLeft size={15} />
            Kembali ke Beranda
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fafbf8]">
      {/* HEADER */}
      <section className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-7 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-emerald-800"
          >
            <ArrowLeft size={15} />
            Kembali ke Beranda
          </Link>

          <div className="mt-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
                <ClipboardList size={13} />
                Pusat Laporan
              </span>

              <h1 className="mt-2 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
                Laporan Saya
              </h1>

              <p className="mt-1 max-w-xl text-sm leading-6 text-stone-500">
                Pantau status laporan dan lihat tanggapan petugas.
              </p>
            </div>

            <Link
              to="/buat-laporan"
              className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-full bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900 sm:self-auto"
            >
              <Plus size={16} />
              Buat Laporan
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        {/* RINGKASAN */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            {
              label: "Total Laporan",
              value: counts.Semua,
              note: "Semua laporan",
              icon: ClipboardList,
              color: "text-emerald-800",
            },
            {
              label: "Menunggu",
              value: counts.Pending,
              note: "Belum ditangani",
              icon: Clock3,
              color: "text-amber-600",
            },
            {
              label: "Diproses",
              value: counts.Diproses,
              note: "Sedang ditangani",
              icon: RefreshCw,
              color: "text-blue-600",
            },
            {
              label: "Selesai",
              value: counts.Selesai,
              note: "Sudah ditangani",
              icon: CheckCircle2,
              color: "text-emerald-600",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="rounded-xl border border-stone-200 bg-white p-3.5 sm:p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-stone-500 sm:text-sm">
                    {item.label}
                  </span>
                  <Icon size={18} className={item.color} />
                </div>

                <p className="mt-2 text-2xl font-bold text-stone-900">
                  {loading ? "—" : item.value}
                </p>
                <p className="mt-0.5 text-xs text-stone-400">{item.note}</p>
              </div>
            );
          })}
        </div>

        {/* DAFTAR */}
        <div className="mt-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-stone-900">
                Riwayat Laporan
              </h2>
              <p className="mt-0.5 text-xs text-stone-500 sm:text-sm">
                {loading
                  ? "Memuat laporan..."
                  : `${filteredReports.length} laporan ditampilkan`}
              </p>
            </div>

            <button
              type="button"
              onClick={fetchReports}
              disabled={loading}
              className="inline-flex min-h-9 items-center justify-center gap-2 self-start rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50 disabled:opacity-60 sm:self-auto"
            >
              <RefreshCw
                size={14}
                className={loading ? "animate-spin" : ""}
              />
              Perbarui
            </button>
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {filters.map((filter) => {
              const active = activeFilter === filter.value;

              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setActiveFilter(filter.value)}
                  className={`inline-flex min-h-9 shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold transition sm:text-sm ${
                    active
                      ? "bg-emerald-800 text-white"
                      : "border border-stone-200 bg-white text-stone-600 hover:border-emerald-300"
                  }`}
                >
                  {filter.label}
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[11px] ${
                      active
                        ? "bg-white/20 text-white"
                        : "bg-stone-100 text-stone-500"
                    }`}
                  >
                    {counts[filter.value]}
                  </span>
                </button>
              );
            })}
          </div>

          {error ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-2.5">
                <AlertCircle
                  size={20}
                  className="mt-0.5 shrink-0 text-red-600"
                />
                <div>
                  <h3 className="text-sm font-semibold text-red-800">
                    Gagal memuat laporan
                  </h3>
                  <p className="mt-1 text-sm leading-5 text-red-700">
                    {error}
                  </p>
                  <button
                    type="button"
                    onClick={fetchReports}
                    className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-700 px-3 py-2 text-sm font-semibold text-white hover:bg-red-800"
                  >
                    <RefreshCw size={14} />
                    Coba Lagi
                  </button>
                </div>
              </div>
            </div>
          ) : loading ? (
            <div className="flex min-h-48 flex-col items-center justify-center gap-3">
              <LoaderCircle
                size={28}
                className="animate-spin text-emerald-800"
              />
              <p className="text-sm text-stone-500">
                Memuat riwayat laporan...
              </p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="mt-4">
              <EmptyState filter={activeFilter} />
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {filteredReports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  responseCount={
                    (responsesByReport[report.id] || []).length
                  }
                  onDetail={setSelectedReport}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* POP-UP */}
      <ReportDetailModal
        report={selectedReport}
        responses={
          selectedReport
            ? responsesByReport[selectedReport.id] || []
            : []
        }
        onClose={() => setSelectedReport(null)}
        responsesLoading={responsesLoading}
        responsesError={responsesError}
      />
    </main>
  );
}
