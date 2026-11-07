import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  MapPin,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  LoaderCircle,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const { showToast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (isLoading) return;

    setIsLoading(true);

    try {
      // Login sekaligus mengambil profil dan role dari Supabase.
      const result = await signIn({
        email: form.email.trim(),
        password: form.password,
      });

      const userRole = String(
        result?.profile?.role ||
          result?.role ||
          ""
      )
        .trim()
        .toLowerCase();

      showToast({
        type: "success",
        title: "Login berhasil!",
        message:
          userRole === "petugas"
            ? "Selamat datang, Petugas LaporTOD."
            : "Selamat datang kembali di LaporTOD.",
      });

      // Petugas selalu diarahkan ke halaman Kelola Laporan.
      if (["petugas", "staff", "admin"].includes(userRole)) {
        navigate("/kelola-laporan", { replace: true });
        return;
      }

      // Warga kembali ke halaman yang ingin dibuka sebelum login.
      const requestedPath = location.state?.from;

      const destination =
        typeof requestedPath === "string"
          ? requestedPath
          : requestedPath?.pathname || "/";

      // Warga tidak boleh diarahkan ke area petugas.
      if (destination.startsWith("/kelola-laporan")) {
        navigate("/", { replace: true });
        return;
      }

      navigate(destination, { replace: true });
    } catch (error) {
      console.error("Login gagal:", error);

      const message = error.message?.toLowerCase() || "";

      if (message.includes("invalid login credentials")) {
        showToast({
          type: "error",
          title: "Login gagal",
          message: "Email atau password salah. Silakan coba lagi.",
        });
      } else if (message.includes("email not confirmed")) {
        showToast({
          type: "error",
          title: "Email belum dikonfirmasi",
          message: "Silakan konfirmasi email sebelum login.",
        });
      } else {
        showToast({
          type: "error",
          title: "Terjadi kesalahan",
          message: error.message || "Login gagal. Silakan coba lagi.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleForgotPassword() {
    showToast({
      type: "info",
      title: "Lupa password?",
      message: "Fitur reset password akan kita tambahkan nanti.",
    });
  }

  return (
    <main className="min-h-[80vh] overflow-x-hidden bg-[#fafbf8] px-4 py-6 sm:px-6 sm:py-10 md:px-8 md:py-14">
      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm sm:rounded-3xl md:grid-cols-2">
        {/* PANEL INFORMASI DESKTOP */}
        <div className="hidden flex-col justify-between bg-emerald-900 p-8 text-white md:flex lg:p-10">
          <Link
            to="/"
            className="inline-flex w-fit items-center gap-3 rounded-lg"
          >
            <MapPin size={28} />
            <span className="text-xl font-bold">LaporTOD</span>
          </Link>

          <div className="my-10">
            <p className="text-xs font-semibold tracking-[0.18em] text-emerald-200">
              SELAMAT DATANG KEMBALI
            </p>

            <h1 className="mt-4 text-3xl font-semibold leading-tight lg:text-4xl">
              Kepedulianmu membuat perbedaan.
            </h1>

            <p className="mt-5 text-sm leading-7 text-emerald-100 lg:text-base">
              Masuk untuk melanjutkan pemantauan laporan atau mengelola
              tindak lanjut fasilitas publik di kawasan TOD.
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-emerald-100">
            <ShieldCheck size={18} className="shrink-0" />
            Akun dan akses sesuai peran pengguna
          </div>
        </div>

        {/* FORM LOGIN */}
        <div className="min-w-0 p-5 sm:p-8 lg:p-10">
          {/* LOGO MOBILE */}
          <Link
            to="/"
            className="inline-flex min-h-10 items-center gap-2 rounded-lg text-emerald-800 md:hidden"
          >
            <MapPin size={23} />
            <span className="text-lg font-bold text-stone-900">
              LaporTOD
            </span>
          </Link>

          <p className="mt-6 text-[11px] font-semibold tracking-[0.15em] text-emerald-800 sm:text-xs">
            LOGIN AKUN
          </p>

          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
            Senang melihatmu lagi.
          </h2>

          <p className="mt-3 text-sm leading-6 text-stone-500">
            Masukkan email dan password untuk melanjutkan.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5 sm:mt-8">
            {/* EMAIL */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-stone-700"
              >
                Email <span className="text-red-600">*</span>
              </label>

              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                inputMode="email"
                value={form.email}
                onChange={handleChange}
                placeholder="nama@email.com"
                className="min-h-12 w-full min-w-0 rounded-xl border border-stone-200 bg-white px-4 py-3 text-base outline-none transition placeholder:text-sm placeholder:text-stone-400 focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/10 sm:text-sm"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-stone-700"
                >
                  Password <span className="text-red-600">*</span>
                </label>

                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="min-h-8 touch-manipulation text-xs font-medium text-emerald-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
                >
                  Lupa password?
                </button>
              </div>

              <div className="flex min-h-12 min-w-0 items-center rounded-xl border border-stone-200 bg-white pr-2 transition focus-within:border-emerald-800 focus-within:ring-2 focus-within:ring-emerald-800/10">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Masukkan password"
                  className="h-full min-h-11 w-full min-w-0 flex-1 rounded-xl bg-transparent px-4 py-3 text-base outline-none placeholder:text-sm placeholder:text-stone-400 sm:text-sm"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
                  aria-label={
                    showPassword
                      ? "Sembunyikan password"
                      : "Tampilkan password"
                  }
                  aria-pressed={showPassword}
                  className="flex h-10 w-10 shrink-0 touch-manipulation items-center justify-center rounded-lg text-stone-500 transition hover:bg-stone-100 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {/* TOMBOL LOGIN */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex min-h-12 w-full touch-manipulation items-center justify-center gap-2 rounded-full bg-emerald-800 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Sedang masuk...
                </>
              ) : (
                <>
                  Masuk
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm leading-6 text-stone-500">
            Belum punya akun?{" "}
            <Link
              to="/daftar"
              className="font-semibold text-emerald-800 hover:underline"
            >
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
