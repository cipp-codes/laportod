import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadProfile(user) {
      if (!user) {
        if (mounted) setProfile(null);
        return null;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, role")
        .eq("id", user.id)
        .maybeSingle();

      if (!mounted) return null;

      if (error) {
        console.error(
          "Gagal mengambil profil:",
          error.message
        );

        setProfile(null);
        return null;
      }

      setProfile(data);
      return data;
    }

    async function initialize() {
      try {
        const { data, error } =
          await supabase.auth.getSession();

        if (error) throw error;
        if (!mounted) return;

        const currentSession = data?.session ?? null;

        setSession(currentSession);

        await loadProfile(currentSession?.user ?? null);
      } catch (error) {
        console.error(
          "Gagal memuat sesi:",
          error.message
        );
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        if (!mounted) return;

        setSession(newSession);

        if (!newSession) {
          setProfile(null);
          setLoading(false);
          return;
        }

        // Muat profil setelah callback autentikasi selesai.
        setTimeout(async () => {
          if (!mounted) return;

          setLoading(true);

          try {
            await loadProfile(newSession.user);
          } finally {
            if (mounted) setLoading(false);
          }
        }, 0);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function signUp({ fullName, email, password }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) throw error;

    return data;
  }

  async function signIn({ email, password }) {
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) throw error;

    const user = data.user;

    if (!user) {
      throw new Error(
        "Login berhasil, tetapi data pengguna tidak ditemukan."
      );
    }

    // Ambil role langsung dari tabel profiles.
    // Jangan mengandalkan state profile yang mungkin belum diperbarui.
    const { data: userProfile, error: profileError } =
      await supabase
        .from("profiles")
        .select("id, full_name, role")
        .eq("id", user.id)
        .maybeSingle();

    if (profileError) {
      console.error(
        "Gagal mengambil profil setelah login:",
        profileError.message
      );

      throw new Error(
        "Login berhasil, tetapi profil pengguna gagal dimuat. Silakan coba lagi."
      );
    }

    if (!userProfile) {
      throw new Error(
        "Profil pengguna tidak ditemukan di tabel profiles."
      );
    }

    // Perbarui state agar role langsung tersedia di aplikasi.
    setSession(data.session);
    setProfile(userProfile);

    return {
      ...data,
      profile: userProfile,
      role: userProfile.role,
    };
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    setSession(null);
    setProfile(null);

    return { error: null };
  }

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    role: profile?.role ?? null,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth harus digunakan di dalam AuthProvider"
    );
  }

  return context;
}
