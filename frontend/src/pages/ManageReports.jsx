import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import * as XLSX from "xlsx";
import {
  FileSpreadsheet,
  Search,
  ClipboardList,
  Clock3,
  CheckCircle2,
  RefreshCw,
  MapPin,
  CalendarDays,
  Eye,
  ExternalLink,
  X,
  LoaderCircle,
  AlertCircle,
  ShieldCheck,
  Filter,
  ChevronDown,
  Image as ImageIcon,
  MessageSquare,
  Camera,
  Send,
  Trash2,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { supabase } from "../lib/supabase";
import { REPORT_CATEGORIES } from "../constants/reportCategories";

const STATUS_OPTIONS = ["Pending", "Diproses", "Selesai"];
const RESPONSE_BUCKET = "report-responses";
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

const STATUS_STYLES = {
  Pending: "bg-amber-50 text-amber-800 ring-amber-200",
  Diproses: "bg-blue-50 text-blue-800 ring-blue-200",
  Selesai: "bg-emerald-50 text-emerald-800 ring-emerald-200",
};

const STATUSES = [
  {
    label: "Total Laporan",
    key: "total",
    icon: ClipboardList,
    iconClass: "text-slate-700 bg-slate-100",
  },
  {
    label: "Menunggu",
    key: "pending",
    icon: Clock3,
    iconClass: "text-amber-700 bg-amber-50",
  },
  {
    label: "Diproses",
    key: "processing",
    icon: RefreshCw,
    iconClass: "text-blue-700 bg-blue-50",
  },
  {
    label: "Selesai",
    key: "completed",
    icon: CheckCircle2,
    iconClass: "text-emerald-700 bg-emerald-50",
  },
];

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
        STATUS_STYLES[status] ||
        "bg-stone-100 text-stone-700 ring-stone-200"
      }`}
    >
      {status || "Pending"}
    </span>
  );
}

function StatCard({ item, value, loading }) {
  const Icon = item.icon;

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-stone-500">{item.label}</p>
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${item.iconClass}`}
        >
          <Icon size={18} />
        </div>
      </div>

      <p className="mt-3 text-3xl font-semibold tracking-tight text-stone-900">
        {loading ? "—" : value}
      </p>
    </div>
  );
}

function DetailModal({
  report,
  responses,
  responsesLoading,
  onClose,
  onStatusChange,
  onSaveResponse,
  updatingId,
  savingResponse,
}) {
  const [nextStatus, setNextStatus] = useState(report.status || "Pending");
  const [message, setMessage] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [formError, setFormError] = useState("");

  const isUpdating = updatingId === report.id;
  const isBusy = isUpdating || savingResponse;

  useEffect(() => {
    setNextStatus(report.status || "Pending");
  }, [report.id, report.status]);

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreview("");
      return;
    }

    const objectUrl = URL.createObjectURL(photoFile);
    setPhotoPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [photoFile]);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape" && !isBusy) onClose();
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose, isBusy]);

  function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setFormError("Gunakan foto JPG, PNG, atau WebP.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_PHOTO_SIZE) {
      setFormError("Ukuran foto maksimal 5 MB.");
      event.target.value = "";
      return;
    }

    setFormError("");
    setPhotoFile(file);
  }

  async function handleSubmitResponse(event) {
    event.preventDefault();
    setFormError("");

    const trimmedMessage = message.trim();

    if (!trimmedMessage && !photoFile) {
      setFormError("Isi tanggapan atau pilih foto terlebih dahulu.");
      return;
    }

    const success = await onSaveResponse({
      report,
      message: trimmedMessage,
      photoFile,
    });

    if (success) {
      setMessage("");
      setPhotoFile(null);
      setFormError("");

      const fileInput = document.getElementById("response-photo");
      if (fileInput) fileInput.value = "";
    }
  }

  return (
    <div
      className="fixed inset-0 z-[3000] flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-[2px] sm:items-center sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isBusy) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-detail-title"
        className="max-h-[94dvh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
      >
        <div className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-stone-200 bg-white/95 px-5 py-4 backdrop-blur sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
              Panel Petugas
            </p>
            <h2
              id="report-detail-title"
              className="mt-1 text-lg font-semibold text-stone-900"
            >
              Detail dan penanganan laporan
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            aria-label="Tutup detail"
            className="flex h-10 w-10 items-center justify-center rounded-full text-stone-500 hover:bg-stone-100 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 p-5 sm:p-6">
          {report.photo_url ? (
            <a
              href={report.photo_url}
              target="_blank"
              rel="noreferrer"
              className="block overflow-hidden rounded-2xl bg-stone-100"
            >
              <img
                src={report.photo_url}
                alt={`Foto laporan ${report.title}`}
                className="max-h-80 w-full object-contain"
              />
            </a>
          ) : (
            <div className="flex min-h-28 flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-stone-50 text-stone-400">
              <ImageIcon size={26} />
              <p className="mt-2 text-sm">Tidak ada foto laporan awal</p>
            </div>
          )}

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={report.status} />
              <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-600">
                {report.category}
              </span>
            </div>

            <h3 className="mt-3 break-words text-xl font-semibold text-stone-900">
              {report.title}
            </h3>

            <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-stone-600">
              {report.description}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-stone-200 p-4">
              <div className="flex items-center gap-2 text-stone-500">
                <MapPin size={16} />
                <span className="text-xs font-medium">Lokasi</span>
              </div>

              <p className="mt-2 break-words text-sm font-medium text-stone-800">
                {report.location_name || "Lokasi tidak tersedia"}
              </p>

              <p className="mt-1 break-all text-xs text-stone-500">
                {report.latitude}, {report.longitude}
              </p>

              {report.latitude != null && report.longitude != null && (
                <a
                  href={`https://www.openstreetmap.org/?mlat=${report.latitude}&mlon=${report.longitude}#map=18/${report.latitude}/${report.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-700"
                >
                  Buka peta <ExternalLink size={12} />
                </a>
              )}
            </div>

            <div className="rounded-xl border border-stone-200 p-4">
              <div className="flex items-center gap-2 text-stone-500">
                <CalendarDays size={16} />
                <span className="text-xs font-medium">Waktu laporan</span>
              </div>

              <p className="mt-2 text-sm font-medium text-stone-800">
                {formatDateTime(report.created_at)}
              </p>

              <p className="mt-2 text-xs text-stone-500">ID laporan</p>
              <p className="mt-1 break-all font-mono text-[11px] text-stone-500">
                {report.id}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
            <h3 className="text-sm font-semibold text-stone-900">
              Status penanganan
            </h3>

            <p className="mt-1 text-xs leading-5 text-stone-500">
              Perbarui status sesuai perkembangan penanganan laporan.
            </p>

            <div className="relative mt-3">
              <select
                value={nextStatus}
                onChange={(event) => setNextStatus(event.target.value)}
                disabled={isBusy}
                className="min-h-12 w-full appearance-none rounded-xl border border-stone-200 bg-white px-4 py-3 pr-10 text-sm outline-none focus:border-blue-600 disabled:opacity-60"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-stone-400"
              />
            </div>

            <button
              type="button"
              disabled={isBusy || nextStatus === report.status}
              onClick={() => onStatusChange(report, nextStatus)}
              className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-600"
            >
              {isUpdating ? (
                <>
                  <LoaderCircle size={17} className="animate-spin" />
                  Menyimpan status...
                </>
              ) : (
                <>
                  <RefreshCw size={16} />
                  Simpan status
                </>
              )}
            </button>
          </div>

          <form
            onSubmit={handleSubmitResponse}
            className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 sm:p-5"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                <MessageSquare size={20} />
              </div>

              <div>
                <h3 className="font-semibold text-stone-900">
                  Tanggapan petugas
                </h3>

                <p className="mt-1 text-xs leading-5 text-stone-500">
                  Pesan dan foto bersifat opsional. Isi salah satu atau
                  keduanya jika ingin memberikan informasi kepada warga.
                </p>
              </div>
            </div>

            <label
              htmlFor="response-message"
              className="mt-5 block text-sm font-medium text-stone-800"
            >
              Pesan untuk warga
              <span className="ml-1 font-normal text-stone-400">
                (opsional)
              </span>
            </label>

            <textarea
              id="response-message"
              rows={4}
              maxLength={2000}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              disabled={savingResponse}
              placeholder="Contoh: Laporan sudah kami periksa. Perbaikan dijadwalkan oleh tim terkait."
              className="mt-2 w-full resize-y rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm leading-6 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:opacity-60"
            />

            <p className="mt-1 text-right text-xs text-stone-400">
              {message.length}/2000 karakter
            </p>

            <label
              htmlFor="response-photo"
              className="mt-4 block text-sm font-medium text-stone-800"
            >
              Foto penanganan
              <span className="ml-1 font-normal text-stone-400">
                (opsional)
              </span>
            </label>

            <label
              htmlFor="response-photo"
              className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-emerald-300 bg-white px-4 py-5 text-center transition hover:bg-emerald-50"
            >
              <Camera size={25} className="text-emerald-700" />

              <span className="mt-2 text-sm font-semibold text-stone-700">
                {photoFile ? photoFile.name : "Pilih foto penanganan"}
              </span>

              <span className="mt-1 text-xs text-stone-500">
                JPG, PNG, atau WebP · Maksimal 5 MB
              </span>

              <input
                id="response-photo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoChange}
                disabled={savingResponse}
                className="sr-only"
              />
            </label>

            {photoPreview && (
              <div className="mt-3 rounded-xl border border-stone-200 bg-white p-3">
                <img
                  src={photoPreview}
                  alt="Pratinjau foto penanganan"
                  className="max-h-64 w-full rounded-lg object-contain"
                />

                <button
                  type="button"
                  onClick={() => {
                    setPhotoFile(null);
                    const input = document.getElementById("response-photo");
                    if (input) input.value = "";
                  }}
                  disabled={savingResponse}
                  className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-red-700"
                >
                  <Trash2 size={14} />
                  Hapus foto pilihan
                </button>
              </div>
            )}

            {formError && (
              <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                {formError}
              </p>
            )}

            <button
              type="submit"
              disabled={savingResponse}
              className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingResponse ? (
                <>
                  <LoaderCircle size={17} className="animate-spin" />
                  Menyimpan tanggapan...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Kirim tanggapan ke warga
                </>
              )}
            </button>
          </form>

          <section>
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold text-stone-900">
                Riwayat tanggapan
              </h3>

              <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-600">
                {responses.length} tanggapan
              </span>
            </div>

            {responsesLoading ? (
              <div className="mt-4 flex items-center gap-2 py-5 text-sm text-stone-500">
                <LoaderCircle size={18} className="animate-spin" />
                Memuat tanggapan...
              </div>
            ) : responses.length === 0 ? (
              <div className="mt-3 rounded-xl border border-dashed border-stone-300 p-5 text-center">
                <MessageSquare
                  size={23}
                  className="mx-auto text-stone-400"
                />
                <p className="mt-2 text-sm text-stone-600">
                  Belum ada tanggapan petugas.
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {responses.map((response) => (
                  <article
                    key={response.id}
                    className="rounded-xl border border-stone-200 bg-white p-4"
                  >
                    <p className="text-xs text-stone-500">
                      Petugas · {formatDateTime(response.created_at)}
                    </p>

                    {response.message && (
                      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-stone-700">
                        {response.message}
                      </p>
                    )}

                    {response.photo_url && (
                      <a
                        href={response.photo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-block"
                      >
                        <img
                          src={response.photo_url}
                          alt="Foto penanganan petugas"
                          className="max-h-64 rounded-xl border border-stone-200 object-contain"
                        />

                        <span className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-700">
                          Lihat foto <ExternalLink size={12} />
                        </span>
                      </a>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
    </div>
  );
}

export default function ManageReports() {
  const { user, role, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pageError, setPageError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [categoryFilter, setCategoryFilter] = useState("Semua kategori");
  const [selectedReport, setSelectedReport] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [savingResponse, setSavingResponse] = useState(false);
  const [responses, setResponses] = useState([]);
  const [responsesLoading, setResponsesLoading] = useState(false);

  const fetchReports = useCallback(async ({ silent = false } = {}) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setPageError("");

    try {
      const { data, error } = await supabase
        .from("reports")
        .select(
          "id, user_id, title, category, description, location_name, latitude, longitude, photo_url, status, created_at, updated_at"
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      const list = data || [];
      setReports(list);

      setSelectedReport((current) => {
        if (!current) return null;
        return list.find((item) => item.id === current.id) || null;
      });
    } catch (error) {
      console.error("Gagal mengambil laporan:", error);

      setPageError(
        error.message ||
          "Laporan gagal dimuat. Periksa koneksi dan kebijakan akses Supabase."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchResponses = useCallback(
    async (reportId) => {
      setResponsesLoading(true);

      try {
        const { data, error } = await supabase
          .from("report_responses")
          .select("id, report_id, staff_id, message, photo_url, created_at")
          .eq("report_id", reportId)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setResponses(data || []);
      } catch (error) {
        console.error("Gagal memuat tanggapan:", error);
        setResponses([]);

        showToast({
          type: "error",
          title: "Tanggapan gagal dimuat",
          message:
            "Periksa tabel report_responses dan kebijakan akses Supabase.",
        });
      } finally {
        setResponsesLoading(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    if (!authLoading && user && role === "petugas") {
      fetchReports();
    }
  }, [authLoading, user, role, fetchReports]);

  useEffect(() => {
    if (selectedReport?.id) {
      fetchResponses(selectedReport.id);
    } else {
      setResponses([]);
    }
  }, [selectedReport?.id, fetchResponses]);

  const counts = useMemo(
    () => ({
      total: reports.length,
      pending: reports.filter((item) => item.status === "Pending").length,
      processing: reports.filter((item) => item.status === "Diproses").length,
      completed: reports.filter((item) => item.status === "Selesai").length,
    }),
    [reports]
  );

  const filteredReports = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return reports.filter((report) => {
      const matchesSearch =
        !keyword ||
        [
          report.title,
          report.description,
          report.location_name,
          report.category,
        ].some((value) => (value || "").toLowerCase().includes(keyword));

      const matchesStatus =
        statusFilter === "Semua" || report.status === statusFilter;

      const matchesCategory =
        categoryFilter === "Semua kategori" ||
        report.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [reports, search, statusFilter, categoryFilter]);

  const hasFilters =
    Boolean(search.trim()) ||
    statusFilter !== "Semua" ||
    categoryFilter !== "Semua kategori";

  function resetFilters() {
    setSearch("");
    setStatusFilter("Semua");
    setCategoryFilter("Semua kategori");
  }

  function handleDownloadExcel() {
    if (role !== "petugas" || filteredReports.length === 0) return;

    const exportData = filteredReports.map((report, index) => ({
      "No.": index + 1,
      "ID Laporan": report.id,
      "Judul Laporan": report.title || "-",
      Kategori: report.category || "-",
      Deskripsi: report.description || "-",
      Lokasi: report.location_name || "-",
      Latitude: report.latitude ?? "-",
      Longitude: report.longitude ?? "-",
      Status: report.status || "Pending",
      "Tanggal Laporan": report.created_at
        ? formatDateTime(report.created_at)
        : "-",
      "Terakhir Diperbarui": report.updated_at
        ? formatDateTime(report.updated_at)
        : "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    worksheet["!cols"] = [
      { wch: 6 },
      { wch: 38 },
      { wch: 30 },
      { wch: 22 },
      { wch: 45 },
      { wch: 35 },
      { wch: 14 },
      { wch: 14 },
      { wch: 16 },
      { wch: 24 },
      { wch: 24 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Laporan");

    const tanggal = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `Laporan-LaporTOD-${tanggal}.xlsx`);

    showToast({
      type: "success",
      title: "Download berhasil",
      message: `${filteredReports.length} laporan berhasil diekspor ke Excel.`,
    });
  }

  async function handleStatusChange(report, nextStatus) {
    if (!user || role !== "petugas" || updatingId || savingResponse) return;

    if (!STATUS_OPTIONS.includes(nextStatus)) {
      showToast({
        type: "error",
        title: "Status tidak valid",
        message: "Pilih status penanganan yang tersedia.",
      });
      return;
    }

    if (nextStatus === report.status) return;

    setUpdatingId(report.id);

    try {
      const { data, error } = await supabase
        .from("reports")
        .update({
          status: nextStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", report.id)
        .select(
          "id, user_id, title, category, description, location_name, latitude, longitude, photo_url, status, created_at, updated_at"
        )
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        throw new Error(
          "Perubahan tidak tersimpan. Periksa kebijakan UPDATE RLS untuk petugas."
        );
      }

      setReports((current) =>
        current.map((item) => (item.id === data.id ? data : item))
      );
      setSelectedReport(data);

      showToast({
        type: "success",
        title: "Status berhasil diperbarui",
        message: `Status laporan sekarang ${nextStatus}.`,
      });
    } catch (error) {
      console.error("Gagal memperbarui status:", error);

      showToast({
        type: "error",
        title: "Gagal memperbarui status",
        message: error.message || "Terjadi kesalahan saat menyimpan status.",
      });
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleSaveResponse({ report, message, photoFile }) {
    if (!user || role !== "petugas" || savingResponse) return false;

    if (!message && !photoFile) {
      showToast({
        type: "error",
        title: "Tanggapan masih kosong",
        message: "Isi pesan atau pilih foto terlebih dahulu.",
      });
      return false;
    }

    setSavingResponse(true);
    let uploadedPath = null;

    try {
      let photoUrl = null;

      if (photoFile) {
        const extension =
          photoFile.name.split(".").pop()?.toLowerCase() || "jpg";

        const filePath = `${report.id}/${user.id}/${crypto.randomUUID()}.${extension}`;

        const { data: uploaded, error: uploadError } = await supabase.storage
          .from(RESPONSE_BUCKET)
          .upload(filePath, photoFile, {
            contentType: photoFile.type,
            upsert: false,
          });

        if (uploadError) throw uploadError;

        uploadedPath = uploaded.path;

        const { data: publicUrlData } = supabase.storage
          .from(RESPONSE_BUCKET)
          .getPublicUrl(uploaded.path);

        photoUrl = publicUrlData.publicUrl;
      }

      const { data, error } = await supabase
        .from("report_responses")
        .insert({
          report_id: report.id,
          staff_id: user.id,
          message: message || null,
          photo_url: photoUrl,
        })
        .select("id, report_id, staff_id, message, photo_url, created_at")
        .single();

      if (error) throw error;

      setResponses((current) => [data, ...current]);

      showToast({
        type: "success",
        title: "Tanggapan berhasil dikirim",
        message:
          "Tanggapan tersimpan dan dapat ditampilkan kepada pemilik laporan.",
      });

      return true;
    } catch (error) {
      console.error("Gagal menyimpan tanggapan:", error);

      if (uploadedPath) {
        const { error: cleanupError } = await supabase.storage
          .from(RESPONSE_BUCKET)
          .remove([uploadedPath]);

        if (cleanupError) {
          console.error(
            "Gagal membersihkan foto yang tidak tersimpan:",
            cleanupError
          );
        }
      }

      showToast({
        type: "error",
        title: "Gagal mengirim tanggapan",
        message:
          error.message ||
          "Periksa tabel report_responses, bucket foto, dan kebijakan RLS.",
      });

      return false;
    } finally {
      setSavingResponse(false);
    }
  }

  if (authLoading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-5">
        <div className="flex flex-col items-center gap-3 text-stone-500">
          <LoaderCircle size={30} className="animate-spin text-blue-700" />
          <p className="text-sm">Memeriksa akun...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <Navigate to="/login" replace state={{ from: "/kelola-laporan" }} />
    );
  }

  if (role !== "petugas") {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="min-h-[65vh] overflow-x-hidden bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-800">
                <ShieldCheck size={14} />
                PANEL PETUGAS
              </div>

              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
                Kelola Laporan
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500 sm:text-base">
                Tinjau laporan warga, ubah status, serta kirim tanggapan dan
                foto penanganan secara opsional.
              </p>
            </div>

            {/* AKSI HALAMAN */}
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-start">
              <Link
                to="/peta"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
              >
                <MapPin size={17} />
                Lihat peta
              </Link>

              <button
                type="button"
                onClick={() => fetchReports({ silent: true })}
                disabled={loading || refreshing}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? "animate-spin" : ""}
                />
                Perbarui
              </button>

              {/* DOWNLOAD DAN KETERANGAN DALAM SATU KOLOM */}
              <div className="flex min-w-0 flex-col gap-1 sm:max-w-56">
                <button
                  type="button"
                  onClick={handleDownloadExcel}
                  disabled={loading || filteredReports.length === 0}
                  className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FileSpreadsheet size={17} />
                  Download Excel
                </button>

                <p className="text-xs leading-5 text-stone-500 sm:max-w-56">
                  Unduh laporan sesuai pencarian dan filter yang aktif.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {STATUSES.map((item) => (
              <StatCard
                key={item.key}
                item={item}
                value={counts[item.key]}
                loading={loading}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {pageError && (
          <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center">
            <AlertCircle size={22} className="shrink-0 text-red-600" />
            <p className="flex-1 break-words text-sm leading-6 text-red-700">
              {pageError}
            </p>
            <button
              type="button"
              onClick={() => fetchReports()}
              className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
            >
              <RefreshCw size={15} />
              Coba lagi
            </button>
          </div>
        )}

        {/* FILTER */}
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <Search
                size={18}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari judul, lokasi, kategori, atau deskripsi..."
                aria-label="Cari laporan"
                className="min-h-12 w-full rounded-xl border border-stone-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:w-auto">
              <div className="relative">
                <Filter
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                />

                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  aria-label="Filter status"
                  className="min-h-12 w-full appearance-none rounded-xl border border-stone-200 py-3 pl-9 pr-9 text-sm outline-none focus:border-blue-600 sm:min-w-40"
                >
                  <option value="Semua">Semua status</option>
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-400"
                />
              </div>

              <div className="relative">
                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  aria-label="Filter kategori"
                  className="min-h-12 w-full appearance-none rounded-xl border border-stone-200 px-3 py-3 pr-9 text-sm outline-none focus:border-blue-600 sm:min-w-48"
                >
                  <option value="Semua kategori">Semua kategori</option>
                  {REPORT_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-400"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 pt-3">
            <p className="text-sm text-stone-500">
              Menampilkan{" "}
              <span className="font-semibold text-stone-800">
                {loading ? "—" : filteredReports.length}
              </span>{" "}
              dari {loading ? "—" : reports.length} laporan
            </p>

            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-sm font-semibold text-blue-700 hover:text-blue-900"
              >
                Reset filter
              </button>
            )}
          </div>
        </div>

        {/* DAFTAR LAPORAN */}
        <div className="mt-5 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-2 border-b border-stone-200 px-4 py-4 sm:flex-row sm:items-center sm:px-5">
            <div>
              <h2 className="font-semibold text-stone-900">
                Semua laporan masuk
              </h2>
              <p className="mt-1 text-xs text-stone-500">
                Urut dari laporan yang paling baru dikirim.
              </p>
            </div>

            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-600">
              <ClipboardList size={14} />
              {filteredReports.length} laporan
            </span>
          </div>

          {loading ? (
            <div className="flex min-h-56 flex-col items-center justify-center gap-3 p-6">
              <LoaderCircle
                size={30}
                className="animate-spin text-blue-700"
              />
              <p className="text-sm text-stone-500">
                Mengambil data dari Supabase...
              </p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="flex min-h-56 flex-col items-center justify-center px-5 py-10 text-center">
              <ClipboardList size={28} className="text-stone-400" />

              <h3 className="mt-3 font-semibold text-stone-800">
                {hasFilters ? "Laporan tidak ditemukan" : "Belum ada laporan"}
              </h3>

              <p className="mt-2 max-w-md text-sm text-stone-500">
                {hasFilters
                  ? "Coba ganti kata kunci atau filter."
                  : "Laporan yang dikirim warga akan muncul di halaman ini."}
              </p>

              {hasFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-3 text-sm font-semibold text-blue-700"
                >
                  Reset filter
                </button>
              )}
            </div>
          ) : (
            <>
              {/* MOBILE */}
              <div className="divide-y divide-stone-100 md:hidden">
                {filteredReports.map((report) => (
                  <article key={report.id} className="p-4">
                    <div className="flex items-start gap-3">
                      {report.photo_url ? (
                        <img
                          src={report.photo_url}
                          alt=""
                          className="h-20 w-20 shrink-0 rounded-xl border border-stone-200 bg-stone-100 object-cover"
                        />
                      ) : (
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-400">
                          <ImageIcon size={24} />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <StatusBadge status={report.status} />

                        <h3 className="mt-2 break-words text-sm font-semibold text-stone-900">
                          {report.title}
                        </h3>

                        <p className="mt-1 break-words text-xs text-stone-500">
                          {report.location_name}
                        </p>

                        <p className="mt-1 text-xs text-stone-400">
                          {formatDate(report.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <span className="rounded-lg bg-stone-100 px-2.5 py-1.5 text-xs text-stone-600">
                        {report.category}
                      </span>

                      <button
                        type="button"
                        onClick={() => setSelectedReport(report)}
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-blue-700 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-800"
                      >
                        <Eye size={15} />
                        Detail & tanggapan
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              {/* DESKTOP */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[780px] border-collapse text-left">
                  <thead className="bg-stone-50">
                    <tr className="border-b border-stone-200 text-xs font-semibold uppercase tracking-wide text-stone-500">
                      <th className="px-5 py-4">Laporan</th>
                      <th className="px-4 py-4">Kategori</th>
                      <th className="px-4 py-4">Tanggal</th>
                      <th className="px-4 py-4">Status</th>
                      <th className="px-5 py-4 text-right">Aksi</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-stone-100">
                    {filteredReports.map((report) => (
                      <tr
                        key={report.id}
                        className="transition hover:bg-stone-50/70"
                      >
                        <td className="max-w-[350px] px-5 py-4">
                          <div className="flex items-start gap-3">
                            {report.photo_url ? (
                              <img
                                src={report.photo_url}
                                alt=""
                                className="h-14 w-14 shrink-0 rounded-xl border border-stone-200 object-cover"
                              />
                            ) : (
                              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-400">
                                <ImageIcon size={20} />
                              </div>
                            )}

                            <div className="min-w-0">
                              <p className="break-words text-sm font-semibold text-stone-900">
                                {report.title}
                              </p>

                              <p className="mt-1 break-words text-xs text-stone-500">
                                {report.location_name}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="max-w-48 px-4 py-4 text-xs text-stone-600">
                          {report.category}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-xs text-stone-500">
                          {formatDate(report.created_at)}
                        </td>

                        <td className="px-4 py-4">
                          <StatusBadge status={report.status} />
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedReport(report)}
                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800"
                          >
                            <Eye size={15} />
                            Detail & tanggapan
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        <p className="mt-4 text-xs leading-5 text-stone-400">
          Perubahan status dan tanggapan disimpan di Supabase.
        </p>
      </section>

      {selectedReport && (
        <DetailModal
          key={selectedReport.id}
          report={selectedReport}
          responses={responses}
          responsesLoading={responsesLoading}
          onClose={() => {
            if (!updatingId && !savingResponse) setSelectedReport(null);
          }}
          onStatusChange={handleStatusChange}
          onSaveResponse={handleSaveResponse}
          updatingId={updatingId}
          savingResponse={savingResponse}
        />
      )}
    </main>
  );
}
