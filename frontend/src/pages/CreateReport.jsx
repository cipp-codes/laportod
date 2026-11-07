// import { useEffect, useRef, useState } from "react";
// import { Camera, MapPin, LocateFixed, Search, X, ArrowLeft, ArrowRight, CheckCircle2, Info, LoaderCircle, LockKeyhole } from "lucide-react";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
// import L from "leaflet";

// import { useAuth } from "../context/AuthContext";
// import { useToast } from "../context/ToastContext";
// import { supabase } from "../lib/supabase";
// import { REPORT_CATEGORIES } from "../constants/reportCategories";
// import "leaflet/dist/leaflet.css";

// const defaultPosition = [-6.2, 106.8167];
// const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
// const STORAGE_BUCKET = "report-photos";

// const locationIcon = new L.DivIcon({
//   className: "",
//   html: `
//     <div style="width:34px;height:34px;background:#166534;border:4px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px #0003;position:relative">
//       <div style="position:absolute;width:8px;height:8px;background:white;border-radius:50%;top:9px;left:9px"></div>
//     </div>
//   `,
//   iconSize: [34, 34],
//   iconAnchor: [17, 34],
// });

// function SelectLocation({ position, setPosition }) {
//   useMapEvents({
//     click(event) {
//       setPosition([event.latlng.lat, event.latlng.lng]);
//     },
//   });

//   return (
//     <Marker
//       position={position}
//       icon={locationIcon}
//       draggable
//       eventHandlers={{
//         dragend(event) {
//           const point = event.target.getLatLng();
//           setPosition([point.lat, point.lng]);
//         },
//       }}
//     />
//   );
// }

// function MapUpdater({ position }) {
//   const map = useMap();

//   useEffect(() => {
//     map.flyTo(position, Math.max(map.getZoom(), 14), {
//       duration: 0.5,
//     });
//   }, [map, position]);

//   return null;
// }

// function FormSection({ number, title, description, children }) {
//   return (
//     <section className="min-w-0 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6 md:p-8">
//       <div className="flex items-start gap-3 sm:gap-4">
//         <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-sm font-semibold text-emerald-800 sm:h-10 sm:w-10">{number}</div>

//         <div className="min-w-0 pt-0.5">
//           <h2 className="text-base font-semibold text-stone-900 sm:text-lg">{title}</h2>
//           <p className="mt-1 text-xs leading-5 text-stone-500 sm:text-sm">{description}</p>
//         </div>
//       </div>

//       <div className="mt-6 space-y-5 sm:mt-7">{children}</div>
//     </section>
//   );
// }

// function FieldLabel({ htmlFor, children }) {
//   return (
//     <label htmlFor={htmlFor} className="mb-2 block text-sm font-medium text-stone-800">
//       {children} <span className="text-red-600">*</span>
//     </label>
//   );
// }

// const inputClass = "w-full min-w-0 rounded-xl border border-stone-200 bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-stone-400 focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/10 sm:px-4";

// export default function CreateReport() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const { user, role, loading } = useAuth();
//   const { showToast } = useToast();

//   const [title, setTitle] = useState("");
//   const [locationName, setLocationName] = useState("");
//   const [category, setCategory] = useState("");
//   const [description, setDescription] = useState("");
//   const [position, setPosition] = useState(defaultPosition);
//   const [photo, setPhoto] = useState(null);
//   const [photoPreview, setPhotoPreview] = useState("");
//   const [searchLocation, setSearchLocation] = useState("");
//   const [locating, setLocating] = useState(false);
//   const [searching, setSearching] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [message, setMessage] = useState("");
//   const [messageType, setMessageType] = useState("info");

//   const redirectHandled = useRef(false);
//   const isStaff = role === "petugas";

//   // Tampilkan notifikasi sekali ketika akses halaman ditolak.
//   useEffect(() => {
//     if (loading || redirectHandled.current) return;

//     if (!user) {
//       redirectHandled.current = true;

//       showToast({
//         type: "info",
//         title: "Login diperlukan",
//         message: "Silakan masuk atau daftar sebagai warga untuk membuat laporan.",
//       });

//       navigate("/login", {
//         replace: true,
//         state: { from: "/buat-laporan" },
//       });

//       return;
//     }

//     if (isStaff) {
//       redirectHandled.current = true;

//       showToast({
//         type: "error",
//         title: "Akses khusus warga",
//         message: "Akun petugas tidak dapat membuat laporan. Silakan kelola laporan yang masuk.",
//       });

//       navigate("/kelola-laporan", { replace: true });
//     }
//   }, [loading, user, isStaff, navigate, showToast]);

//   useEffect(() => {
//     if (!photoPreview) return undefined;

//     return () => URL.revokeObjectURL(photoPreview);
//   }, [photoPreview]);

//   function showMessage(text, type = "info") {
//     setMessage(text);
//     setMessageType(type);
//   }

//   function handlePhoto(event) {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
//       showMessage("Gunakan foto berformat JPG, PNG, atau WebP.", "error");
//       event.target.value = "";
//       return;
//     }

//     if (file.size > MAX_PHOTO_SIZE) {
//       showMessage("Ukuran foto maksimal 5 MB.", "error");
//       event.target.value = "";
//       return;
//     }

//     setPhoto(file);
//     setPhotoPreview(URL.createObjectURL(file));
//     showMessage("Foto berhasil dipilih.", "success");
//   }

//   function removePhoto() {
//     setPhoto(null);
//     setPhotoPreview("");
//   }

//   function useMyLocation() {
//     if (!navigator.geolocation) {
//       showMessage("Browser kamu tidak mendukung GPS.", "error");
//       return;
//     }

//     setLocating(true);
//     setMessage("");

//     navigator.geolocation.getCurrentPosition(
//       (result) => {
//         setPosition([result.coords.latitude, result.coords.longitude]);

//         setLocating(false);
//         showMessage("Lokasi berhasil diambil. Periksa kembali titik pada peta.", "success");
//       },
//       (error) => {
//         setLocating(false);

//         showMessage(
//           error.code === error.PERMISSION_DENIED ? "Akses lokasi ditolak. Izinkan akses lokasi pada browser atau pilih titik langsung di peta." : "Lokasi tidak berhasil diambil. Coba lagi atau pilih titik langsung di peta.",
//           "error",
//         );
//       },
//       {
//         enableHighAccuracy: true,
//         timeout: 10000,
//         maximumAge: 0,
//       },
//     );
//   }

//   async function searchPlace() {
//     const query = searchLocation.trim();

//     if (!query) {
//       showMessage("Masukkan nama tempat atau alamat terlebih dahulu.", "error");
//       return;
//     }

//     setSearching(true);
//     setMessage("");

//     try {
//       const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`);

//       if (!response.ok) {
//         throw new Error("Pencarian lokasi gagal.");
//       }

//       const results = await response.json();

//       if (!results.length) {
//         showMessage("Lokasi tidak ditemukan. Coba nama tempat yang lebih spesifik.", "error");
//         return;
//       }

//       const result = results[0];

//       setPosition([Number(result.lat), Number(result.lon)]);
//       setLocationName((current) => current || result.display_name);

//       showMessage("Lokasi ditemukan. Periksa kembali titik pada peta.", "success");
//     } catch (error) {
//       console.error("Pencarian lokasi gagal:", error);

//       showMessage("Pencarian lokasi gagal. Kamu tetap bisa memilih titik manual pada peta.", "error");
//     } finally {
//       setSearching(false);
//     }
//   }

//   async function handleSubmit(event) {
//     event.preventDefault();

//     if (submitting) return;

//     if (loading || !user) {
//       showToast({
//         type: "info",
//         title: "Login diperlukan",
//         message: "Silakan masuk atau daftar terlebih dahulu untuk mengirim laporan.",
//       });

//       navigate("/login", {
//         state: { from: "/buat-laporan" },
//       });
//       return;
//     }

//     if (isStaff) {
//       showToast({
//         type: "error",
//         title: "Akses ditolak",
//         message: "Akun petugas hanya dapat mengelola laporan yang masuk.",
//       });

//       navigate("/kelola-laporan");
//       return;
//     }

//     const cleanTitle = title.trim();
//     const cleanLocation = locationName.trim();
//     const cleanDescription = description.trim();

//     if (!cleanTitle) {
//       showMessage("Silakan isi judul laporan.", "error");
//       return;
//     }

//     if (!REPORT_CATEGORIES.includes(category)) {
//       showMessage("Silakan pilih kategori fasilitas yang tersedia.", "error");
//       return;
//     }

//     if (cleanDescription.length < 10) {
//       showMessage("Deskripsi kerusakan minimal 10 karakter.", "error");
//       return;
//     }

//     if (!cleanLocation) {
//       showMessage("Silakan isi nama lokasi kejadian.", "error");
//       return;
//     }

//     if (!photo) {
//       showMessage("Silakan unggah foto bukti kerusakan.", "error");
//       return;
//     }

//     setSubmitting(true);
//     setMessage("Sedang mengunggah foto dan menyimpan laporan...");

//     let uploadedPath = null;

//     try {
//       const {
//         data: { session },
//         error: sessionError,
//       } = await supabase.auth.getSession();

//       if (sessionError) throw sessionError;

//       if (!session?.user || session.user.id !== user.id) {
//         throw new Error("Sesi login tidak valid. Silakan login kembali.");
//       }

//       const safeFileName = photo.name
//         .normalize("NFKD")
//         .replace(/[^a-zA-Z0-9._-]/g, "_")
//         .slice(-100);

//       const filePath = `${user.id}/${crypto.randomUUID()}-${safeFileName}`;

//       const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(filePath, photo, {
//         contentType: photo.type,
//         upsert: false,
//       });

//       if (uploadError) throw uploadError;

//       uploadedPath = filePath;

//       const { data: publicUrlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);

//       const { data: savedReport, error: insertError } = await supabase
//         .from("reports")
//         .insert({
//           user_id: user.id,
//           title: cleanTitle,
//           category,
//           description: cleanDescription,
//           location_name: cleanLocation,
//           latitude: position[0],
//           longitude: position[1],
//           photo_url: publicUrlData.publicUrl,
//           status: "Pending",
//         })
//         .select("id")
//         .single();

//       if (insertError) throw insertError;

//       uploadedPath = null;

//       showToast({
//         type: "success",
//         title: "Laporan berhasil dikirim!",
//         message: "Laporanmu sudah tersimpan dan menunggu tindak lanjut.",
//       });

//       navigate("/laporan-saya", {
//         replace: true,
//         state: { reportId: savedReport.id },
//       });
//     } catch (error) {
//       console.error("Gagal menyimpan laporan:", error);

//       if (uploadedPath) {
//         const { error: cleanupError } = await supabase.storage.from(STORAGE_BUCKET).remove([uploadedPath]);

//         if (cleanupError) {
//           console.error("Gagal membersihkan foto sementara:", cleanupError);
//         }
//       }

//       const errorMessage = error.message || "";

//       if (errorMessage.toLowerCase().includes("row-level security") || errorMessage.toLowerCase().includes("permission denied")) {
//         showMessage("Akses ditolak oleh keamanan Supabase. Periksa policy tabel reports dan bucket report-photos.", "error");
//       } else {
//         showMessage(`Laporan belum berhasil disimpan: ${errorMessage || "Terjadi kesalahan. Silakan coba lagi."}`, "error");
//       }
//     } finally {
//       setSubmitting(false);
//     }
//   }

//   if (loading) {
//     return (
//       <main className="flex min-h-[60vh] items-center justify-center bg-[#fafbf8] px-4">
//         <div className="flex items-center gap-3 text-sm text-stone-600">
//           <LoaderCircle size={22} className="animate-spin text-emerald-800" />
//           Memeriksa sesi akun...
//         </div>
//       </main>
//     );
//   }

//   if (!user || isStaff) {
//     return (
//       <main className="flex min-h-[60vh] items-center justify-center bg-[#fafbf8] px-4">
//         <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-7 text-center shadow-sm">
//           <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-800">
//             <LockKeyhole size={25} />
//           </div>

//           <h1 className="mt-4 text-xl font-semibold text-stone-900">{isStaff ? "Menu khusus warga" : "Masuk untuk membuat laporan"}</h1>

//           <p className="mt-2 text-sm leading-6 text-stone-600">
//             {isStaff ? "Akun petugas digunakan untuk memantau dan mengelola laporan yang masuk." : "Kamu perlu masuk atau mendaftar sebagai warga sebelum mengirim laporan fasilitas publik."}
//           </p>

//           {!isStaff ? (
//             <div className="mt-6 flex flex-col gap-3 sm:flex-row">
//               <Link
//                 to="/login"
//                 state={{ from: location.pathname }}
//                 className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
//               >
//                 Masuk
//               </Link>

//               <Link to="/daftar" state={{ from: location.pathname }} className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-emerald-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900">
//                 Daftar
//               </Link>
//             </div>
//           ) : (
//             <Link to="/kelola-laporan" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900">
//               Buka Kelola Laporan
//             </Link>
//           )}
//         </div>
//       </main>
//     );
//   }

//   return (
//     <main className="min-h-screen overflow-x-hidden bg-[#fafbf8]">
//       <section className="mx-auto max-w-4xl px-4 py-7 sm:px-6 sm:py-10 md:px-8 md:py-14">
//         <Link to="/" className="inline-flex min-h-9 items-center gap-2 text-sm font-medium text-stone-500 transition hover:text-emerald-800">
//           <ArrowLeft size={16} />
//           Kembali ke Home
//         </Link>

//         <div className="mt-6 sm:mt-7">
//           <p className="text-[11px] font-semibold tracking-[0.16em] text-emerald-800 sm:text-xs">KONTRIBUSI WARGA</p>

//           <h1 className="mt-3 text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl md:text-4xl">Buat laporan fasilitas</h1>

//           <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600 sm:text-base">Sampaikan kerusakan yang kamu temukan di kawasan TOD. Informasi yang jelas membantu petugas memahami masalah dan lokasinya.</p>
//         </div>

//         <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-800/15 bg-emerald-50 p-3.5 sm:mt-8 sm:p-4">
//           <Info size={20} className="mt-0.5 shrink-0 text-emerald-800" />
//           <p className="text-xs leading-5 text-emerald-950 sm:text-sm sm:leading-6">Pastikan laporan sesuai kondisi sebenarnya. Pilih titik lokasi seakurat mungkin dan gunakan foto yang memperlihatkan kerusakan.</p>
//         </div>

//         <form onSubmit={handleSubmit} className="mt-6 space-y-4 sm:mt-8 sm:space-y-6">
//           <FormSection number="01" title="Informasi kerusakan" description="Ceritakan masalah yang kamu temukan.">
//             <div>
//               <FieldLabel htmlFor="report-title">Judul laporan</FieldLabel>
//               <input id="report-title" required maxLength={120} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Contoh: Lampu pedestrian tidak menyala" className={inputClass} />
//             </div>

//             <div>
//               <FieldLabel htmlFor="report-category">Kategori fasilitas</FieldLabel>
//               <select id="report-category" required value={category} onChange={(event) => setCategory(event.target.value)} className={`${inputClass} cursor-pointer`}>
//                 <option value="">Pilih kategori fasilitas</option>
//                 {REPORT_CATEGORIES.map((item) => (
//                   <option key={item} value={item}>
//                     {item}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <FieldLabel htmlFor="report-description">Deskripsi detail</FieldLabel>
//               <textarea
//                 id="report-description"
//                 required
//                 minLength={10}
//                 maxLength={2000}
//                 rows={5}
//                 value={description}
//                 onChange={(event) => setDescription(event.target.value)}
//                 placeholder="Jelaskan kondisi kerusakan, posisi fasilitas, waktu ditemukan, dan dampaknya bagi pengguna..."
//                 className={`${inputClass} min-h-32 resize-y leading-6`}
//               />
//               <p className="mt-2 text-right text-xs text-stone-400">{description.length}/2000 karakter</p>
//             </div>
//           </FormSection>

//           <FormSection number="02" title="Lokasi kejadian" description="Cari tempatnya, gunakan GPS, atau pilih titik pada peta.">
//             <div>
//               <FieldLabel htmlFor="location-name">Nama lokasi</FieldLabel>
//               <input id="location-name" required maxLength={200} value={locationName} onChange={(event) => setLocationName(event.target.value)} placeholder="Contoh: Pintu keluar Stasiun Sudirman" className={inputClass} />
//             </div>

//             <div className="space-y-2">
//               <label htmlFor="search-location" className="block text-sm font-medium text-stone-800">
//                 Cari lokasi di peta
//               </label>

//               <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
//                 <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-stone-200 bg-white px-3.5 focus-within:border-emerald-800 focus-within:ring-2 focus-within:ring-emerald-800/10">
//                   <Search size={18} className="shrink-0 text-stone-400" />
//                   <input
//                     id="search-location"
//                     value={searchLocation}
//                     onChange={(event) => setSearchLocation(event.target.value)}
//                     onKeyDown={(event) => {
//                       if (event.key === "Enter") {
//                         event.preventDefault();
//                         searchPlace();
//                       }
//                     }}
//                     placeholder="Nama tempat atau alamat..."
//                     className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-stone-400"
//                   />
//                 </div>

//                 <button
//                   type="button"
//                   onClick={searchPlace}
//                   disabled={searching}
//                   className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 disabled:opacity-60 sm:min-w-28"
//                 >
//                   {searching ? <LoaderCircle size={16} className="animate-spin" /> : <Search size={16} />}
//                   {searching ? "Mencari..." : "Cari lokasi"}
//                 </button>
//               </div>
//             </div>

//             <button
//               type="button"
//               onClick={useMyLocation}
//               disabled={locating}
//               className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-100 disabled:opacity-60 sm:w-auto"
//             >
//               {locating ? <LoaderCircle size={18} className="animate-spin" /> : <LocateFixed size={18} />}
//               {locating ? "Mengambil lokasi..." : "Gunakan lokasi GPS saya"}
//             </button>

//             <div className="overflow-hidden rounded-xl border border-stone-200">
//               <div className="flex items-center justify-between gap-3 border-b border-stone-200 bg-stone-50 px-3.5 py-3 sm:px-4">
//                 <div className="flex min-w-0 items-center gap-2">
//                   <MapPin size={17} className="shrink-0 text-emerald-800" />
//                   <span className="text-xs font-medium text-stone-700 sm:text-sm">Tentukan titik kerusakan</span>
//                 </div>
//                 <span className="shrink-0 text-[10px] text-stone-400 sm:text-xs">Peta interaktif</span>
//               </div>

//               <div className="relative h-[280px] w-full sm:h-[360px] md:h-[400px]">
//                 <MapContainer center={defaultPosition} zoom={14} scrollWheelZoom className="h-full w-full">
//                   <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//                   <MapUpdater position={position} />
//                   <SelectLocation position={position} setPosition={setPosition} />
//                 </MapContainer>
//               </div>
//             </div>

//             <div className="rounded-xl bg-stone-50 p-3.5 sm:p-4">
//               <p className="flex items-start gap-2 text-xs leading-5 text-stone-600 sm:text-sm">
//                 <Info size={16} className="mt-0.5 shrink-0 text-emerald-800" />
//                 Klik peta untuk memilih titik atau geser pin hijau ke lokasi kerusakan yang tepat.
//               </p>

//               <div className="mt-3 border-t border-stone-200 pt-3">
//                 <p className="text-xs font-medium text-stone-500">Koordinat lokasi</p>
//                 <p className="mt-1 break-all font-mono text-xs leading-5 text-stone-700">
//                   {position[0].toFixed(6)}, {position[1].toFixed(6)}
//                 </p>
//               </div>
//             </div>
//           </FormSection>

//           <FormSection number="03" title="Foto bukti" description="Unggah foto yang menunjukkan kondisi fasilitas.">
//             {photoPreview ? (
//               <div className="relative overflow-hidden rounded-xl border border-stone-200 bg-stone-50">
//                 <img src={photoPreview} alt="Pratinjau foto bukti kerusakan" className="max-h-80 w-full object-contain" />
//                 <button type="button" aria-label="Hapus foto" onClick={removePhoto} className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-stone-700 shadow-md transition hover:bg-stone-100">
//                   <X size={18} />
//                 </button>
//               </div>
//             ) : (
//               <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 bg-[#fafbf8] px-4 py-8 text-center transition hover:border-emerald-700 hover:bg-emerald-50/40 sm:px-6 sm:py-10">
//                 <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-emerald-800 shadow-sm">
//                   <Camera size={22} />
//                 </div>
//                 <span className="mt-4 text-sm font-semibold text-stone-800">Pilih foto dari perangkat</span>
//                 <span className="mt-2 text-xs leading-5 text-stone-500">JPG, PNG, atau WebP · Maksimal 5 MB</span>
//                 <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhoto} className="sr-only" />
//               </label>
//             )}

//             {photo && (
//               <div className="flex min-w-0 items-start gap-2 rounded-xl bg-emerald-50 p-3">
//                 <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-emerald-800" />
//                 <div className="min-w-0">
//                   <p className="break-words text-sm font-medium text-emerald-900">{photo.name}</p>
//                   <p className="mt-1 text-xs text-emerald-800">{(photo.size / (1024 * 1024)).toFixed(2)} MB</p>
//                 </div>
//               </div>
//             )}
//           </FormSection>

//           {message && (
//             <div
//               role="status"
//               aria-live="polite"
//               className={`flex items-start gap-3 rounded-xl border p-3.5 text-sm leading-6 sm:p-4 ${
//                 messageType === "error" ? "border-red-200 bg-red-50 text-red-800" : messageType === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-stone-200 bg-white text-stone-700"
//               }`}
//             >
//               {messageType === "success" ? <CheckCircle2 size={19} className="mt-0.5 shrink-0" /> : <Info size={19} className="mt-0.5 shrink-0" />}
//               <p className="min-w-0 break-words">{message}</p>
//             </div>
//           )}

//           <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
//             <Link to="/peta" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-stone-300 px-6 py-3.5 text-sm font-semibold text-stone-700 transition hover:bg-white sm:w-auto">
//               <ArrowLeft size={17} />
//               Kembali ke peta
//             </Link>

//             <button
//               type="submit"
//               disabled={submitting}
//               className="inline-flex min-h-12 w-full touch-manipulation items-center justify-center gap-2 rounded-full bg-emerald-800 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
//             >
//               {submitting ? (
//                 <>
//                   <LoaderCircle size={17} className="animate-spin" />
//                   Menyimpan laporan...
//                 </>
//               ) : (
//                 <>
//                   Kirim laporan
//                   <ArrowRight size={17} />
//                 </>
//               )}
//             </button>
//           </div>
//         </form>
//       </section>
//     </main>
//   );
// }



// import { useEffect, useRef, useState } from "react";
// import {
//   Camera,
//   MapPin,
//   LocateFixed,
//   Search,
//   X,
//   ArrowLeft,
//   ArrowRight,
//   CheckCircle2,
//   Info,
//   LoaderCircle,
//   LockKeyhole,
// } from "lucide-react";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import {
//   MapContainer,
//   TileLayer,
//   Marker,
//   Circle,
//   useMap,
//   useMapEvents,
// } from "react-leaflet";
// import L from "leaflet";

// import { useAuth } from "../context/AuthContext";
// import { useToast } from "../context/ToastContext";
// import { supabase } from "../lib/supabase";
// import { REPORT_CATEGORIES } from "../constants/reportCategories";
// import { TOD_AREAS } from "../data/todAreas";

// import "leaflet/dist/leaflet.css";

// const defaultPosition = [-6.3147, 106.6811];
// const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
// const STORAGE_BUCKET = "report-photos";

// const locationIcon = new L.DivIcon({
//   className: "",
//   html: `
//     <div style="
//       width:34px;
//       height:34px;
//       background:#166534;
//       border:4px solid white;
//       border-radius:50% 50% 50% 0;
//       transform:rotate(-45deg);
//       box-shadow:0 2px 8px #0003;
//       position:relative;
//     ">
//       <div style="
//         position:absolute;
//         width:8px;
//         height:8px;
//         background:white;
//         border-radius:50%;
//         top:9px;
//         left:9px;
//       "></div>
//     </div>
//   `,
//   iconSize: [34, 34],
//   iconAnchor: [17, 34],
// });

// function distanceInMeters(lat1, lon1, lat2, lon2) {
//   const earthRadius = 6371000;
//   const toRadians = (degrees) => (degrees * Math.PI) / 180;

//   const dLat = toRadians(lat2 - lat1);
//   const dLon = toRadians(lon2 - lon1);

//   const a =
//     Math.sin(dLat / 2) ** 2 +
//     Math.cos(toRadians(lat1)) *
//       Math.cos(toRadians(lat2)) *
//       Math.sin(dLon / 2) ** 2;

//   return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
// }

// function findTodArea(position) {
//   if (
//     !Array.isArray(position) ||
//     position.length !== 2 ||
//     !Number.isFinite(position[0]) ||
//     !Number.isFinite(position[1])
//   ) {
//     return null;
//   }

//   return (
//     TOD_AREAS.find((area) => {
//       const distance = distanceInMeters(
//         position[0],
//         position[1],
//         area.center.latitude,
//         area.center.longitude
//       );

//       return distance <= area.radiusMeters;
//     }) || null
//   );
// }

// function SelectLocation({ position, setPosition }) {
//   useMapEvents({
//     click(event) {
//       setPosition([event.latlng.lat, event.latlng.lng]);
//     },
//   });

//   return (
//     <>
//       {TOD_AREAS.map((area) => (
//         <Circle
//           key={area.id}
//           center={[area.center.latitude, area.center.longitude]}
//           radius={area.radiusMeters}
//           pathOptions={{
//             color: "#047857",
//             fillColor: "#10b981",
//             fillOpacity: 0.12,
//             weight: 2,
//             dashArray: "6 6",
//           }}
//         />
//       ))}

//       <Marker
//         position={position}
//         icon={locationIcon}
//         draggable
//         eventHandlers={{
//           dragend(event) {
//             const point = event.target.getLatLng();
//             setPosition([point.lat, point.lng]);
//           },
//         }}
//       />
//     </>
//   );
// }

// function MapUpdater({ position }) {
//   const map = useMap();

//   useEffect(() => {
//     map.flyTo(position, Math.max(map.getZoom(), 14), {
//       duration: 0.5,
//     });
//   }, [map, position]);

//   return null;
// }

// function FormSection({ number, title, description, children }) {
//   return (
//     <section className="min-w-0 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6 md:p-8">
//       <div className="flex items-start gap-3 sm:gap-4">
//         <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-sm font-semibold text-emerald-800 sm:h-10 sm:w-10">
//           {number}
//         </div>

//         <div className="min-w-0 pt-0.5">
//           <h2 className="text-base font-semibold text-stone-900 sm:text-lg">
//             {title}
//           </h2>
//           <p className="mt-1 text-xs leading-5 text-stone-500 sm:text-sm">
//             {description}
//           </p>
//         </div>
//       </div>

//       <div className="mt-6 space-y-5 sm:mt-7">{children}</div>
//     </section>
//   );
// }

// function FieldLabel({ htmlFor, children }) {
//   return (
//     <label
//       htmlFor={htmlFor}
//       className="mb-2 block text-sm font-medium text-stone-800"
//     >
//       {children} <span className="text-red-600">*</span>
//     </label>
//   );
// }

// const inputClass =
//   "w-full min-w-0 rounded-xl border border-stone-200 bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-stone-400 focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/10 sm:px-4";

// export default function CreateReport() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const { user, role, loading } = useAuth();
//   const { showToast } = useToast();

//   const [title, setTitle] = useState("");
//   const [locationName, setLocationName] = useState("");
//   const [category, setCategory] = useState("");
//   const [description, setDescription] = useState("");
//   const [position, setPosition] = useState(defaultPosition);
//   const [photo, setPhoto] = useState(null);
//   const [photoPreview, setPhotoPreview] = useState("");
//   const [searchLocation, setSearchLocation] = useState("");
//   const [locating, setLocating] = useState(false);
//   const [searching, setSearching] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [message, setMessage] = useState("");
//   const [messageType, setMessageType] = useState("info");

//   const redirectHandled = useRef(false);
//   const isStaff = role === "petugas";

//   const selectedTod = findTodArea(position);

//   useEffect(() => {
//     if (loading || redirectHandled.current) return;

//     if (!user) {
//       redirectHandled.current = true;

//       showToast({
//         type: "info",
//         title: "Login diperlukan",
//         message:
//           "Silakan masuk atau daftar sebagai warga untuk membuat laporan.",
//       });

//       navigate("/login", {
//         replace: true,
//         state: { from: "/buat-laporan" },
//       });

//       return;
//     }

//     if (isStaff) {
//       redirectHandled.current = true;

//       showToast({
//         type: "error",
//         title: "Akses khusus warga",
//         message:
//           "Akun petugas tidak dapat membuat laporan. Silakan kelola laporan yang masuk.",
//       });

//       navigate("/kelola-laporan", { replace: true });
//     }
//   }, [loading, user, isStaff, navigate, showToast]);

//   useEffect(() => {
//     if (!photoPreview) return undefined;

//     return () => URL.revokeObjectURL(photoPreview);
//   }, [photoPreview]);

//   function showMessage(text, type = "info") {
//     setMessage(text);
//     setMessageType(type);
//   }

//   function handlePhoto(event) {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
//       showMessage("Gunakan foto berformat JPG, PNG, atau WebP.", "error");
//       event.target.value = "";
//       return;
//     }

//     if (file.size > MAX_PHOTO_SIZE) {
//       showMessage("Ukuran foto maksimal 5 MB.", "error");
//       event.target.value = "";
//       return;
//     }

//     setPhoto(file);
//     setPhotoPreview(URL.createObjectURL(file));
//     showMessage("Foto berhasil dipilih.", "success");
//   }

//   function removePhoto() {
//     setPhoto(null);
//     setPhotoPreview("");
//   }

//   function useMyLocation() {
//     if (!navigator.geolocation) {
//       showMessage("Browser kamu tidak mendukung GPS.", "error");
//       return;
//     }

//     setLocating(true);
//     setMessage("");

//     navigator.geolocation.getCurrentPosition(
//       (result) => {
//         const nextPosition = [
//           result.coords.latitude,
//           result.coords.longitude,
//         ];

//         setPosition(nextPosition);
//         setLocating(false);

//         const area = findTodArea(nextPosition);

//         if (area) {
//           showMessage(
//             `Lokasi berada di area perkiraan ${area.name}. Periksa kembali titik pada peta.`,
//             "success"
//           );
//         } else {
//           showMessage(
//             "Lokasi berada di luar area TOD yang tersedia. Pilih lokasi di dalam lingkaran hijau pada peta.",
//             "error"
//           );
//         }
//       },
//       (error) => {
//         setLocating(false);

//         showMessage(
//           error.code === error.PERMISSION_DENIED
//             ? "Akses lokasi ditolak. Izinkan akses lokasi pada browser atau pilih titik langsung di peta."
//             : "Lokasi tidak berhasil diambil. Coba lagi atau pilih titik langsung di peta.",
//           "error"
//         );
//       },
//       {
//         enableHighAccuracy: true,
//         timeout: 10000,
//         maximumAge: 0,
//       }
//     );
//   }

//   async function searchPlace() {
//     const query = searchLocation.trim();

//     if (!query) {
//       showMessage("Masukkan nama tempat atau alamat terlebih dahulu.", "error");
//       return;
//     }

//     setSearching(true);
//     setMessage("");

//     try {
//       const response = await fetch(
//         `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=id&q=${encodeURIComponent(
//           query + ", Tangerang Selatan, Banten, Indonesia"
//         )}`
//       );

//       if (!response.ok) {
//         throw new Error("Pencarian lokasi gagal.");
//       }

//       const results = await response.json();

//       if (!results.length) {
//         showMessage(
//           "Lokasi tidak ditemukan. Coba nama tempat yang lebih spesifik di Tangerang Selatan.",
//           "error"
//         );
//         return;
//       }

//       const result = results[0];
//       const nextPosition = [Number(result.lat), Number(result.lon)];

//       setPosition(nextPosition);
//       setLocationName((current) => current || result.display_name);

//       const area = findTodArea(nextPosition);

//       if (area) {
//         showMessage(
//           `Lokasi ditemukan di area perkiraan ${area.name}. Periksa titiknya sebelum mengirim.`,
//           "success"
//         );
//       } else {
//         showMessage(
//           "Lokasi ditemukan, tetapi berada di luar area TOD yang tersedia. Cari lokasi lain di dalam lingkaran hijau.",
//           "error"
//         );
//       }
//     } catch (error) {
//       console.error("Pencarian lokasi gagal:", error);
//       showMessage(
//         "Pencarian lokasi gagal. Kamu tetap bisa memilih titik manual pada peta.",
//         "error"
//       );
//     } finally {
//       setSearching(false);
//     }
//   }

//   async function handleSubmit(event) {
//     event.preventDefault();

//     if (submitting) return;

//     if (loading || !user) {
//       showToast({
//         type: "info",
//         title: "Login diperlukan",
//         message:
//           "Silakan masuk atau daftar terlebih dahulu untuk mengirim laporan.",
//       });

//       navigate("/login", {
//         state: { from: "/buat-laporan" },
//       });
//       return;
//     }

//     if (isStaff) {
//       showToast({
//         type: "error",
//         title: "Akses ditolak",
//         message: "Akun petugas hanya dapat mengelola laporan yang masuk.",
//       });

//       navigate("/kelola-laporan");
//       return;
//     }

//     const cleanTitle = title.trim();
//     const cleanLocation = locationName.trim();
//     const cleanDescription = description.trim();

//     if (!cleanTitle) {
//       showMessage("Silakan isi judul laporan.", "error");
//       return;
//     }

//     if (!REPORT_CATEGORIES.includes(category)) {
//       showMessage("Silakan pilih kategori fasilitas yang tersedia.", "error");
//       return;
//     }

//     if (cleanDescription.length < 10) {
//       showMessage("Deskripsi kerusakan minimal 10 karakter.", "error");
//       return;
//     }

//     if (!cleanLocation) {
//       showMessage("Silakan isi nama lokasi kejadian.", "error");
//       return;
//     }

//     // Validasi lokasi sebelum mengunggah foto atau menyimpan laporan.
//     const area = findTodArea(position);

//     if (!area) {
//       showMessage(
//         "Laporan hanya dapat dibuat di area perkiraan TOD Tangerang Selatan. Pilih titik di dalam salah satu lingkaran hijau pada peta.",
//         "error"
//       );
//       return;
//     }

//     if (!photo) {
//       showMessage("Silakan unggah foto bukti kerusakan.", "error");
//       return;
//     }

//     setSubmitting(true);
//     setMessage("Sedang mengunggah foto dan menyimpan laporan...");

//     let uploadedPath = null;

//     try {
//       const {
//         data: { session },
//         error: sessionError,
//       } = await supabase.auth.getSession();

//       if (sessionError) throw sessionError;

//       if (!session?.user || session.user.id !== user.id) {
//         throw new Error("Sesi login tidak valid. Silakan login kembali.");
//       }

//       const safeFileName = photo.name
//         .normalize("NFKD")
//         .replace(/[^a-zA-Z0-9._-]/g, "_")
//         .slice(-100);

//       const filePath = `${user.id}/${crypto.randomUUID()}-${safeFileName}`;

//       const { error: uploadError } = await supabase.storage
//         .from(STORAGE_BUCKET)
//         .upload(filePath, photo, {
//           contentType: photo.type,
//           upsert: false,
//         });

//       if (uploadError) throw uploadError;

//       uploadedPath = filePath;

//       const { data: publicUrlData } = supabase.storage
//         .from(STORAGE_BUCKET)
//         .getPublicUrl(filePath);

//       const { data: savedReport, error: insertError } = await supabase
//         .from("reports")
//         .insert({
//           user_id: user.id,
//           title: cleanTitle,
//           category,
//           description: cleanDescription,
//           location_name: cleanLocation,
//           latitude: position[0],
//           longitude: position[1],
//           photo_url: publicUrlData.publicUrl,
//           status: "Pending",
//         })
//         .select("id")
//         .single();

//       if (insertError) throw insertError;

//       uploadedPath = null;

//       showToast({
//         type: "success",
//         title: "Laporan berhasil dikirim!",
//         message: `Laporanmu tercatat pada area perkiraan ${area.name} dan menunggu tindak lanjut.`,
//       });

//       navigate("/laporan-saya", {
//         replace: true,
//         state: { reportId: savedReport.id },
//       });
//     } catch (error) {
//       console.error("Gagal menyimpan laporan:", error);

//       if (uploadedPath) {
//         const { error: cleanupError } = await supabase.storage
//           .from(STORAGE_BUCKET)
//           .remove([uploadedPath]);

//         if (cleanupError) {
//           console.error("Gagal membersihkan foto sementara:", cleanupError);
//         }
//       }

//       const errorMessage = error.message || "";

//       if (
//         errorMessage.toLowerCase().includes("row-level security") ||
//         errorMessage.toLowerCase().includes("permission denied")
//       ) {
//         showMessage(
//           "Akses ditolak oleh keamanan Supabase. Periksa policy tabel reports dan bucket report-photos.",
//           "error"
//         );
//       } else {
//         showMessage(
//           `Laporan belum berhasil disimpan: ${
//             errorMessage || "Terjadi kesalahan. Silakan coba lagi."
//           }`,
//           "error"
//         );
//       }
//     } finally {
//       setSubmitting(false);
//     }
//   }

//   if (loading) {
//     return (
//       <main className="flex min-h-[60vh] items-center justify-center bg-[#fafbf8] px-4">
//         <div className="flex items-center gap-3 text-sm text-stone-600">
//           <LoaderCircle size={22} className="animate-spin text-emerald-800" />
//           Memeriksa sesi akun...
//         </div>
//       </main>
//     );
//   }

//   if (!user || isStaff) {
//     return (
//       <main className="flex min-h-[60vh] items-center justify-center bg-[#fafbf8] px-4">
//         <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-7 text-center shadow-sm">
//           <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-800">
//             <LockKeyhole size={25} />
//           </div>

//           <h1 className="mt-4 text-xl font-semibold text-stone-900">
//             {isStaff ? "Menu khusus warga" : "Masuk untuk membuat laporan"}
//           </h1>

//           <p className="mt-2 text-sm leading-6 text-stone-600">
//             {isStaff
//               ? "Akun petugas digunakan untuk memantau dan mengelola laporan yang masuk."
//               : "Kamu perlu masuk atau mendaftar sebagai warga sebelum mengirim laporan fasilitas publik."}
//           </p>

//           {!isStaff ? (
//             <div className="mt-6 flex flex-col gap-3 sm:flex-row">
//               <Link
//                 to="/login"
//                 state={{ from: location.pathname }}
//                 className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
//               >
//                 Masuk
//               </Link>

//               <Link
//                 to="/daftar"
//                 state={{ from: location.pathname }}
//                 className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-emerald-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900"
//               >
//                 Daftar
//               </Link>
//             </div>
//           ) : (
//             <Link
//               to="/kelola-laporan"
//               className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900"
//             >
//               Buka Kelola Laporan
//             </Link>
//           )}
//         </div>
//       </main>
//     );
//   }

//   return (
//     <main className="min-h-screen overflow-x-hidden bg-[#fafbf8]">
//       <section className="mx-auto max-w-4xl px-4 py-7 sm:px-6 sm:py-10 md:px-8 md:py-14">
//         <Link
//           to="/"
//           className="inline-flex min-h-9 items-center gap-2 text-sm font-medium text-stone-500 transition hover:text-emerald-800"
//         >
//           <ArrowLeft size={16} />
//           Kembali ke Home
//         </Link>

//         <div className="mt-6 sm:mt-7">
//           <p className="text-[11px] font-semibold tracking-[0.16em] text-emerald-800 sm:text-xs">
//             KONTRIBUSI WARGA · TANGERANG SELATAN
//           </p>

//           <h1 className="mt-3 text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl md:text-4xl">
//             Buat laporan fasilitas
//           </h1>

//           <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600 sm:text-base">
//             Laporkan kerusakan fasilitas di area TOD Tangerang Selatan yang
//             tersedia pada peta. Pastikan lokasi dan foto sesuai kondisi
//             sebenarnya.
//           </p>
//         </div>

//         <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-800/15 bg-emerald-50 p-3.5 sm:mt-8 sm:p-4">
//           <Info size={20} className="mt-0.5 shrink-0 text-emerald-800" />
//           <p className="text-xs leading-5 text-emerald-950 sm:text-sm sm:leading-6">
//             Lingkaran hijau menunjukkan area perkiraan yang saat ini digunakan
//             sistem. Area ini belum tentu sama dengan batas resmi TOD.
//           </p>
//         </div>

//         <form
//           onSubmit={handleSubmit}
//           className="mt-6 space-y-4 sm:mt-8 sm:space-y-6"
//         >
//           <FormSection
//             number="01"
//             title="Informasi kerusakan"
//             description="Ceritakan masalah yang kamu temukan."
//           >
//             <div>
//               <FieldLabel htmlFor="report-title">Judul laporan</FieldLabel>
//               <input
//                 id="report-title"
//                 required
//                 maxLength={120}
//                 value={title}
//                 onChange={(event) => setTitle(event.target.value)}
//                 placeholder="Contoh: Lampu pedestrian tidak menyala"
//                 className={inputClass}
//               />
//             </div>

//             <div>
//               <FieldLabel htmlFor="report-category">
//                 Kategori fasilitas
//               </FieldLabel>
//               <select
//                 id="report-category"
//                 required
//                 value={category}
//                 onChange={(event) => setCategory(event.target.value)}
//                 className={`${inputClass} cursor-pointer`}
//               >
//                 <option value="">Pilih kategori fasilitas</option>
//                 {REPORT_CATEGORIES.map((item) => (
//                   <option key={item} value={item}>
//                     {item}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <FieldLabel htmlFor="report-description">
//                 Deskripsi detail
//               </FieldLabel>
//               <textarea
//                 id="report-description"
//                 required
//                 minLength={10}
//                 maxLength={2000}
//                 rows={5}
//                 value={description}
//                 onChange={(event) => setDescription(event.target.value)}
//                 placeholder="Jelaskan kondisi kerusakan, posisi fasilitas, waktu ditemukan, dan dampaknya bagi pengguna..."
//                 className={`${inputClass} min-h-32 resize-y leading-6`}
//               />
//               <p className="mt-2 text-right text-xs text-stone-400">
//                 {description.length}/2000 karakter
//               </p>
//             </div>
//           </FormSection>

//           <FormSection
//             number="02"
//             title="Lokasi kejadian"
//             description="Pilih lokasi di dalam area perkiraan TOD Tangsel."
//           >
//             <div>
//               <FieldLabel htmlFor="location-name">Nama lokasi</FieldLabel>
//               <input
//                 id="location-name"
//                 required
//                 maxLength={200}
//                 value={locationName}
//                 onChange={(event) => setLocationName(event.target.value)}
//                 placeholder="Contoh: Area pedestrian dekat stasiun"
//                 className={inputClass}
//               />
//             </div>

//             <div className="space-y-2">
//               <label
//                 htmlFor="search-location"
//                 className="block text-sm font-medium text-stone-800"
//               >
//                 Cari lokasi di peta
//               </label>

//               <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
//                 <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-stone-200 bg-white px-3.5 focus-within:border-emerald-800 focus-within:ring-2 focus-within:ring-emerald-800/10">
//                   <Search size={18} className="shrink-0 text-stone-400" />
//                   <input
//                     id="search-location"
//                     value={searchLocation}
//                     onChange={(event) =>
//                       setSearchLocation(event.target.value)
//                     }
//                     onKeyDown={(event) => {
//                       if (event.key === "Enter") {
//                         event.preventDefault();
//                         searchPlace();
//                       }
//                     }}
//                     placeholder="Nama tempat atau alamat..."
//                     className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-stone-400"
//                   />
//                 </div>

//                 <button
//                   type="button"
//                   onClick={searchPlace}
//                   disabled={searching}
//                   className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 disabled:opacity-60 sm:min-w-28"
//                 >
//                   {searching ? (
//                     <LoaderCircle size={16} className="animate-spin" />
//                   ) : (
//                     <Search size={16} />
//                   )}
//                   {searching ? "Mencari..." : "Cari lokasi"}
//                 </button>
//               </div>
//             </div>

//             <button
//               type="button"
//               onClick={useMyLocation}
//               disabled={locating}
//               className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-100 disabled:opacity-60 sm:w-auto"
//             >
//               {locating ? (
//                 <LoaderCircle size={18} className="animate-spin" />
//               ) : (
//                 <LocateFixed size={18} />
//               )}
//               {locating ? "Mengambil lokasi..." : "Gunakan lokasi GPS saya"}
//             </button>

//             <div className="overflow-hidden rounded-xl border border-stone-200">
//               <div className="flex items-center justify-between gap-3 border-b border-stone-200 bg-stone-50 px-3.5 py-3 sm:px-4">
//                 <div className="flex min-w-0 items-center gap-2">
//                   <MapPin size={17} className="shrink-0 text-emerald-800" />
//                   <span className="text-xs font-medium text-stone-700 sm:text-sm">
//                     Tentukan titik kerusakan
//                   </span>
//                 </div>
//                 <span className="shrink-0 text-[10px] text-stone-400 sm:text-xs">
//                   Peta interaktif
//                 </span>
//               </div>

//               <div className="relative h-[280px] w-full sm:h-[360px] md:h-[400px]">
//                 <MapContainer
//                   center={defaultPosition}
//                   zoom={13}
//                   scrollWheelZoom
//                   className="h-full w-full"
//                 >
//                   <TileLayer
//                     attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
//                     url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                   />

//                   <MapUpdater position={position} />

//                   <SelectLocation
//                     position={position}
//                     setPosition={setPosition}
//                   />
//                 </MapContainer>
//               </div>
//             </div>

//             <div
//               className={`rounded-xl p-3.5 sm:p-4 ${
//                 selectedTod
//                   ? "bg-emerald-50"
//                   : "border border-red-200 bg-red-50"
//               }`}
//             >
//               <p className="flex items-start gap-2 text-xs leading-5 sm:text-sm">
//                 {selectedTod ? (
//                   <CheckCircle2
//                     size={16}
//                     className="mt-0.5 shrink-0 text-emerald-800"
//                   />
//                 ) : (
//                   <Info size={16} className="mt-0.5 shrink-0 text-red-700" />
//                 )}

//                 <span
//                   className={
//                     selectedTod ? "text-emerald-900" : "text-red-800"
//                   }
//                 >
//                   {selectedTod
//                     ? `Lokasi berada dalam area perkiraan ${selectedTod.name}.`
//                     : "Lokasi berada di luar area TOD yang tersedia. Geser pin ke dalam salah satu lingkaran hijau."}
//                 </span>
//               </p>

//               <div className="mt-3 border-t border-stone-200/70 pt-3">
//                 <p className="text-xs font-medium text-stone-500">
//                   Koordinat lokasi
//                 </p>
//                 <p className="mt-1 break-all font-mono text-xs leading-5 text-stone-700">
//                   {position[0].toFixed(6)}, {position[1].toFixed(6)}
//                 </p>
//               </div>
//             </div>

//             <div className="rounded-xl border border-stone-200 bg-white p-3.5 sm:p-4">
//               <p className="text-sm font-medium text-stone-800">
//                 Area TOD yang tersedia
//               </p>
//               <ul className="mt-3 space-y-2">
//                 {TOD_AREAS.map((area) => (
//                   <li
//                     key={area.id}
//                     className="flex items-start gap-2 text-xs leading-5 text-stone-600 sm:text-sm"
//                   >
//                     <MapPin
//                       size={15}
//                       className="mt-0.5 shrink-0 text-emerald-800"
//                     />
//                     <span>
//                       {area.name} — {area.station}
//                     </span>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           </FormSection>

//           <FormSection
//             number="03"
//             title="Foto bukti"
//             description="Unggah foto yang menunjukkan kondisi fasilitas."
//           >
//             {photoPreview ? (
//               <div className="relative overflow-hidden rounded-xl border border-stone-200 bg-stone-50">
//                 <img
//                   src={photoPreview}
//                   alt="Pratinjau foto bukti kerusakan"
//                   className="max-h-80 w-full object-contain"
//                 />
//                 <button
//                   type="button"
//                   aria-label="Hapus foto"
//                   onClick={removePhoto}
//                   className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-stone-700 shadow-md transition hover:bg-stone-100"
//                 >
//                   <X size={18} />
//                 </button>
//               </div>
//             ) : (
//               <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 bg-[#fafbf8] px-4 py-8 text-center transition hover:border-emerald-700 hover:bg-emerald-50/40 sm:px-6 sm:py-10">
//                 <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-emerald-800 shadow-sm">
//                   <Camera size={22} />
//                 </div>
//                 <span className="mt-4 text-sm font-semibold text-stone-800">
//                   Pilih foto dari perangkat
//                 </span>
//                 <span className="mt-2 text-xs leading-5 text-stone-500">
//                   JPG, PNG, atau WebP · Maksimal 5 MB
//                 </span>
//                 <input
//                   type="file"
//                   accept="image/jpeg,image/png,image/webp"
//                   onChange={handlePhoto}
//                   className="sr-only"
//                 />
//               </label>
//             )}

//             {photo && (
//               <div className="flex min-w-0 items-start gap-2 rounded-xl bg-emerald-50 p-3">
//                 <CheckCircle2
//                   size={17}
//                   className="mt-0.5 shrink-0 text-emerald-800"
//                 />
//                 <div className="min-w-0">
//                   <p className="break-words text-sm font-medium text-emerald-900">
//                     {photo.name}
//                   </p>
//                   <p className="mt-1 text-xs text-emerald-800">
//                     {(photo.size / (1024 * 1024)).toFixed(2)} MB
//                   </p>
//                 </div>
//               </div>
//             )}
//           </FormSection>

//           {message && (
//             <div
//               role="status"
//               aria-live="polite"
//               className={`flex items-start gap-3 rounded-xl border p-3.5 text-sm leading-6 sm:p-4 ${
//                 messageType === "error"
//                   ? "border-red-200 bg-red-50 text-red-800"
//                   : messageType === "success"
//                     ? "border-emerald-200 bg-emerald-50 text-emerald-900"
//                     : "border-stone-200 bg-white text-stone-700"
//               }`}
//             >
//               {messageType === "success" ? (
//                 <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
//               ) : (
//                 <Info size={19} className="mt-0.5 shrink-0" />
//               )}
//               <p className="min-w-0 break-words">{message}</p>
//             </div>
//           )}

//           <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
//             <Link
//               to="/peta"
//               className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-stone-300 px-6 py-3.5 text-sm font-semibold text-stone-700 transition hover:bg-white sm:w-auto"
//             >
//               <ArrowLeft size={17} />
//               Kembali ke peta
//             </Link>

//             <button
//               type="submit"
//               disabled={submitting}
//               className="inline-flex min-h-12 w-full touch-manipulation items-center justify-center gap-2 rounded-full bg-emerald-800 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
//             >
//               {submitting ? (
//                 <>
//                   <LoaderCircle size={17} className="animate-spin" />
//                   Menyimpan laporan...
//                 </>
//               ) : (
//                 <>
//                   Kirim laporan
//                   <ArrowRight size={17} />
//                 </>
//               )}
//             </button>
//           </div>
//         </form>
//       </section>
//     </main>
//   );
// }


import { useEffect, useRef, useState } from "react";
import {
  Camera,
  MapPin,
  LocateFixed,
  Search,
  X,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Info,
  LoaderCircle,
  LockKeyhole,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";

import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { supabase } from "../lib/supabase";
import { REPORT_CATEGORIES } from "../constants/reportCategories";
import { TOD_AREAS } from "../data/todAreas";

import "leaflet/dist/leaflet.css";

const defaultPosition = [-6.3147, 106.6811];
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
const STORAGE_BUCKET = "report-photos";

const locationIcon = new L.DivIcon({
  className: "",
  html: `
    <div style="
      width:34px;
      height:34px;
      background:#166534;
      border:4px solid white;
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      box-shadow:0 2px 8px #0003;
      position:relative;
    ">
      <div style="
        position:absolute;
        width:8px;
        height:8px;
        background:white;
        border-radius:50%;
        top:9px;
        left:9px;
      "></div>
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
});

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

  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function findTodArea(position) {
  if (
    !Array.isArray(position) ||
    position.length !== 2 ||
    !Number.isFinite(position[0]) ||
    !Number.isFinite(position[1])
  ) {
    return null;
  }

  return (
    TOD_AREAS.find((area) => {
      const distance = distanceInMeters(
        position[0],
        position[1],
        area.center.latitude,
        area.center.longitude,
      );

      return distance <= area.radiusMeters;
    }) || null
  );
}

/**
 * Pencarian alamat berdasarkan koordinat.
 * Jika layanan alamat gagal, aplikasi tetap bisa digunakan.
 */
async function reverseGeocode(lat, lon) {
  const url =
    `https://nominatim.openstreetmap.org/reverse` +
    `?format=jsonv2&lat=${encodeURIComponent(lat)}` +
    `&lon=${encodeURIComponent(lon)}` +
    `&zoom=18&addressdetails=1`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Alamat tidak berhasil ditemukan.");
  }

  const result = await response.json();
  return result.display_name || "";
}

/**
 * Peta mengirim koordinat baru ketika diklik.
 * Lingkaran hijau merupakan area perkiraan TOD.
 */
function SelectLocation({ position, setPosition }) {
  useMapEvents({
    click(event) {
      setPosition([event.latlng.lat, event.latlng.lng]);
    },
  });

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
            fillOpacity: 0.12,
            weight: 2,
            dashArray: "6 6",
          }}
        />
      ))}

      <Marker
        position={position}
        icon={locationIcon}
        draggable
        eventHandlers={{
          dragend(event) {
            const point = event.target.getLatLng();
            setPosition([point.lat, point.lng]);
          },
        }}
      />
    </>
  );
}

/**
 * Menggerakkan peta mengikuti posisi terbaru,
 * termasuk hasil pencarian tempat di luar Tangsel.
 */
function MapUpdater({ position }) {
  const map = useMap();

  useEffect(() => {
    if (!Array.isArray(position)) return;

    map.flyTo(position, Math.max(map.getZoom(), 15), {
      duration: 0.7,
    });
  }, [map, position]);

  return null;
}

function FormSection({ number, title, description, children }) {
  return (
    <section className="min-w-0 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6 md:p-8">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-sm font-semibold text-emerald-800 sm:h-10 sm:w-10">
          {number}
        </div>

        <div className="min-w-0 pt-0.5">
          <h2 className="text-base font-semibold text-stone-900 sm:text-lg">
            {title}
          </h2>
          <p className="mt-1 text-xs leading-5 text-stone-500 sm:text-sm">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-5 sm:mt-7">{children}</div>
    </section>
  );
}

function FieldLabel({ htmlFor, children }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block text-sm font-medium text-stone-800"
    >
      {children} <span className="text-red-600">*</span>
    </label>
  );
}

const inputClass =
  "w-full min-w-0 rounded-xl border border-stone-200 bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-stone-400 focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/10 sm:px-4";

export default function CreateReport() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, role, loading } = useAuth();
  const { showToast } = useToast();

  const [title, setTitle] = useState("");
  const [locationName, setLocationName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [position, setPosition] = useState(defaultPosition);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [locating, setLocating] = useState(false);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [resolvingAddress, setResolvingAddress] = useState(false);

  const redirectHandled = useRef(false);
  const reverseRequestId = useRef(0);
  const manualLocationEdit = useRef(false);

  const isStaff = role === "petugas";
  const selectedTod = findTodArea(position);

  useEffect(() => {
    if (loading || redirectHandled.current) return;

    if (!user) {
      redirectHandled.current = true;

      showToast({
        type: "info",
        title: "Login diperlukan",
        message:
          "Silakan masuk atau daftar sebagai warga untuk membuat laporan.",
      });

      navigate("/login", {
        replace: true,
        state: { from: "/buat-laporan" },
      });

      return;
    }

    if (isStaff) {
      redirectHandled.current = true;

      showToast({
        type: "error",
        title: "Akses khusus warga",
        message:
          "Akun petugas tidak dapat membuat laporan. Silakan kelola laporan yang masuk.",
      });

      navigate("/kelola-laporan", { replace: true });
    }
  }, [loading, user, isStaff, navigate, showToast]);

  useEffect(() => {
    if (!photoPreview) return undefined;

    return () => URL.revokeObjectURL(photoPreview);
  }, [photoPreview]);

  /**
   * Setiap koordinat berubah, cari alamatnya.
   * ID permintaan mencegah hasil pencarian lama menimpa hasil terbaru.
   */
  useEffect(() => {
    if (
      !Array.isArray(position) ||
      !Number.isFinite(position[0]) ||
      !Number.isFinite(position[1])
    ) {
      return undefined;
    }

    const requestId = ++reverseRequestId.current;
    let cancelled = false;

    const timer = setTimeout(async () => {
      setResolvingAddress(true);

      try {
        const address = await reverseGeocode(position[0], position[1]);

        if (
          cancelled ||
          requestId !== reverseRequestId.current ||
          !address
        ) {
          return;
        }

        // Isi otomatis hanya jika pengguna belum mengetik manual.
        if (!manualLocationEdit.current) {
          setLocationName(address);
        }
      } catch (error) {
        console.warn("Pencarian alamat otomatis gagal:", error);
      } finally {
        if (
          !cancelled &&
          requestId === reverseRequestId.current
        ) {
          setResolvingAddress(false);
        }
      }
    }, 450);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [position]);

  function showMessage(text, type = "info") {
    setMessage(text);
    setMessageType(type);
  }

  function handlePositionChange(nextPosition) {
    manualLocationEdit.current = false;
    setPosition(nextPosition);
  }

  function handleLocationNameChange(value) {
    manualLocationEdit.current = true;
    setLocationName(value);
  }

  function handlePhoto(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      showMessage("Gunakan foto berformat JPG, PNG, atau WebP.", "error");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_PHOTO_SIZE) {
      showMessage("Ukuran foto maksimal 5 MB.", "error");
      event.target.value = "";
      return;
    }

    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    showMessage("Foto berhasil dipilih.", "success");
  }

  function removePhoto() {
    setPhoto(null);
    setPhotoPreview("");
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      showMessage("Browser kamu tidak mendukung GPS.", "error");
      return;
    }

    setLocating(true);
    setMessage("");

    navigator.geolocation.getCurrentPosition(
      (result) => {
        const nextPosition = [
          result.coords.latitude,
          result.coords.longitude,
        ];

        handlePositionChange(nextPosition);
        setLocating(false);

        const area = findTodArea(nextPosition);

        if (area) {
          showMessage(
            `Lokasi berada di area perkiraan ${area.name}. Periksa kembali titik pada peta.`,
            "success",
          );
        } else {
          showMessage(
            "Lokasi berada di luar area TOD yang tersedia. Pilih lokasi di dalam lingkaran hijau.",
            "error",
          );
        }
      },
      (error) => {
        setLocating(false);

        showMessage(
          error.code === error.PERMISSION_DENIED
            ? "Akses lokasi ditolak. Izinkan akses lokasi pada browser atau pilih titik langsung di peta."
            : "Lokasi tidak berhasil diambil. Coba lagi atau pilih titik langsung di peta.",
          "error",
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  }

  /**
   * Pencarian tidak lagi dipaksa berada di Tangerang Selatan.
   * Hasil lokasi luar Tangsel tetap ditampilkan pada peta,
   * tetapi validasi TOD tetap mencegah pengiriman laporan.
   */
  async function searchPlace() {
    const query = searchLocation.trim();

    if (!query) {
      showMessage(
        "Masukkan nama tempat atau alamat terlebih dahulu.",
        "error",
      );
      return;
    }

    setSearching(true);
    setMessage("");

    try {
      const url =
        "https://nominatim.openstreetmap.org/search" +
        `?format=jsonv2&limit=5&countrycodes=id&q=${encodeURIComponent(query)}`;

      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Pencarian lokasi gagal.");
      }

      const results = await response.json();

      if (!results.length) {
        showMessage(
          "Lokasi tidak ditemukan. Coba nama tempat yang lebih spesifik, misalnya Stasiun Duri, Jakarta Barat.",
          "error",
        );
        return;
      }

      // Utamakan hasil yang namanya paling relevan dengan pencarian.
      const normalizedQuery = query.toLowerCase();

      const result =
        results.find((item) =>
          (item.display_name || "")
            .toLowerCase()
            .includes(normalizedQuery),
        ) || results[0];

      const lat = Number(result.lat);
      const lon = Number(result.lon);

      if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        throw new Error("Koordinat hasil pencarian tidak valid.");
      }

      const nextPosition = [lat, lon];

      manualLocationEdit.current = false;
      setPosition(nextPosition);
      setLocationName(result.display_name || "");
      setMessage("");

      const area = findTodArea(nextPosition);

      if (area) {
        showMessage(
          `Lokasi ditemukan di area perkiraan ${area.name}. Periksa titiknya sebelum mengirim.`,
          "success",
        );
      } else {
        showMessage(
          "Lokasi ditemukan dan peta dipindahkan, tetapi titik berada di luar area perkiraan TOD yang tersedia. Kamu tidak dapat mengirim laporan dari titik ini.",
          "error",
        );
      }
    } catch (error) {
      console.error("Pencarian lokasi gagal:", error);

      showMessage(
        "Pencarian lokasi gagal. Periksa koneksi internet atau pilih titik manual pada peta.",
        "error",
      );
    } finally {
      setSearching(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (submitting) return;

    if (loading || !user) {
      showToast({
        type: "info",
        title: "Login diperlukan",
        message:
          "Silakan masuk atau daftar terlebih dahulu untuk mengirim laporan.",
      });

      navigate("/login", {
        state: { from: "/buat-laporan" },
      });

      return;
    }

    if (isStaff) {
      showToast({
        type: "error",
        title: "Akses ditolak",
        message: "Akun petugas hanya dapat mengelola laporan yang masuk.",
      });

      navigate("/kelola-laporan");
      return;
    }

    const cleanTitle = title.trim();
    const cleanLocation = locationName.trim();
    const cleanDescription = description.trim();

    if (!cleanTitle) {
      showMessage("Silakan isi judul laporan.", "error");
      return;
    }

    if (!REPORT_CATEGORIES.includes(category)) {
      showMessage("Silakan pilih kategori fasilitas yang tersedia.", "error");
      return;
    }

    if (cleanDescription.length < 10) {
      showMessage("Deskripsi kerusakan minimal 10 karakter.", "error");
      return;
    }

    if (!cleanLocation) {
      showMessage(
        "Nama lokasi belum terisi. Pilih titik pada peta atau isi nama lokasi secara manual.",
        "error",
      );
      return;
    }

    // Validasi area sebelum unggah foto dan simpan ke database.
    const area = findTodArea(position);

    if (!area) {
      showMessage(
        "Laporan hanya dapat dibuat di area perkiraan TOD Tangerang Selatan. Pilih titik di dalam salah satu lingkaran hijau pada peta.",
        "error",
      );
      return;
    }

    if (!photo) {
      showMessage("Silakan unggah foto bukti kerusakan.", "error");
      return;
    }

    setSubmitting(true);
    showMessage("Sedang mengunggah foto dan menyimpan laporan.");

    let uploadedPath = null;

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!session?.user || session.user.id !== user.id) {
        throw new Error("Sesi login tidak valid. Silakan login kembali.");
      }

      const safeFileName = photo.name
        .normalize("NFKD")
        .replace(/[^a-zA-Z0-9._-]/g, "_")
        .slice(-100);

      const filePath =
        `${user.id}/${crypto.randomUUID()}-${safeFileName}`;

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, photo, {
          contentType: photo.type,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      uploadedPath = filePath;

      const { data: publicUrlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

      const { data: savedReport, error: insertError } = await supabase
        .from("reports")
        .insert({
          user_id: user.id,
          title: cleanTitle,
          category,
          description: cleanDescription,
          location_name: cleanLocation,
          latitude: position[0],
          longitude: position[1],
          photo_url: publicUrlData.publicUrl,
          status: "Pending",
        })
        .select("id")
        .single();

      if (insertError) throw insertError;

      uploadedPath = null;

      showToast({
        type: "success",
        title: "Laporan berhasil dikirim!",
        message: `Laporanmu tercatat pada area perkiraan ${area.name} dan menunggu tindak lanjut.`,
      });

      navigate("/laporan-saya", {
        replace: true,
        state: { reportId: savedReport.id },
      });
    } catch (error) {
      console.error("Gagal menyimpan laporan:", error);

      if (uploadedPath) {
        const { error: cleanupError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .remove([uploadedPath]);

        if (cleanupError) {
          console.error(
            "Gagal membersihkan foto sementara:",
            cleanupError,
          );
        }
      }

      const errorMessage = error.message || "";

      if (
        errorMessage.toLowerCase().includes("row-level security") ||
        errorMessage.toLowerCase().includes("permission denied")
      ) {
        showMessage(
          "Akses ditolak oleh keamanan Supabase. Periksa policy tabel reports dan bucket report-photos.",
          "error",
        );
      } else {
        showMessage(
          `Laporan belum berhasil disimpan: ${
            errorMessage || "Terjadi kesalahan. Silakan coba lagi."
          }`,
          "error",
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-[#fafbf8] px-4">
        <div className="flex items-center gap-3 text-sm text-stone-600">
          <LoaderCircle
            size={22}
            className="animate-spin text-emerald-800"
          />
          Memeriksa sesi akun...
        </div>
      </main>
    );
  }

  if (!user || isStaff) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-[#fafbf8] px-4">
        <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-7 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-800">
            <LockKeyhole size={25} />
          </div>

          <h1 className="mt-4 text-xl font-semibold text-stone-900">
            {isStaff
              ? "Menu khusus warga"
              : "Masuk untuk membuat laporan"}
          </h1>

          <p className="mt-2 text-sm leading-6 text-stone-600">
            {isStaff
              ? "Akun petugas digunakan untuk memantau dan mengelola laporan yang masuk."
              : "Kamu perlu masuk atau mendaftar sebagai warga sebelum mengirim laporan fasilitas publik."}
          </p>

          {!isStaff ? (
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/login"
                state={{ from: location.pathname }}
                className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
              >
                Masuk
              </Link>

              <Link
                to="/daftar"
                state={{ from: location.pathname }}
                className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-emerald-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900"
              >
                Daftar
              </Link>
            </div>
          ) : (
            <Link
              to="/kelola-laporan"
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900"
            >
              Buka Kelola Laporan
            </Link>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fafbf8]">
      <section className="mx-auto max-w-4xl px-4 py-7 sm:px-6 sm:py-10 md:px-8 md:py-14">
        <Link
          to="/"
          className="inline-flex min-h-9 items-center gap-2 text-sm font-medium text-stone-500 transition hover:text-emerald-800"
        >
          <ArrowLeft size={16} />
          Kembali ke Home
        </Link>

        <div className="mt-6 sm:mt-7">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-emerald-800 sm:text-xs">
            KONTRIBUSI WARGA · TANGERANG SELATAN
          </p>

          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl md:text-4xl">
            Buat laporan fasilitas
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600 sm:text-base">
            Laporkan kerusakan fasilitas di area TOD Tangerang Selatan yang
            tersedia pada peta. Pastikan lokasi dan foto sesuai kondisi
            sebenarnya.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4 sm:mt-8 sm:space-y-6"
        >
          <FormSection
            number="01"
            title="Informasi kerusakan"
            description="Ceritakan masalah yang kamu temukan."
          >
            <div>
              <FieldLabel htmlFor="report-title">
                Judul laporan
              </FieldLabel>
              <input
                id="report-title"
                required
                maxLength={120}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Contoh: Lampu pedestrian tidak menyala"
                className={inputClass}
              />
            </div>

            <div>
              <FieldLabel htmlFor="report-category">
                Kategori fasilitas
              </FieldLabel>
              <select
                id="report-category"
                required
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className={`${inputClass} cursor-pointer`}
              >
                <option value="">Pilih kategori fasilitas</option>
                {REPORT_CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <FieldLabel htmlFor="report-description">
                Deskripsi detail
              </FieldLabel>
              <textarea
                id="report-description"
                required
                minLength={10}
                maxLength={2000}
                rows={5}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Jelaskan kondisi kerusakan, posisi fasilitas, waktu ditemukan, dan dampaknya bagi pengguna..."
                className={`${inputClass} min-h-32 resize-y leading-6`}
              />
              <p className="mt-2 text-right text-xs text-stone-400">
                {description.length}/2000 karakter
              </p>
            </div>
          </FormSection>

          <FormSection
            number="02"
            title="Lokasi kejadian"
            description="Pilih lokasi di dalam area perkiraan TOD Tangsel."
          >
            <div>
              <FieldLabel htmlFor="location-name">
                Nama lokasi
              </FieldLabel>
              <input
                id="location-name"
                required
                maxLength={200}
                value={locationName}
                onChange={(event) =>
                  handleLocationNameChange(event.target.value)
                }
                placeholder="Contoh: Area pedestrian dekat stasiun"
                className={inputClass}
              />

              <p className="mt-2 text-xs text-stone-500">
                {resolvingAddress
                  ? "Sedang mencari nama alamat berdasarkan titik..."
                  : "Nama lokasi dapat terisi otomatis setelah titik dipindahkan. Kamu juga bisa mengubahnya secara manual."}
              </p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="search-location"
                className="block text-sm font-medium text-stone-800"
              >
                Cari lokasi di peta
              </label>

              <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
                <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-stone-200 bg-white px-3.5 focus-within:border-emerald-800 focus-within:ring-2 focus-within:ring-emerald-800/10">
                  <Search size={18} className="shrink-0 text-stone-400" />
                  <input
                    id="search-location"
                    value={searchLocation}
                    onChange={(event) =>
                      setSearchLocation(event.target.value)
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        searchPlace();
                      }
                    }}
                    placeholder="Misalnya Stasiun Duri, Jakarta Barat"
                    className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-stone-400"
                  />
                </div>

                <button
                  type="button"
                  onClick={searchPlace}
                  disabled={searching}
                  className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 disabled:opacity-60 sm:min-w-28"
                >
                  {searching ? (
                    <LoaderCircle size={16} className="animate-spin" />
                  ) : (
                    <Search size={16} />
                  )}
                  {searching ? "Mencari..." : "Cari lokasi"}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={useMyLocation}
              disabled={locating}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-100 disabled:opacity-60 sm:w-auto"
            >
              {locating ? (
                <LoaderCircle size={18} className="animate-spin" />
              ) : (
                <LocateFixed size={18} />
              )}
              {locating ? "Mengambil lokasi..." : "Gunakan lokasi GPS saya"}
            </button>

            <div className="overflow-hidden rounded-xl border border-stone-200">
              <div className="flex items-center justify-between gap-3 border-b border-stone-200 bg-stone-50 px-3.5 py-3 sm:px-4">
                <div className="flex min-w-0 items-center gap-2">
                  <MapPin size={17} className="shrink-0 text-emerald-800" />
                  <span className="text-xs font-medium text-stone-700 sm:text-sm">
                    Tentukan titik kerusakan
                  </span>
                </div>
                <span className="shrink-0 text-[10px] text-stone-400 sm:text-xs">
                  Peta interaktif
                </span>
              </div>

              <div className="relative h-[280px] w-full sm:h-[360px] md:h-[400px]">
                <MapContainer
                  center={defaultPosition}
                  zoom={13}
                  scrollWheelZoom
                  className="h-full w-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <MapUpdater position={position} />

                  <SelectLocation
                    position={position}
                    setPosition={handlePositionChange}
                  />
                </MapContainer>
              </div>
            </div>

            <div
              className={`rounded-xl p-3.5 sm:p-4 ${
                selectedTod
                  ? "bg-emerald-50"
                  : "border border-red-200 bg-red-50"
              }`}
            >
              <p className="flex items-start gap-2 text-xs leading-5 sm:text-sm">
                {selectedTod ? (
                  <CheckCircle2
                    size={16}
                    className="mt-0.5 shrink-0 text-emerald-800"
                  />
                ) : (
                  <Info
                    size={16}
                    className="mt-0.5 shrink-0 text-red-700"
                  />
                )}

                <span
                  className={
                    selectedTod ? "text-emerald-900" : "text-red-800"
                  }
                >
                  {selectedTod
                    ? `Lokasi berada dalam area perkiraan ${selectedTod.name}.`
                    : "Lokasi berada di luar area TOD yang tersedia. Geser pin ke dalam salah satu lingkaran hijau."}
                </span>
              </p>

              <div className="mt-3 border-t border-stone-200/70 pt-3">
                <p className="text-xs font-medium text-stone-500">
                  Koordinat lokasi
                </p>
                <p className="mt-1 break-all font-mono text-xs leading-5 text-stone-700">
                  {position[0].toFixed(6)}, {position[1].toFixed(6)}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-stone-200 bg-white p-3.5 sm:p-4">
              <p className="text-sm font-medium text-stone-800">
                Area TOD yang tersedia
              </p>
              <ul className="mt-3 space-y-2">
                {TOD_AREAS.map((area) => (
                  <li
                    key={area.id}
                    className="flex items-start gap-2 text-xs leading-5 text-stone-600 sm:text-sm"
                  >
                    <MapPin
                      size={15}
                      className="mt-0.5 shrink-0 text-emerald-800"
                    />
                    <span>
                      {area.name} — {area.station}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </FormSection>

          <FormSection
            number="03"
            title="Foto bukti"
            description="Unggah foto yang menunjukkan kondisi fasilitas."
          >
            {photoPreview ? (
              <div className="relative overflow-hidden rounded-xl border border-stone-200 bg-stone-50">
                <img
                  src={photoPreview}
                  alt="Pratinjau foto bukti kerusakan"
                  className="max-h-80 w-full object-contain"
                />
                <button
                  type="button"
                  aria-label="Hapus foto"
                  onClick={removePhoto}
                  className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-stone-700 shadow-md transition hover:bg-stone-100"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 bg-[#fafbf8] px-4 py-8 text-center transition hover:border-emerald-700 hover:bg-emerald-50/40 sm:px-6 sm:py-10">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-emerald-800 shadow-sm">
                  <Camera size={22} />
                </div>
                <span className="mt-4 text-sm font-semibold text-stone-800">
                  Pilih foto dari perangkat
                </span>
                <span className="mt-2 text-xs leading-5 text-stone-500">
                  JPG, PNG, atau WebP · Maksimal 5 MB
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhoto}
                  className="sr-only"
                />
              </label>
            )}

            {photo && (
              <div className="flex min-w-0 items-start gap-2 rounded-xl bg-emerald-50 p-3">
                <CheckCircle2
                  size={17}
                  className="mt-0.5 shrink-0 text-emerald-800"
                />
                <div className="min-w-0">
                  <p className="break-words text-sm font-medium text-emerald-900">
                    {photo.name}
                  </p>
                  <p className="mt-1 text-xs text-emerald-800">
                    {(photo.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
            )}
          </FormSection>

          {message && (
            <div
              role="status"
              aria-live="polite"
              className={`flex items-start gap-3 rounded-xl border p-3.5 text-sm leading-6 sm:p-4 ${
                messageType === "error"
                  ? "border-red-200 bg-red-50 text-red-800"
                  : messageType === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                    : "border-stone-200 bg-white text-stone-700"
              }`}
            >
              {messageType === "success" ? (
                <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
              ) : (
                <Info size={19} className="mt-0.5 shrink-0" />
              )}
              <p className="min-w-0 break-words">{message}</p>
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
            <Link
              to="/peta"
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-stone-300 px-6 py-3.5 text-sm font-semibold text-stone-700 transition hover:bg-white sm:w-auto"
            >
              <ArrowLeft size={17} />
              Kembali ke peta
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex min-h-12 w-full touch-manipulation items-center justify-center gap-2 rounded-full bg-emerald-800 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {submitting ? (
                <>
                  <LoaderCircle size={17} className="animate-spin" />
                  Menyimpan laporan...
                </>
              ) : (
                <>
                  Kirim laporan
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}