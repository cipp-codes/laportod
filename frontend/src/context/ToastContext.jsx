import {
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react'
import Toast from '../components/ui/Toast'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)

  const showToast = useCallback(({
    type = 'info',
    title,
    message = '',
  }) => {
    setToast({
      id: Date.now(),
      type,
      title,
      message,
    })
  }, [])

  const closeToast = useCallback(() => {
    setToast(null)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast toast={toast} onClose={closeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast harus digunakan di dalam ToastProvider')
  }

  return context
}