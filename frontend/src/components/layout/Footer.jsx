import { Link } from "react-router-dom";
import { MapPin, ArrowUpRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const guestLinks = [
  { label: "Beranda", to: "/" },
  { label: "Peta Persebaran", to: "/peta" },
  { label: "Buat Laporan", to: "/buat-laporan", featured: true },
];

const citizenLinks = [
  { label: "Beranda", to: "/" },
  { label: "Peta Persebaran", to: "/peta" },
  { label: "Buat Laporan", to: "/buat-laporan", featured: true },
  { label: "Laporan Saya", to: "/laporan-saya", featured: true },
];

const staffLinks = [
  { label: "Kelola Laporan", to: "/kelola-laporan" },
  { label: "Peta Persebaran", to: "/peta" },
];

export default function Footer() {
  const { user, role, loading } = useAuth();

  const isLoggedIn = Boolean(user);
  const isStaff = !loading && isLoggedIn && role === "petugas";
  const isCitizen = !loading && isLoggedIn && role !== "petugas";

  const footerLinks = loading ? guestLinks : isStaff ? staffLinks : isCitizen ? citizenLinks : guestLinks;

  const homePath = isStaff ? "/kelola-laporan" : "/";

  return (
    <footer className="border-t border-stone-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-7 md:px-8">
        
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          {/* Identitas LaporTOD */}
          <div className="flex items-center gap-3">
            <Link
              to={homePath}
              className="inline-flex items-center gap-2 rounded-lg transition hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
              aria-label="LaporTOD"
            >
              <MapPin size={22} strokeWidth={2.2} className="shrink-0 text-emerald-800" />
              <span className="text-base font-bold tracking-tight text-stone-900">LaporTOD</span>
            </Link>

            {/* Identitas area akun */}
            {!loading && isLoggedIn && (
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${isStaff ? "bg-blue-50 text-blue-800" : "bg-emerald-50 text-emerald-800"}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${isStaff ? "bg-blue-600" : "bg-emerald-600"}`} />
                {isStaff ? "Area Petugas" : "Area Warga"}
              </span>
            )}
          </div>

          {/* Navigasi sesuai status akun */}
          <nav aria-label="Navigasi footer" className="flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-stone-100 pt-4 text-sm sm:justify-end sm:border-0 sm:pt-0 sm:gap-x-6">
            {footerLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={[
                  "inline-flex min-h-9 items-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2",
                  item.featured ? "font-semibold text-emerald-800 hover:text-emerald-950" : isStaff ? "font-medium text-stone-600 hover:text-blue-800" : "font-medium text-stone-600 hover:text-emerald-800",
                ].join(" ")}
              >
                {item.label}
                {item.featured && <ArrowUpRight size={15} />}
              </Link>
            ))}
          </nav>
        </div>

        {/* Copyright */}
        <div className="mt-5 border-t border-stone-100 pt-4">
          <p className="text-center text-[11px] leading-5 text-stone-500 sm:text-left sm:text-xs">© {new Date().getFullYear()} LaporTOD.</p>
        </div>
      </div>
    </footer>
  );
}
