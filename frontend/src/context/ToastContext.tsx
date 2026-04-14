import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import { ToastViewport } from '../components/ui/ToastViewport'

export type ToastTone = 'success' | 'error' | 'info' | 'warning'

export type ToastItem = {
  id: string
  title: string
  description?: string
  tone: ToastTone
}

type ToastContextValue = {
  showToast: (toast: Omit<ToastItem, 'id'>) => void
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  info: (title: string, description?: string) => void
  warning: (title: string, description?: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

function generateId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function ToastProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<ToastItem[]>([])

  const removeToast = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const showToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = generateId()
    const item: ToastItem = { id, ...toast }

    setItems((prev) => [...prev, item])

    window.setTimeout(() => {
      removeToast(id)
    }, 3500)
  }, [removeToast])

  const value = useMemo<ToastContextValue>(
    () => ({
      showToast,
      success: (title, description) =>
        showToast({ title, description, tone: 'success' }),
      error: (title, description) =>
        showToast({ title, description, tone: 'error' }),
      info: (title, description) =>
        showToast({ title, description, tone: 'info' }),
      warning: (title, description) =>
        showToast({ title, description, tone: 'warning' }),
    }),
    [showToast]
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport items={items} onClose={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToastContext() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToastContext must be used inside ToastProvider')
  }

  return context
}