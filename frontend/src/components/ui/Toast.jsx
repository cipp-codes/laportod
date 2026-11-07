import { useEffect } from 'react'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'

const toastStyles = {
  success: {
    icon: CheckCircle2,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50',
    progressColor: 'bg-emerald-500',
    title: 'Berhasil',
  },
  error: {
    icon: XCircle,
    iconColor: 'text-red-600',
    iconBg: 'bg-red-50',
    progressColor: 'bg-red-500',
    title: 'Terjadi kesalahan',
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50',
    progressColor: 'bg-blue-500',
    title: 'Informasi',
  },
}

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return

    const timer = setTimeout(() => {
      onClose()
    }, 3000)

    return () => clearTimeout(timer)
  }, [toast, onClose])

  if (!toast) return null

  const style = toastStyles[toast.type] || toastStyles.info
  const Icon = style.icon

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-3 z-[10000] flex justify-center px-3 sm:inset-x-auto sm:right-5 sm:top-5 sm:w-[calc(100%-2.5rem)] sm:max-w-sm sm:justify-end sm:px-0 md:right-6 md:top-6"
    >
      <div
        role={toast.type === 'error' ? 'alert' : 'status'}
        aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
        className="pointer-events-auto w-full min-w-0 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl animate-[toast-in_0.25s_ease-out]"
      >
        <div className="flex items-start gap-2.5 p-3 sm:gap-3 sm:p-4">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full sm:h-10 sm:w-10 ${style.iconBg}`}
          >
            <Icon
              size={20}
              strokeWidth={2}
              className={style.iconColor}
            />
          </div>

          <div className="min-w-0 flex-1 pt-0.5">
            <p className="break-words text-sm font-semibold leading-5 text-stone-900">
              {toast.title || style.title}
            </p>

            {toast.message && (
              <p className="mt-1 break-words text-xs leading-5 text-stone-600 sm:text-sm">
                {toast.message}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup notifikasi"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
          >
            <X size={17} />
          </button>
        </div>

        <div className="h-1 w-full overflow-hidden bg-stone-100">
          <div
            key={toast.id}
            className={`h-full w-full origin-left animate-[toast-progress_3s_linear_forwards] ${style.progressColor}`}
          />
        </div>
      </div>
    </div>
  )
}