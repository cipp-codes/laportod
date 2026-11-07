import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { MapPin, Menu, X, ChevronDown, ClipboardList, LogOut, Settings, LoaderCircle, Map } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

const guestNavItems = [
  { label: "Beranda", to: "/" },
  { label: "Peta Persebaran", to: "/peta" },
  { label: "Buat Laporan", to: "/buat-laporan" },
];

const citizenNavItems = [
  { label: "Beranda", to: "/" },
  { label: "Peta Persebaran", to: "/peta" },
  { label: "Buat Laporan", to: "/buat-laporan" },
  { label: "Laporan Saya", to: "/laporan-saya" },
];

const staffNavItems = [
  { label: "Kelola Laporan", to: "/kelola-laporan" },
  { label: "Peta Persebaran", to: "/peta" },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const { user, profile, role, loading, signOut } = useAuth();
  const { showToast } = useToast();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const navbarRef = useRef(null);
  const profileRef = useRef(null);

  const isLoggedIn = Boolean(user);
  const isStaff = !loading && isLoggedIn && role === "petugas";

  const displayName = profile?.full_name?.trim() || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Pengguna";

  const initial = displayName.charAt(0).toUpperCase();

  const navItems = loading ? guestNavItems : !isLoggedIn ? guestNavItems : isStaff ? staffNavItems : citizenNavItems;

  useEffect(() => {
    function handlePointerDown(event) {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        setMobileOpen(false);
        setProfileOpen(false);
      }

      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setMobileOpen(false);
        setProfileOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location.pathname, user?.id]);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 640) {
        setMobileOpen(false);
        setProfileOpen(false);
      }
    }

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function closeMenus() {
    setMobileOpen(false);
    setProfileOpen(false);
  }

  function handleCreateReport(event) {
    closeMenus();

    // Tunggu status autentikasi selesai dimuat sebelum mengambil keputusan.
    if (loading) return;

    // Petugas tidak menggunakan halaman pengiriman laporan warga.
    if (isStaff) {
      event.preventDefault();

      showToast({
        type: "info",
        title: "Menu khusus warga",
        message: "Akun petugas tidak dapat membuat laporan warga.",
      });

      navigate("/kelola-laporan");
      return;
    }

    // Pengunjung harus masuk atau mendaftar sebelum membuat laporan.
    if (!isLoggedIn) {
      event.preventDefault();

      showToast({
        type: "info",
        title: "Masuk untuk membuat laporan",
        message: "Silakan masuk atau daftar terlebih dahulu.",
      });

      navigate("/login", {
        state: { from: "/buat-laporan" },
      });
    }
  }

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      const result = await signOut();

      if (result?.error) {
        throw result.error;
      }

      closeMenus();

      showToast({
        type: "success",
        title: "Berhasil keluar",
        message: "Kamu sudah keluar dari akun LaporTOD.",
      });

      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout gagal:", error);

      showToast({
        type: "error",
        title: "Gagal keluar",
        message: "Terjadi kesalahan. Silakan coba lagi.",
      });
    } finally {
      setLoggingOut(false);
    }
  }

  function getDesktopLinkClass(isActive) {
    return ["inline-flex min-h-11 items-center whitespace-nowrap border-b-2 text-sm font-medium transition-colors", isActive ? "border-emerald-800 text-emerald-800" : "border-transparent text-stone-600 hover:text-emerald-800"].join(" ");
  }

  function getMobileLinkClass(isActive) {
    return [
      "flex min-h-12 w-full touch-manipulation items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
      isActive ? "bg-emerald-50 text-emerald-800" : "text-stone-700 hover:bg-stone-100 active:bg-stone-100",
    ].join(" ");
  }

  function ProfileMenuLinks({ mobile = false }) {
    const linkClass = mobile
      ? "flex min-h-12 touch-manipulation items-center gap-3 rounded-xl px-4 py-3 text-sm text-stone-700 hover:bg-stone-100"
      : "flex min-h-11 touch-manipulation items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-stone-700 hover:bg-stone-50 hover:text-emerald-800";

    return (
      <Link to={isStaff ? "/kelola-laporan" : "/laporan-saya"} onClick={closeMenus} className={linkClass}>
        {isStaff ? <Settings size={18} /> : <ClipboardList size={18} />}
        {isStaff ? "Kelola Laporan" : "Laporan Saya"}
      </Link>
    );
  }

  function LogoutButton({ mobile = false }) {
    return (
      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        className={`flex min-h-11 w-full touch-manipulation items-center gap-3 rounded-xl ${mobile ? "px-4 py-3" : "px-3 py-2.5"} text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-60`}
      >
        {loggingOut ? <LoaderCircle size={18} className="animate-spin" /> : <LogOut size={18} />}
        {loggingOut ? "Sedang keluar..." : "Keluar"}
      </button>
    );
  }

  function AccountInfo({ mobile = false }) {
    return (
      <div className={`flex items-center gap-3 ${mobile ? "px-3 py-2" : ""}`}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-900">{initial}</div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-stone-900">{displayName}</p>

          <p className="truncate text-xs text-stone-500">{user?.email}</p>

          <span className="mt-1.5 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">{isStaff ? "Petugas" : "Warga"}</span>
        </div>
      </div>
    );
  }

  function renderNavIcon(item) {
    if (item.to === "/peta") return Map;
    if (item.to === "/kelola-laporan") return Settings;
    if (item.to === "/buat-laporan") return ClipboardList;
    return MapPin;
  }

  function handleNavClick(event, item) {
    if (item.to === "/buat-laporan") {
      handleCreateReport(event);
    } else {
      closeMenus();
    }
  }

  return (
    <header ref={navbarRef} className="sticky top-0 z-[2000] border-b border-stone-200/80 bg-[#fafbf8] shadow-sm">
      <nav aria-label="Navigasi utama" className="mx-auto flex min-h-[68px] max-w-7xl items-center justify-between gap-3 px-4 sm:min-h-[72px] sm:px-6 lg:min-h-[76px] lg:px-8">
        {/* Logo */}
        <Link to={isStaff ? "/kelola-laporan" : "/"} onClick={closeMenus} className="flex min-w-0 shrink-0 touch-manipulation items-center gap-2.5 rounded-lg" aria-label="LaporTOD">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-800 text-white">
            <MapPin size={23} strokeWidth={2.2} />
          </span>

          <span className="min-w-0">
            <span className="block text-lg font-bold tracking-tight text-stone-900 sm:text-xl">LaporTOD</span>
          </span>
        </Link>

        {/* Navigasi desktop */}
        <div className="hidden items-center gap-4 sm:flex lg:gap-7">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === "/"} onClick={(event) => handleNavClick(event, item)} className={({ isActive }) => getDesktopLinkClass(isActive)}>
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Aksi desktop */}
        <div className="hidden shrink-0 items-center gap-2 sm:flex lg:gap-3">
          {loading ? (
            <div className="h-10 w-10 animate-pulse rounded-full bg-stone-200" aria-label="Memuat akun" />
          ) : isLoggedIn ? (
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((open) => !open)}
                aria-label="Buka menu profil"
                aria-expanded={profileOpen}
                aria-haspopup="menu"
                className="flex min-h-11 max-w-[200px] touch-manipulation items-center gap-2 rounded-full border border-stone-200 bg-white py-1 pl-1 pr-3 transition hover:border-emerald-300 hover:bg-emerald-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-900">{initial}</span>

                <span className="max-w-[100px] truncate text-sm font-medium text-stone-700">{displayName}</span>

                <ChevronDown size={16} className={`shrink-0 text-stone-500 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
              </button>

              {profileOpen && (
                <div role="menu" className="absolute right-0 top-full z-[2010] mt-2 w-64 overflow-hidden rounded-2xl border border-stone-200 bg-white p-2 shadow-xl">
                  <div className="border-b border-stone-100 px-3 py-3">
                    <AccountInfo />
                  </div>

                  <div className="mt-1">
                    <ProfileMenuLinks />
                  </div>

                  <LogoutButton />
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                state={{ from: location.pathname === "/buat-laporan" ? "/buat-laporan" : undefined }}
                className="inline-flex min-h-10 touch-manipulation items-center justify-center rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-emerald-800 hover:text-emerald-800 lg:px-5"
              >
                Masuk
              </Link>

              <Link
                to="/daftar"
                state={{ from: location.pathname === "/buat-laporan" ? "/buat-laporan" : undefined }}
                className="inline-flex min-h-10 touch-manipulation items-center justify-center rounded-full bg-emerald-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-900 lg:px-5"
              >
                Daftar
              </Link>
            </>
          )}
        </div>

        {/* Tombol mobile */}
        <div className="relative flex shrink-0 items-center gap-2 sm:hidden">
          {!loading && isLoggedIn && (
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                setProfileOpen((open) => !open);
              }}
              aria-label="Buka profil"
              aria-expanded={profileOpen}
              className="flex h-10 w-10 touch-manipulation items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-900 ring-1 ring-emerald-200"
            >
              {initial}
            </button>
          )}

          <button
            type="button"
            aria-label={mobileOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
            aria-expanded={mobileOpen}
            onClick={() => {
              setProfileOpen(false);
              setMobileOpen((open) => !open);
            }}
            className="flex h-11 w-11 touch-manipulation items-center justify-center rounded-xl text-stone-700 transition hover:bg-stone-100 active:bg-stone-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
          >
            {mobileOpen ? <X size={23} /> : <Menu size={23} />}
          </button>

          {/* Dropdown profil mobile */}
          {profileOpen && isLoggedIn && (
            <div className="absolute right-0 top-12 z-[2010] w-[min(16rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-stone-200 bg-white p-2 shadow-xl">
              <div className="border-b border-stone-100 px-3 py-3">
                <AccountInfo />
              </div>

              <div className="mt-1">
                <ProfileMenuLinks mobile />
              </div>

              <LogoutButton mobile />
            </div>
          )}
        </div>
      </nav>

      {/* Menu mobile */}
      {mobileOpen && (
        <div className="relative z-[2005] border-t border-stone-200 bg-[#fafbf8] px-4 pb-5 pt-3 shadow-lg sm:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {navItems.map((item) => {
              const Icon = renderNavIcon(item);

              return (
                <NavLink key={item.to} to={item.to} end={item.to === "/"} onClick={(event) => handleNavClick(event, item)} className={({ isActive }) => getMobileLinkClass(isActive)}>
                  <Icon size={18} />
                  {item.label}
                </NavLink>
              );
            })}

            {loading ? (
              <div className="flex min-h-12 items-center gap-2 px-4 py-3 text-sm text-stone-500">
                <LoaderCircle size={17} className="animate-spin" />
                Memuat akun...
              </div>
            ) : isLoggedIn ? (
              <div className="mt-2 border-t border-stone-200 pt-3">
                <AccountInfo mobile />

                <div className="mt-2">
                  <ProfileMenuLinks mobile />
                </div>

                <LogoutButton mobile />
              </div>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-3 border-t border-stone-200 pt-4">
                <Link
                  to="/login"
                  onClick={closeMenus}
                  className="flex min-h-12 touch-manipulation items-center justify-center rounded-full border border-stone-300 px-4 py-3 text-sm font-semibold text-stone-700 transition hover:border-emerald-800 hover:text-emerald-800"
                >
                  Masuk
                </Link>

                <Link to="/daftar" onClick={closeMenus} className="flex min-h-12 touch-manipulation items-center justify-center rounded-full bg-emerald-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900">
                  Daftar
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
