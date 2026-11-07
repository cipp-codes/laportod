// import { useCallback, useEffect, useMemo, useState } from "react";
// import {
//   MapContainer,
//   TileLayer,
//   CircleMarker,
//   Popup,
//   useMap,
// } from "react-leaflet";
// import { Link } from "react-router-dom";
// import {
//   Search,
//   MapPin,
//   ClipboardList,
//   Clock3,
//   CheckCircle2,
//   Navigation,
//   Plus,
//   Minus,
//   ArrowUpRight,
//   ArrowRight,
//   SlidersHorizontal,
//   X,
//   RefreshCw,
//   AlertCircle,
//   LoaderCircle,
//   ShieldCheck,
//   ListFilter,
//   Eye,
//   Map as MapIcon,
// } from "lucide-react";

// import { useAuth } from "../context/AuthContext";
// import { supabase } from "../lib/supabase";
// import { REPORT_CATEGORIES } from "../constants/reportCategories";
// import "leaflet/dist/leaflet.css";

// const DEFAULT_CENTER = [-6.205, 106.817];
// const DEFAULT_ZOOM = 13;

// const statusColors = {
//   Pending: "#D97706",
//   Diproses: "#2563EB",
//   Selesai: "#16A34A",
// };

// function formatDate(date) {
//   if (!date) return "-";

//   const parsed = new Date(date);
//   if (Number.isNaN(parsed.getTime())) return "-";

//   return new Intl.DateTimeFormat("id-ID", {
//     day: "numeric",
//     month: "short",
//     year: "numeric",
//   }).format(parsed);
// }

// function formatDateTime(date) {
//   if (!date) return "-";

//   const parsed = new Date(date);
//   if (Number.isNaN(parsed.getTime())) return "-";

//   return new Intl.DateTimeFormat("id-ID", {
//     day: "numeric",
//     month: "long",
//     year: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//   }).format(parsed);
// }

// function ReportStatus({ status }) {
//   const color = statusColors[status] || "#78716C";

//   return (
//     <span
//       className="inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[11px] font-semibold"
//       style={{
//         color,
//         backgroundColor: `${color}15`,
//       }}
//     >
//       {status || "Pending"}
//     </span>
//   );
// }

// function MapControls({ isStaff }) {
//   const map = useMap();

//   return (
//     <div className="absolute bottom-4 right-3 z-[1000] flex flex-col gap-2 sm:bottom-5 sm:right-4">
//       <button
//         type="button"
//         aria-label="Perbesar peta"
//         onClick={() => map.zoomIn()}
//         className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-700 shadow-md transition hover:bg-stone-50"
//       >
//         <Plus size={18} />
//       </button>

//       <button
//         type="button"
//         aria-label="Perkecil peta"
//         onClick={() => map.zoomOut()}
//         className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-700 shadow-md transition hover:bg-stone-50"
//       >
//         <Minus size={18} />
//       </button>

//       <button
//         type="button"
//         aria-label="Kembalikan tampilan peta"
//         onClick={() => map.setView(DEFAULT_CENTER, DEFAULT_ZOOM)}
//         className={`flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 bg-white shadow-md transition hover:bg-stone-50 ${
//           isStaff ? "text-blue-700" : "text-emerald-800"
//         }`}
//       >
//         <Navigation size={18} />
//       </button>
//     </div>
//   );
// }

// function MapFocus({ selectedReport }) {
//   const map = useMap();

//   useEffect(() => {
//     if (!selectedReport) return;

//     map.flyTo(selectedReport.position, Math.max(map.getZoom(), 15), {
//       duration: 0.5,
//     });
//   }, [map, selectedReport]);

//   return null;
// }

// function ReportPopup({ report, isStaff }) {
//   return (
//     <div className="min-w-[190px] max-w-[250px]">
//       {report.photo_url && (
//         <img
//           src={report.photo_url}
//           alt={report.title}
//           className="mb-2 h-28 w-full rounded-lg object-cover"
//         />
//       )}

//       <ReportStatus status={report.status} />

//       <h3 className="mt-2 text-sm font-semibold leading-5 text-stone-900">
//         {report.title}
//       </h3>

//       <p className="mt-1 text-xs leading-5 text-stone-500">
//         <MapPin size={12} className="mr-1 inline" />
//         {report.location}
//       </p>

//       <p className="mt-2 text-xs leading-5 text-stone-600">
//         {report.description}
//       </p>

//       <p className="mt-2 text-xs text-stone-500">
//         {report.category} · {report.date}
//       </p>

//       <p className="mt-1 text-xs text-stone-400">
//         Dibuat {report.dateTime}
//       </p>

//       {isStaff && (
//         <Link
//           to="/kelola-laporan"
//           className="mt-3 inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-800 hover:bg-blue-100"
//         >
//           Tinjau di Kelola Laporan
//           <ArrowUpRight size={13} />
//         </Link>
//       )}

//       <a
//         href={`https://www.openstreetmap.org/?mlat=${report.position[0]}&mlon=${report.position[1]}#map=17/${report.position[0]}/${report.position[1]}`}
//         target="_blank"
//         rel="noreferrer"
//         className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950"
//       >
//         Buka lokasi
//         <ArrowUpRight size={13} />
//       </a>
//     </div>
//   );
// }

// function ReportCard({ report, selected, onSelect, isStaff }) {
//   return (
//     <button
//       type="button"
//       onClick={() => onSelect(report)}
//       aria-pressed={selected}
//       className={`block w-full p-4 text-left transition hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset ${
//         isStaff
//           ? "focus-visible:ring-blue-700"
//           : "focus-visible:ring-emerald-700"
//       } ${
//         selected
//           ? isStaff
//             ? "bg-blue-50"
//             : "bg-emerald-50"
//           : ""
//       }`}
//     >
//       <div className="flex items-start gap-3">
//         <span
//           className="mt-1 h-3 w-3 shrink-0 rounded-full"
//           style={{
//             backgroundColor: statusColors[report.status] || "#78716C",
//           }}
//         />

//         <div className="min-w-0 flex-1">
//           <h3 className="break-words text-sm font-semibold leading-5 text-stone-800">
//             {report.title}
//           </h3>

//           <p className="mt-1 break-words text-xs leading-5 text-stone-500">
//             {report.location}
//           </p>

//           <p className="mt-1 text-xs text-stone-400">
//             {report.category}
//           </p>

//           <div className="mt-3 flex flex-wrap items-center gap-2">
//             <ReportStatus status={report.status} />
//             <span className="text-[11px] text-stone-400">
//               {report.date}
//             </span>
//           </div>

//           {isStaff && report.status === "Pending" && (
//             <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
//               <Clock3 size={12} />
//               Menunggu ditinjau
//             </span>
//           )}
//         </div>

//         <ArrowUpRight
//           size={16}
//           className="mt-0.5 shrink-0 text-stone-400"
//         />
//       </div>
//     </button>
//   );
// }

// function EmptyReports({ hasFilters, isStaff, onReset }) {
//   return (
//     <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-5 py-10 text-center">
//       <div
//         className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${
//           isStaff
//             ? "bg-blue-50 text-blue-400"
//             : "bg-stone-100 text-stone-400"
//         }`}
//       >
//         <ClipboardList size={28} />
//       </div>

//       <h3 className="mt-4 font-semibold text-stone-800">
//         {hasFilters ? "Tidak ada laporan ditemukan" : "Belum ada laporan"}
//       </h3>

//       <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-stone-500">
//         {hasFilters
//           ? "Coba ubah kata kunci atau filter yang dipilih."
//           : "Laporan fasilitas publik akan muncul di peta ini setelah dikirimkan."}
//       </p>

//       {hasFilters && (
//         <button
//           type="button"
//           onClick={onReset}
//           className={`mt-4 text-sm font-semibold ${
//             isStaff ? "text-blue-800" : "text-emerald-800"
//           }`}
//         >
//           Reset filter
//         </button>
//       )}

//       {!isStaff && !hasFilters && (
//         <Link
//           to="/buat-laporan"
//           className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-900"
//         >
//           <Plus size={16} />
//           Buat laporan pertama
//         </Link>
//       )}
//     </div>
//   );
// }

// export default function MapPage() {
//   const { role } = useAuth();
//   const isStaff = role === "petugas";

//   const [reports, setReports] = useState([]);
//   const [search, setSearch] = useState("");
//   const [status, setStatus] = useState("Semua");
//   const [category, setCategory] = useState("Semua kategori");
//   const [selectedReport, setSelectedReport] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const fetchReports = useCallback(async () => {
//     setLoading(true);
//     setError("");

//     try {
//       const { data, error: fetchError } = await supabase
//         .from("reports")
//         .select(
//           "id, title, category, description, location_name, latitude, longitude, photo_url, status, created_at"
//         )
//         .order("created_at", { ascending: false });

//       if (fetchError) throw fetchError;

//       const mappedReports = (data || [])
//         .filter((report) => {
//           const lat = Number(report.latitude);
//           const lng = Number(report.longitude);

//           return (
//             report.latitude !== null &&
//             report.longitude !== null &&
//             Number.isFinite(lat) &&
//             Number.isFinite(lng) &&
//             lat >= -90 &&
//             lat <= 90 &&
//             lng >= -180 &&
//             lng <= 180
//           );
//         })
//         .map((report) => ({
//           ...report,
//           location: report.location_name || "Lokasi tidak tersedia",
//           position: [
//             Number(report.latitude),
//             Number(report.longitude),
//           ],
//           date: formatDate(report.created_at),
//           dateTime: formatDateTime(report.created_at),
//         }));

//       setReports(mappedReports);

//       setSelectedReport((current) => {
//         if (!current) return null;
//         return mappedReports.find((report) => report.id === current.id) || null;
//       });
//     } catch (err) {
//       console.error("Gagal mengambil data laporan:", err);

//       setError(
//         "Data laporan gagal dimuat. Periksa koneksi internet, tabel reports, dan kebijakan akses Supabase."
//       );
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchReports();
//   }, [fetchReports]);

//   // Semua laporan tetap dipakai untuk daftar dan statistik.
//   const filteredReports = useMemo(() => {
//     const keyword = search.toLowerCase().trim();

//     return reports.filter((report) => {
//       const matchesSearch =
//         (report.title || "").toLowerCase().includes(keyword) ||
//         (report.location || "").toLowerCase().includes(keyword) ||
//         (report.category || "").toLowerCase().includes(keyword) ||
//         (report.description || "").toLowerCase().includes(keyword);

//       const matchesStatus =
//         status === "Semua" || report.status === status;

//       const matchesCategory =
//         category === "Semua kategori" ||
//         report.category === category;

//       return matchesSearch && matchesStatus && matchesCategory;
//     });
//   }, [reports, search, status, category]);

//   // Hanya laporan yang belum selesai yang boleh mempunyai pin.
//   // Laporan Selesai tidak dihapus dari database atau daftar.
//   const mapReports = useMemo(
//     () => filteredReports.filter((report) => report.status !== "Selesai"),
//     [filteredReports]
//   );

//   const counts = useMemo(
//     () => ({
//       total: reports.length,
//       pending: reports.filter((report) => report.status === "Pending").length,
//       processing: reports.filter((report) => report.status === "Diproses").length,
//       completed: reports.filter((report) => report.status === "Selesai").length,
//     }),
//     [reports]
//   );

//   const clearFilters = () => {
//     setSearch("");
//     setStatus("Semua");
//     setCategory("Semua kategori");
//     setSelectedReport(null);
//   };

//   const statCards = [
//     {
//       label: "Total laporan",
//       value: counts.total,
//       icon: ClipboardList,
//       color: isStaff
//         ? "bg-slate-900 text-white"
//         : "bg-emerald-800 text-white",
//       iconColor: "text-white/80",
//       labelColor: "text-white/75",
//     },
//     {
//       label: "Menunggu",
//       value: counts.pending,
//       icon: Clock3,
//       color: "border border-stone-200 bg-white text-stone-900",
//       iconColor: "text-amber-600",
//       labelColor: "text-stone-500",
//     },
//     {
//       label: "Diproses",
//       value: counts.processing,
//       icon: MapPin,
//       color: "border border-stone-200 bg-white text-stone-900",
//       iconColor: "text-blue-600",
//       labelColor: "text-stone-500",
//     },
//     {
//       label: "Selesai",
//       value: counts.completed,
//       icon: CheckCircle2,
//       color: "border border-stone-200 bg-white text-stone-900",
//       iconColor: "text-emerald-600",
//       labelColor: "text-stone-500",
//     },
//   ];

//   const hasFilters =
//     Boolean(search.trim()) ||
//     status !== "Semua" ||
//     category !== "Semua kategori";

//   return (
//     <main
//       className={`min-h-screen overflow-x-hidden ${
//         isStaff ? "bg-slate-50" : "bg-[#fafbf8]"
//       }`}
//     >
//       {/* Header */}
//       <section
//         className={`border-b ${
//           isStaff
//             ? "border-slate-200 bg-slate-900 text-white"
//             : "border-stone-100 bg-[#fafbf8] text-stone-900"
//         }`}
//       >
//         <div className="mx-auto max-w-7xl px-4 pb-7 pt-8 sm:px-6 sm:pb-9 sm:pt-10 lg:px-8 lg:pt-12">
//           <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
//             <div className="min-w-0">
//               {isStaff ? (
//                 <>
//                   <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-blue-100">
//                     <ShieldCheck size={14} />
//                     AREA KERJA PETUGAS
//                   </div>

//                   <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
//                     Monitoring fasilitas publik
//                   </h1>

//                   <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
//                     Pantau persebaran kerusakan, prioritaskan laporan yang
//                     menunggu, dan tinjau progres penanganan fasilitas publik.
//                   </p>
//                 </>
//               ) : (
//                 <>
//                   <p className="text-[11px] font-semibold tracking-[0.16em] text-emerald-800 sm:text-xs">
//                     PANTAU FASILITAS PUBLIK
//                   </p>

//                   <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
//                     Peta persebaran laporan
//                   </h1>

//                   <p className="mt-3 max-w-xl text-sm leading-6 text-stone-600 sm:text-base">
//                     Kenali masalah fasilitas di kawasan TOD dan lihat status
//                     penanganannya melalui peta interaktif.
//                   </p>
//                 </>
//               )}
//             </div>

//             {isStaff ? (
//               <Link
//                 to="/kelola-laporan"
//                 className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 sm:w-auto"
//               >
//                 <ClipboardList size={17} />
//                 Buka Kelola Laporan
//                 <ArrowRight size={16} />
//               </Link>
//             ) : (
//               <Link
//                 to="/buat-laporan"
//                 className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-emerald-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900 sm:w-auto"
//               >
//                 <Plus size={17} />
//                 Buat laporan
//               </Link>
//             )}
//           </div>

//           {/* Statistik */}
//           <div className="mt-7 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-4 lg:grid-cols-4">
//             {statCards.map((item) => {
//               const Icon = item.icon;

//               return (
//                 <div
//                   key={item.label}
//                   className={`min-w-0 rounded-2xl p-3.5 sm:p-5 ${item.color}`}
//                 >
//                   <div className="flex items-start justify-between gap-2">
//                     <span className={`text-xs leading-5 sm:text-sm ${item.labelColor}`}>
//                       {item.label}
//                     </span>
//                     <Icon
//                       size={18}
//                       className={`mt-0.5 shrink-0 ${item.iconColor}`}
//                     />
//                   </div>

//                   <p className="mt-2 text-2xl font-semibold sm:mt-3 sm:text-3xl">
//                     {loading ? "—" : item.value}
//                   </p>

//                   {isStaff && item.label === "Menunggu" && (
//                     <p className="mt-1 text-xs text-amber-600">
//                       Perlu ditinjau
//                     </p>
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </section>

//       <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
//         {error && (
//           <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center">
//             <AlertCircle size={22} className="shrink-0 text-red-600" />

//             <p className="flex-1 text-sm leading-6 text-red-700">{error}</p>

//             <button
//               type="button"
//               onClick={fetchReports}
//               disabled={loading}
//               className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-60"
//             >
//               <RefreshCw size={15} />
//               Coba lagi
//             </button>
//           </div>
//         )}

//         {/* Panel prioritas petugas */}
//         {isStaff && !loading && !error && counts.pending > 0 && (
//           <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
//             <div className="flex items-start gap-3">
//               <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
//                 <Clock3 size={21} />
//               </div>

//               <div>
//                 <h2 className="font-semibold text-amber-950">
//                   {counts.pending} laporan menunggu penanganan
//                 </h2>
//                 <p className="mt-1 text-sm leading-5 text-amber-800">
//                   Periksa laporan yang masih berstatus Pending dan tentukan
//                   tindak lanjutnya.
//                 </p>
//               </div>
//             </div>

//             <Link
//               to="/kelola-laporan"
//               className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-900 transition hover:bg-amber-100"
//             >
//               Tinjau laporan
//               <ArrowRight size={15} />
//             </Link>
//           </div>
//         )}

//         <div className="grid min-w-0 grid-cols-1 items-start gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1fr)_330px]">
//           {/* Peta utama */}
//           <div className="min-w-0 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
//             <div className="border-b border-stone-200 p-3.5 sm:p-5">
//               <div className="mb-4 flex items-center justify-between gap-3">
//                 <div className="flex min-w-0 items-center gap-2">
//                   <div
//                     className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
//                       isStaff
//                         ? "bg-blue-50 text-blue-700"
//                         : "bg-emerald-50 text-emerald-800"
//                     }`}
//                   >
//                     <MapIcon size={18} />
//                   </div>

//                   <div className="min-w-0">
//                     <h2 className="text-sm font-semibold text-stone-900 sm:text-base">
//                       {isStaff ? "Peta monitoring laporan" : "Peta laporan"}
//                     </h2>
//                     <p className="mt-0.5 text-xs text-stone-500">
//                       {isStaff
//                         ? "Pilih titik untuk meninjau laporan"
//                         : "Pilih titik untuk melihat detail laporan"}
//                     </p>
//                   </div>
//                 </div>

//                 <span className="shrink-0 rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-600">
//                   {mapReports.length} pin aktif
//                 </span>
//               </div>

//               <div className="flex min-w-0 flex-col gap-3 sm:flex-row">
//                 <div className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-stone-200 px-3.5 transition focus-within:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-100">
//                   <Search size={18} className="shrink-0 text-stone-400" />

//                   <input
//                     type="search"
//                     value={search}
//                     onChange={(event) => setSearch(event.target.value)}
//                     placeholder="Cari judul atau lokasi..."
//                     aria-label="Cari laporan"
//                     className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-stone-400"
//                   />

//                   {search && (
//                     <button
//                       type="button"
//                       aria-label="Hapus pencarian"
//                       onClick={() => setSearch("")}
//                       className="shrink-0 rounded-full p-1 text-stone-400 hover:bg-stone-100"
//                     >
//                       <X size={15} />
//                     </button>
//                   )}
//                 </div>

//                 <div className="flex min-w-0 items-center gap-2">
//                   <SlidersHorizontal
//                     size={17}
//                     className="shrink-0 text-stone-500"
//                   />

//                   <select
//                     value={status}
//                     onChange={(event) => {
//                       setStatus(event.target.value);
//                       setSelectedReport(null);
//                     }}
//                     aria-label="Filter status laporan"
//                     className="min-w-0 flex-1 cursor-pointer rounded-xl border border-stone-200 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-700 sm:flex-none"
//                   >
//                     <option value="Semua">Semua status</option>
//                     <option value="Pending">Pending</option>
//                     <option value="Diproses">Diproses</option>
//                     <option value="Selesai">Selesai</option>
//                   </select>
//                 </div>
//               </div>

//               {/* Filter kategori */}
//               <div className="-mx-1 mt-3 overflow-x-auto px-1 pb-1">
//                 <div className="flex w-max min-w-full gap-2">
//                   <button
//                     type="button"
//                     onClick={() => setCategory("Semua kategori")}
//                     className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-medium transition ${
//                       category === "Semua kategori"
//                         ? isStaff
//                           ? "bg-slate-900 text-white"
//                           : "bg-emerald-800 text-white"
//                         : "bg-stone-100 text-stone-600 hover:bg-stone-200"
//                     }`}
//                   >
//                     Semua kategori
//                   </button>

//                   {REPORT_CATEGORIES.map((item) => (
//                     <button
//                       key={item}
//                       type="button"
//                       onClick={() => setCategory(item)}
//                       className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-medium transition ${
//                         category === item
//                           ? isStaff
//                             ? "bg-slate-900 text-white"
//                             : "bg-emerald-800 text-white"
//                           : "bg-stone-100 text-stone-600 hover:bg-stone-200"
//                       }`}
//                     >
//                       {item}
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               {hasFilters && (
//                 <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
//                   <p className="text-xs text-stone-500">
//                     {filteredReports.length} laporan sesuai filter
//                   </p>

//                   <button
//                     type="button"
//                     onClick={clearFilters}
//                     className="text-xs font-semibold text-stone-600 hover:text-stone-900"
//                   >
//                     Reset filter
//                   </button>
//                 </div>
//               )}

//               {loading && (
//                 <div className="mt-4 flex items-center gap-2 text-xs text-stone-500">
//                   <LoaderCircle
//                     size={15}
//                     className="animate-spin text-emerald-800"
//                   />
//                   Memuat laporan dari database...
//                 </div>
//               )}
//             </div>

//             {/* Leaflet map */}
//             <div
//               className={`relative w-full ${
//                 isStaff
//                   ? "h-[380px] sm:h-[480px] lg:h-[590px]"
//                   : "h-[340px] sm:h-[440px] lg:h-[540px]"
//               }`}
//             >
//               <MapContainer
//                 center={DEFAULT_CENTER}
//                 zoom={DEFAULT_ZOOM}
//                 scrollWheelZoom
//                 className="h-full w-full"
//               >
//                 <TileLayer
//                   attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
//                   url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                 />

//                 <MapFocus selectedReport={selectedReport} />

//                 {/* Hanya laporan Pending dan Diproses yang dibuatkan pin */}
//                 {mapReports.map((report) => (
//                   <CircleMarker
//                     key={report.id}
//                     center={report.position}
//                     radius={selectedReport?.id === report.id ? 10 : isStaff ? 8 : 7}
//                     pathOptions={{
//                       color: "#ffffff",
//                       weight: 3,
//                       fillColor: statusColors[report.status] || "#78716C",
//                       fillOpacity: 1,
//                     }}
//                     eventHandlers={{
//                       click: () => setSelectedReport(report),
//                     }}
//                   >
//                     <Popup>
//                       <ReportPopup report={report} isStaff={isStaff} />
//                     </Popup>
//                   </CircleMarker>
//                 ))}

//                 <MapControls isStaff={isStaff} />
//               </MapContainer>

//               {!loading && !error && mapReports.length === 0 && (
//                 <div className="pointer-events-none absolute inset-0 z-[500] flex items-center justify-center bg-white/70 p-5">
//                   <div className="rounded-2xl border border-stone-200 bg-white p-5 text-center shadow-lg">
//                     <Search
//                       size={26}
//                       className="mx-auto text-stone-400"
//                     />

//                     <p className="mt-2 text-sm font-semibold text-stone-800">
//                       {filteredReports.length > 0
//                         ? "Tidak ada pin aktif"
//                         : "Tidak ada laporan ditemukan"}
//                     </p>

//                     <p className="mt-1 text-xs leading-5 text-stone-500">
//                       {filteredReports.length > 0
//                         ? "Laporan berstatus Selesai tetap tersedia di daftar, tetapi pinnya disembunyikan dari peta."
//                         : "Ubah kata kunci atau filter untuk melihat laporan lain."}
//                     </p>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Legenda status */}
//             <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-stone-200 px-3.5 py-3.5 text-xs text-stone-600 sm:px-5">
//               {Object.entries(statusColors).map(([label, color]) => (
//                 <span key={label} className="flex items-center gap-2">
//                   <span
//                     className="h-2.5 w-2.5 shrink-0 rounded-full"
//                     style={{ backgroundColor: color }}
//                   />
//                   {label}
//                 </span>
//               ))}

//               <span className="ml-auto w-full text-stone-400 sm:w-auto sm:text-right">
//                 {mapReports.length} pin aktif dari {filteredReports.length} laporan
//               </span>
//             </div>
//           </div>

//           {/* Panel daftar laporan */}
//           <aside className="min-w-0 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
//             <div
//               className={`border-b p-4 sm:p-5 ${
//                 isStaff
//                   ? "border-slate-200 bg-slate-50"
//                   : "border-stone-200"
//               }`}
//             >
//               <div className="flex items-start justify-between gap-3">
//                 <div>
//                   <div className="flex items-center gap-2">
//                     {isStaff ? (
//                       <ShieldCheck size={18} className="text-blue-700" />
//                     ) : (
//                       <ClipboardList size={18} className="text-emerald-800" />
//                     )}

//                     <h2 className="font-semibold text-stone-900">
//                       {isStaff ? "Antrean laporan" : "Daftar laporan"}
//                     </h2>
//                   </div>

//                   <p className="mt-2 text-sm leading-5 text-stone-500">
//                     {isStaff
//                       ? "Pilih laporan untuk melihat lokasi dan meninjau penanganannya."
//                       : "Pilih laporan untuk melihat lokasinya di peta."}
//                   </p>
//                 </div>

//                 <span
//                   className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
//                     isStaff
//                       ? "bg-blue-100 text-blue-800"
//                       : "bg-stone-100 text-stone-600"
//                   }`}
//                 >
//                   {filteredReports.length}
//                 </span>
//               </div>

//               {isStaff && (
//                 <div className="mt-4 grid grid-cols-2 gap-2">
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setStatus("Pending");
//                       setSelectedReport(null);
//                     }}
//                     className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
//                       status === "Pending"
//                         ? "border-amber-300 bg-amber-100 text-amber-900"
//                         : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
//                     }`}
//                   >
//                     Pending ({counts.pending})
//                   </button>

//                   <button
//                     type="button"
//                     onClick={() => {
//                       setStatus("Semua");
//                       setSelectedReport(null);
//                     }}
//                     className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
//                       status === "Semua"
//                         ? "border-blue-200 bg-blue-50 text-blue-800"
//                         : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
//                     }`}
//                   >
//                     Semua laporan
//                   </button>
//                 </div>
//               )}
//             </div>

//             <div className="max-h-[460px] divide-y divide-stone-100 overflow-y-auto sm:max-h-[500px] lg:max-h-[590px]">
//               {loading ? (
//                 <div className="flex min-h-40 flex-col items-center justify-center gap-3 p-6">
//                   <LoaderCircle
//                     size={25}
//                     className="animate-spin text-emerald-800"
//                   />
//                   <p className="text-sm text-stone-500">
//                     Memuat laporan...
//                   </p>
//                 </div>
//               ) : error ? (
//                 <div className="p-6 text-center">
//                   <AlertCircle size={27} className="mx-auto text-red-500" />
//                   <p className="mt-3 text-sm text-stone-600">
//                     Daftar laporan belum dapat dimuat.
//                   </p>
//                   <button
//                     type="button"
//                     onClick={fetchReports}
//                     className="mt-3 text-sm font-semibold text-emerald-800"
//                   >
//                     Coba lagi
//                   </button>
//                 </div>
//               ) : filteredReports.length === 0 ? (
//                 <div className="p-4">
//                   <EmptyReports
//                     hasFilters={hasFilters}
//                     isStaff={isStaff}
//                     onReset={clearFilters}
//                   />
//                 </div>
//               ) : (
//                 filteredReports.map((report) => (
//                   <ReportCard
//                     key={report.id}
//                     report={report}
//                     selected={selectedReport?.id === report.id}
//                     onSelect={setSelectedReport}
//                     isStaff={isStaff}
//                   />
//                 ))
//               )}
//             </div>

//             <div className="border-t border-stone-100 p-3">
//               <button
//                 type="button"
//                 onClick={fetchReports}
//                 disabled={loading}
//                 className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-stone-200 px-3 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-50 disabled:opacity-60"
//               >
//                 <RefreshCw
//                   size={15}
//                   className={loading ? "animate-spin" : ""}
//                 />
//                 Perbarui data
//               </button>

//               {isStaff && (
//                 <Link
//                   to="/kelola-laporan"
//                   className="mt-2 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
//                 >
//                   <Eye size={16} />
//                   Buka Kelola Laporan
//                   <ArrowRight size={15} />
//                 </Link>
//               )}
//             </div>
//           </aside>
//         </div>

//         {/* Ajakan khusus warga */}
//         {!isStaff && (
//           <div className="mt-5 rounded-2xl border border-stone-200 bg-white p-4 sm:mt-6 sm:p-6">
//             <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
//               <div className="min-w-0">
//                 <h2 className="font-semibold text-stone-900">
//                   Menemukan fasilitas yang rusak?
//                 </h2>
//                 <p className="mt-1 text-sm leading-6 text-stone-500">
//                   Bantu dokumentasikan masalah agar bisa ditindaklanjuti.
//                 </p>
//               </div>

//               <Link
//                 to="/buat-laporan"
//                 className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-emerald-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900 sm:w-auto"
//               >
//                 Buat laporan
//                 <ArrowRight size={16} />
//               </Link>
//             </div>
//           </div>
//         )}

//         {/* Keterangan kerja petugas */}
//         {isStaff && (
//           <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
//             <div className="flex items-start gap-3">
//               <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
//                 <ListFilter size={19} />
//               </div>

//               <div>
//                 <h2 className="font-semibold text-slate-900">
//                   Perlu menindaklanjuti laporan?
//                 </h2>
//                 <p className="mt-1 text-sm leading-6 text-slate-500">
//                   Buka halaman Kelola Laporan untuk melihat detail dan
//                   memperbarui status penanganan.
//                 </p>
//               </div>
//             </div>

//             <Link
//               to="/kelola-laporan"
//               className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 sm:w-auto"
//             >
//               Kelola Laporan
//               <ArrowRight size={16} />
//             </Link>
//           </div>
//         )}
//       </section>
//     </main>
//   );
// }



import { useCallback, useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Circle,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import { Link } from "react-router-dom";
import {
  Search,
  MapPin,
  ClipboardList,
  Clock3,
  CheckCircle2,
  Navigation,
  Plus,
  Minus,
  ArrowUpRight,
  ArrowRight,
  SlidersHorizontal,
  X,
  RefreshCw,
  AlertCircle,
  LoaderCircle,
  ShieldCheck,
  ListFilter,
  Eye,
  Map as MapIcon,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { REPORT_CATEGORIES } from "../constants/reportCategories";
import { TOD_AREAS } from "../data/todAreas";

import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER = [-6.3147, 106.6811];
const DEFAULT_ZOOM = 12;

const statusColors = {
  Pending: "#D97706",
  Diproses: "#2563EB",
  Selesai: "#16A34A",
};

function distanceInMeters(lat1, lon1, lat2, lon2) {
  const earthRadius = 6371000;
  const toRadians = (degrees) => (degrees * Math.PI) / 180;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return (
    earthRadius *
    2 *
    Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  );
}

function findTodArea(latitude, longitude) {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return (
    TOD_AREAS.find((area) => {
      const distance = distanceInMeters(
        latitude,
        longitude,
        area.center.latitude,
        area.center.longitude
      );

      return distance <= area.radiusMeters;
    }) || null
  );
}

function formatDate(date) {
  if (!date) return "-";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function formatDateTime(date) {
  if (!date) return "-";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

function ReportStatus({ status }) {
  const color = statusColors[status] || "#78716C";

  return (
    <span
      className="inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[11px] font-semibold"
      style={{
        color,
        backgroundColor: `${color}15`,
      }}
    >
      {status || "Pending"}
    </span>
  );
}

function MapControls({ isStaff }) {
  const map = useMap();

  return (
    <div className="absolute bottom-4 right-3 z-[1000] flex flex-col gap-2 sm:bottom-5 sm:right-4">
      <button
        type="button"
        aria-label="Perbesar peta"
        onClick={() => map.zoomIn()}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-700 shadow-md hover:bg-stone-50"
      >
        <Plus size={18} />
      </button>

      <button
        type="button"
        aria-label="Perkecil peta"
        onClick={() => map.zoomOut()}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-700 shadow-md hover:bg-stone-50"
      >
        <Minus size={18} />
      </button>

      <button
        type="button"
        aria-label="Kembalikan tampilan peta"
        onClick={() => map.setView(DEFAULT_CENTER, DEFAULT_ZOOM)}
        className={`flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 bg-white shadow-md hover:bg-stone-50 ${
          isStaff ? "text-blue-700" : "text-emerald-800"
        }`}
      >
        <Navigation size={18} />
      </button>
    </div>
  );
}

function MapFocus({ selectedReport }) {
  const map = useMap();

  useEffect(() => {
    if (!selectedReport) return;

    map.flyTo(selectedReport.position, Math.max(map.getZoom(), 15), {
      duration: 0.5,
    });
  }, [map, selectedReport]);

  return null;
}

function TodAreasLayer() {
  return (
    <>
      {TOD_AREAS.map((area) => (
        <Circle
          key={area.id}
          center={[area.center.latitude, area.center.longitude]}
          radius={area.radiusMeters}
          pathOptions={{
            color: "#047857",
            fillColor: "#10b981",
            fillOpacity: 0.1,
            weight: 2,
            dashArray: "6 6",
          }}
        >
          <Popup>
            <div className="text-sm">
              <strong>{area.name}</strong>
              <p className="mt-1">{area.station}</p>
              <p className="mt-1 text-xs text-stone-500">
                Area perkiraan, bukan batas resmi terverifikasi.
              </p>
            </div>
          </Popup>
        </Circle>
      ))}
    </>
  );
}

function ReportPopup({ report, isStaff }) {
  return (
    <div className="min-w-[190px] max-w-[250px]">
      {report.photo_url && (
        <img
          src={report.photo_url}
          alt={report.title}
          className="mb-2 h-28 w-full rounded-lg object-cover"
        />
      )}

      <ReportStatus status={report.status} />

      <h3 className="mt-2 text-sm font-semibold leading-5 text-stone-900">
        {report.title}
      </h3>

      <p className="mt-1 text-xs leading-5 text-stone-500">
        <MapPin size={12} className="mr-1 inline" />
        {report.location}
      </p>

      <p className="mt-2 text-xs leading-5 text-stone-600">
        {report.description}
      </p>

      <p className="mt-2 text-xs text-stone-500">
        {report.category} · {report.date}
      </p>

      {report.todName && (
        <p className="mt-1 text-xs font-medium text-emerald-800">
          {report.todName}
        </p>
      )}

      <p className="mt-1 text-xs text-stone-400">
        Dibuat {report.dateTime}
      </p>

      {isStaff && (
        <Link
          to="/kelola-laporan"
          className="mt-3 inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-800 hover:bg-blue-100"
        >
          Tinjau di Kelola Laporan
          <ArrowUpRight size={13} />
        </Link>
      )}

      <a
        href={`https://www.openstreetmap.org/?mlat=${report.position[0]}&mlon=${report.position[1]}#map=17/${report.position[0]}/${report.position[1]}`}
        target="_blank"
        rel="noreferrer"
        className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950"
      >
        Buka lokasi
        <ArrowUpRight size={13} />
      </a>
    </div>
  );
}

function ReportCard({ report, selected, onSelect, isStaff }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(report)}
      aria-pressed={selected}
      className={`block w-full p-4 text-left transition hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset ${
        isStaff ? "focus-visible:ring-blue-700" : "focus-visible:ring-emerald-700"
      } ${selected ? (isStaff ? "bg-blue-50" : "bg-emerald-50") : ""}`}
    >
      <div className="flex items-start gap-3">
        <span
          className="mt-1 h-3 w-3 shrink-0 rounded-full"
          style={{
            backgroundColor: statusColors[report.status] || "#78716C",
          }}
        />

        <div className="min-w-0 flex-1">
          <h3 className="break-words text-sm font-semibold leading-5 text-stone-800">
            {report.title}
          </h3>

          <p className="mt-1 break-words text-xs leading-5 text-stone-500">
            {report.location}
          </p>

          <p className="mt-1 text-xs text-stone-400">{report.category}</p>

          {report.todName && (
            <p className="mt-1 text-xs font-medium text-emerald-800">
              {report.todName}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <ReportStatus status={report.status} />
            <span className="text-[11px] text-stone-400">
              {report.date}
            </span>
          </div>

          {isStaff && report.status === "Pending" && (
            <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
              <Clock3 size={12} />
              Menunggu ditinjau
            </span>
          )}
        </div>

        <ArrowUpRight size={16} className="mt-0.5 shrink-0 text-stone-400" />
      </div>
    </button>
  );
}

function EmptyReports({ hasFilters, isStaff, onReset }) {
  return (
    <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-5 py-10 text-center">
      <div
        className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${
          isStaff ? "bg-blue-50 text-blue-400" : "bg-stone-100 text-stone-400"
        }`}
      >
        <ClipboardList size={28} />
      </div>

      <h3 className="mt-4 font-semibold text-stone-800">
        {hasFilters ? "Tidak ada laporan ditemukan" : "Belum ada laporan"}
      </h3>

      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-stone-500">
        {hasFilters
          ? "Coba ubah kata kunci atau filter yang dipilih."
          : "Laporan fasilitas di area TOD Tangsel akan muncul di sini setelah dikirimkan."}
      </p>

      {hasFilters && (
        <button
          type="button"
          onClick={onReset}
          className={`mt-4 text-sm font-semibold ${
            isStaff ? "text-blue-800" : "text-emerald-800"
          }`}
        >
          Reset filter
        </button>
      )}

      {!isStaff && !hasFilters && (
        <Link
          to="/buat-laporan"
          className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900"
        >
          <Plus size={16} />
          Buat laporan pertama
        </Link>
      )}
    </div>
  );
}

export default function MapPage() {
  const { role } = useAuth();
  const isStaff = role === "petugas";

  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Semua");
  const [category, setCategory] = useState("Semua kategori");
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data, error: fetchError } = await supabase
        .from("reports")
        .select(
          "id, title, category, description, location_name, latitude, longitude, photo_url, status, created_at"
        )
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      const mappedReports = (data || [])
        .filter((report) => {
          if (
            report.latitude === null ||
            report.longitude === null ||
            report.latitude === undefined ||
            report.longitude === undefined
          ) {
            return false;
          }

          const lat = Number(report.latitude);
          const lng = Number(report.longitude);

          if (
            !Number.isFinite(lat) ||
            !Number.isFinite(lng) ||
            lat < -90 ||
            lat > 90 ||
            lng < -180 ||
            lng > 180
          ) {
            return false;
          }

          // Hanya masukkan laporan di area perkiraan TOD yang terdaftar.
          return findTodArea(lat, lng) !== null;
        })
        .map((report) => {
          const latitude = Number(report.latitude);
          const longitude = Number(report.longitude);
          const area = findTodArea(latitude, longitude);

          return {
            ...report,
            location: report.location_name || "Lokasi tidak tersedia",
            position: [latitude, longitude],
            date: formatDate(report.created_at),
            dateTime: formatDateTime(report.created_at),
            todName: area?.name || "",
          };
        });

      setReports(mappedReports);

      setSelectedReport((current) => {
        if (!current) return null;
        return mappedReports.find((report) => report.id === current.id) || null;
      });
    } catch (err) {
      console.error("Gagal mengambil data laporan:", err);

      setError(
        "Data laporan gagal dimuat. Periksa koneksi internet, tabel reports, dan kebijakan akses Supabase."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const filteredReports = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return reports.filter((report) => {
      const matchesSearch =
        (report.title || "").toLowerCase().includes(keyword) ||
        (report.location || "").toLowerCase().includes(keyword) ||
        (report.category || "").toLowerCase().includes(keyword) ||
        (report.description || "").toLowerCase().includes(keyword) ||
        (report.todName || "").toLowerCase().includes(keyword);

      const matchesStatus = status === "Semua" || report.status === status;

      const matchesCategory =
        category === "Semua kategori" || report.category === category;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [reports, search, status, category]);

  // Laporan Selesai tetap berada dalam daftar, tetapi tidak memiliki pin.
  const mapReports = useMemo(
    () => filteredReports.filter((report) => report.status !== "Selesai"),
    [filteredReports]
  );

  const counts = useMemo(
    () => ({
      total: reports.length,
      pending: reports.filter((report) => report.status === "Pending").length,
      processing: reports.filter((report) => report.status === "Diproses").length,
      completed: reports.filter((report) => report.status === "Selesai").length,
    }),
    [reports]
  );

  const clearFilters = () => {
    setSearch("");
    setStatus("Semua");
    setCategory("Semua kategori");
    setSelectedReport(null);
  };

  const hasFilters =
    Boolean(search.trim()) ||
    status !== "Semua" ||
    category !== "Semua kategori";

  const statCards = [
    {
      label: "Total laporan",
      value: counts.total,
      icon: ClipboardList,
      color: isStaff
        ? "bg-slate-900 text-white"
        : "bg-emerald-800 text-white",
      iconColor: "text-white/80",
      labelColor: "text-white/75",
    },
    {
      label: "Menunggu",
      value: counts.pending,
      icon: Clock3,
      color: "border border-stone-200 bg-white text-stone-900",
      iconColor: "text-amber-600",
      labelColor: "text-stone-500",
    },
    {
      label: "Diproses",
      value: counts.processing,
      icon: MapPin,
      color: "border border-stone-200 bg-white text-stone-900",
      iconColor: "text-blue-600",
      labelColor: "text-stone-500",
    },
    {
      label: "Selesai",
      value: counts.completed,
      icon: CheckCircle2,
      color: "border border-stone-200 bg-white text-stone-900",
      iconColor: "text-emerald-600",
      labelColor: "text-stone-500",
    },
  ];

  return (
    <main
      className={`min-h-screen overflow-x-hidden ${
        isStaff ? "bg-slate-50" : "bg-[#fafbf8]"
      }`}
    >
      <section
        className={`border-b ${
          isStaff
            ? "border-slate-200 bg-slate-900 text-white"
            : "border-stone-100 bg-[#fafbf8] text-stone-900"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 pb-7 pt-8 sm:px-6 sm:pb-9 sm:pt-10 lg:px-8 lg:pt-12">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div className="min-w-0">
              {isStaff ? (
                <>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-blue-100">
                    <ShieldCheck size={14} />
                    AREA KERJA PETUGAS
                  </div>
                  <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
                    Monitoring fasilitas publik
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                    Pantau laporan fasilitas di area perkiraan TOD Tangerang
                    Selatan dan tinjau progres penanganannya.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-[11px] font-semibold tracking-[0.16em] text-emerald-800 sm:text-xs">
                    TANGERANG SELATAN
                  </p>
                  <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
                    Peta persebaran laporan
                  </h1>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-stone-600 sm:text-base">
                    Lihat laporan fasilitas di area perkiraan TOD yang terdaftar
                    di Tangerang Selatan.
                  </p>
                </>
              )}
            </div>

            {isStaff ? (
              <Link
                to="/kelola-laporan"
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 sm:w-auto"
              >
                <ClipboardList size={17} />
                Buka Kelola Laporan
                <ArrowRight size={16} />
              </Link>
            ) : (
              <Link
                to="/buat-laporan"
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-emerald-800 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-900 sm:w-auto"
              >
                <Plus size={17} />
                Buat laporan
              </Link>
            )}
          </div>

          <div className="mt-7 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-4 lg:grid-cols-4">
            {statCards.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className={`min-w-0 rounded-2xl p-3.5 sm:p-5 ${item.color}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className={`text-xs leading-5 sm:text-sm ${item.labelColor}`}>
                      {item.label}
                    </span>
                    <Icon size={18} className={`mt-0.5 shrink-0 ${item.iconColor}`} />
                  </div>
                  <p className="mt-2 text-2xl font-semibold sm:mt-3 sm:text-3xl">
                    {loading ? "—" : item.value}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        {error && (
          <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center">
            <AlertCircle size={22} className="shrink-0 text-red-600" />
            <p className="flex-1 text-sm leading-6 text-red-700">{error}</p>
            <button
              type="button"
              onClick={fetchReports}
              disabled={loading}
              className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-60"
            >
              <RefreshCw size={15} />
              Coba lagi
            </button>
          </div>
        )}

        {isStaff && !loading && !error && counts.pending > 0 && (
          <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <Clock3 size={21} />
              </div>
              <div>
                <h2 className="font-semibold text-amber-950">
                  {counts.pending} laporan menunggu penanganan
                </h2>
                <p className="mt-1 text-sm leading-5 text-amber-800">
                  Periksa laporan yang masih berstatus Pending.
                </p>
              </div>
            </div>
            <Link
              to="/kelola-laporan"
              className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-100"
            >
              Tinjau laporan
              <ArrowRight size={15} />
            </Link>
          </div>
        )}

        <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-start gap-3">
            <MapPin size={19} className="mt-0.5 shrink-0 text-emerald-800" />
            <div>
              <h2 className="text-sm font-semibold text-emerald-950">
                Area pemetaan TOD Tangerang Selatan
              </h2>
              <p className="mt-1 text-xs leading-5 text-emerald-900">
                Peta menampilkan laporan dalam radius perkiraan dari simpul
                TOD yang terdaftar. Lingkaran hijau bukan batas resmi kawasan
                yang sudah terverifikasi.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {TOD_AREAS.map((area) => (
                  <span
                    key={area.id}
                    className="rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-medium text-emerald-900"
                  >
                    {area.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid min-w-0 grid-cols-1 items-start gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1fr)_330px]">
          <div className="min-w-0 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
            <div className="border-b border-stone-200 p-3.5 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                    isStaff ? "bg-blue-50 text-blue-700" : "bg-emerald-50 text-emerald-800"
                  }`}>
                    <MapIcon size={18} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-stone-900 sm:text-base">
                      {isStaff ? "Peta monitoring laporan" : "Peta laporan TOD"}
                    </h2>
                    <p className="mt-0.5 text-xs text-stone-500">
                      Lingkaran hijau menunjukkan area perkiraan TOD
                    </p>
                  </div>
                </div>

                <span className="shrink-0 rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-600">
                  {mapReports.length} pin aktif
                </span>
              </div>

              <div className="flex min-w-0 flex-col gap-3 sm:flex-row">
                <div className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-stone-200 px-3.5 focus-within:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-100">
                  <Search size={18} className="shrink-0 text-stone-400" />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Cari judul, lokasi, atau TOD..."
                    aria-label="Cari laporan"
                    className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-stone-400"
                  />
                  {search && (
                    <button
                      type="button"
                      aria-label="Hapus pencarian"
                      onClick={() => setSearch("")}
                      className="shrink-0 rounded-full p-1 text-stone-400 hover:bg-stone-100"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                <div className="flex min-w-0 items-center gap-2">
                  <SlidersHorizontal size={17} className="shrink-0 text-stone-500" />
                  <select
                    value={status}
                    onChange={(event) => {
                      setStatus(event.target.value);
                      setSelectedReport(null);
                    }}
                    aria-label="Filter status laporan"
                    className="min-w-0 flex-1 cursor-pointer rounded-xl border border-stone-200 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-700 sm:flex-none"
                  >
                    <option value="Semua">Semua status</option>
                    <option value="Pending">Pending</option>
                    <option value="Diproses">Diproses</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>
              </div>

              <div className="-mx-1 mt-3 overflow-x-auto px-1 pb-1">
                <div className="flex w-max min-w-full gap-2">
                  <button
                    type="button"
                    onClick={() => setCategory("Semua kategori")}
                    className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-medium ${
                      category === "Semua kategori"
                        ? isStaff
                          ? "bg-slate-900 text-white"
                          : "bg-emerald-800 text-white"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    Semua kategori
                  </button>

                  {REPORT_CATEGORIES.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setCategory(item)}
                      className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-medium ${
                        category === item
                          ? isStaff
                            ? "bg-slate-900 text-white"
                            : "bg-emerald-800 text-white"
                          : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {hasFilters && (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-stone-500">
                    {filteredReports.length} laporan sesuai filter
                  </p>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-xs font-semibold text-stone-600 hover:text-stone-900"
                  >
                    Reset filter
                  </button>
                </div>
              )}

              {loading && (
                <div className="mt-4 flex items-center gap-2 text-xs text-stone-500">
                  <LoaderCircle size={15} className="animate-spin text-emerald-800" />
                  Memuat laporan dari database...
                </div>
              )}
            </div>

            <div className={`relative w-full ${
              isStaff ? "h-[380px] sm:h-[480px] lg:h-[590px]" : "h-[340px] sm:h-[440px] lg:h-[540px]"
            }`}>
              <MapContainer
                center={DEFAULT_CENTER}
                zoom={DEFAULT_ZOOM}
                scrollWheelZoom
                className="h-full w-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <TodAreasLayer />
                <MapFocus selectedReport={selectedReport} />

                {mapReports.map((report) => (
                  <CircleMarker
                    key={report.id}
                    center={report.position}
                    radius={
                      selectedReport?.id === report.id ? 10 : isStaff ? 8 : 7
                    }
                    pathOptions={{
                      color: "#ffffff",
                      weight: 3,
                      fillColor: statusColors[report.status] || "#78716C",
                      fillOpacity: 1,
                    }}
                    eventHandlers={{
                      click: () => setSelectedReport(report),
                    }}
                  >
                    <Popup>
                      <ReportPopup report={report} isStaff={isStaff} />
                    </Popup>
                  </CircleMarker>
                ))}

                <MapControls isStaff={isStaff} />
              </MapContainer>

              {!loading && !error && mapReports.length === 0 && (
                <div className="pointer-events-none absolute inset-0 z-[500] flex items-center justify-center bg-white/70 p-5">
                  <div className="rounded-2xl border border-stone-200 bg-white p-5 text-center shadow-lg">
                    <Search size={26} className="mx-auto text-stone-400" />
                    <p className="mt-2 text-sm font-semibold text-stone-800">
                      {filteredReports.length > 0
                        ? "Tidak ada pin aktif"
                        : "Tidak ada laporan ditemukan"}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-stone-500">
                      {filteredReports.length > 0
                        ? "Laporan Selesai tetap ada di daftar, tetapi pinnya disembunyikan."
                        : "Belum ada laporan yang sesuai area TOD dan filter."}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-stone-200 px-3.5 py-3.5 text-xs text-stone-600 sm:px-5">
              {Object.entries(statusColors).map(([label, color]) => (
                <span key={label} className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  {label}
                </span>
              ))}
              <span className="ml-auto w-full text-stone-400 sm:w-auto sm:text-right">
                {mapReports.length} pin aktif dari {filteredReports.length} laporan
              </span>
            </div>
          </div>

          <aside className="min-w-0 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
            <div className={`border-b p-4 sm:p-5 ${
              isStaff ? "border-slate-200 bg-slate-50" : "border-stone-200"
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    {isStaff ? (
                      <ShieldCheck size={18} className="text-blue-700" />
                    ) : (
                      <ClipboardList size={18} className="text-emerald-800" />
                    )}
                    <h2 className="font-semibold text-stone-900">
                      {isStaff ? "Antrean laporan" : "Daftar laporan"}
                    </h2>
                  </div>
                  <p className="mt-2 text-sm leading-5 text-stone-500">
                    {isStaff
                      ? "Pilih laporan untuk melihat lokasi dan meninjau penanganannya."
                      : "Pilih laporan untuk melihat lokasinya di peta."}
                  </p>
                </div>

                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  isStaff ? "bg-blue-100 text-blue-800" : "bg-stone-100 text-stone-600"
                }`}>
                  {filteredReports.length}
                </span>
              </div>

              {isStaff && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStatus("Pending");
                      setSelectedReport(null);
                    }}
                    className={`rounded-xl border px-3 py-2 text-xs font-semibold ${
                      status === "Pending"
                        ? "border-amber-300 bg-amber-100 text-amber-900"
                        : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    Pending ({counts.pending})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStatus("Semua");
                      setSelectedReport(null);
                    }}
                    className={`rounded-xl border px-3 py-2 text-xs font-semibold ${
                      status === "Semua"
                        ? "border-blue-200 bg-blue-50 text-blue-800"
                        : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    Semua laporan
                  </button>
                </div>
              )}
            </div>

            <div className="max-h-[460px] divide-y divide-stone-100 overflow-y-auto sm:max-h-[500px] lg:max-h-[590px]">
              {loading ? (
                <div className="flex min-h-40 flex-col items-center justify-center gap-3 p-6">
                  <LoaderCircle size={25} className="animate-spin text-emerald-800" />
                  <p className="text-sm text-stone-500">Memuat laporan...</p>
                </div>
              ) : error ? (
                <div className="p-6 text-center">
                  <AlertCircle size={27} className="mx-auto text-red-500" />
                  <p className="mt-3 text-sm text-stone-600">
                    Daftar laporan belum dapat dimuat.
                  </p>
                  <button
                    type="button"
                    onClick={fetchReports}
                    className="mt-3 text-sm font-semibold text-emerald-800"
                  >
                    Coba lagi
                  </button>
                </div>
              ) : filteredReports.length === 0 ? (
                <div className="p-4">
                  <EmptyReports
                    hasFilters={hasFilters}
                    isStaff={isStaff}
                    onReset={clearFilters}
                  />
                </div>
              ) : (
                filteredReports.map((report) => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    selected={selectedReport?.id === report.id}
                    onSelect={setSelectedReport}
                    isStaff={isStaff}
                  />
                ))
              )}
            </div>

            <div className="border-t border-stone-100 p-3">
              <button
                type="button"
                onClick={fetchReports}
                disabled={loading}
                className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-stone-200 px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50 disabled:opacity-60"
              >
                <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
                Perbarui data
              </button>

              {isStaff && (
                <Link
                  to="/kelola-laporan"
                  className="mt-2 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  <Eye size={16} />
                  Buka Kelola Laporan
                  <ArrowRight size={15} />
                </Link>
              )}
            </div>
          </aside>
        </div>

        {!isStaff && (
          <div className="mt-5 rounded-2xl border border-stone-200 bg-white p-4 sm:mt-6 sm:p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="min-w-0">
                <h2 className="font-semibold text-stone-900">
                  Menemukan fasilitas yang rusak?
                </h2>
                <p className="mt-1 text-sm leading-6 text-stone-500">
                  Laporkan kerusakan di area TOD yang tersedia.
                </p>
              </div>
              <Link
                to="/buat-laporan"
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-emerald-800 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-900 sm:w-auto"
              >
                Buat laporan
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        )}

        {isStaff && (
          <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <ListFilter size={19} />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">
                  Perlu menindaklanjuti laporan?
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Buka Kelola Laporan untuk melihat detail dan memperbarui status.
                </p>
              </div>
            </div>
            <Link
              to="/kelola-laporan"
              className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 sm:w-auto"
            >
              Kelola Laporan
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}