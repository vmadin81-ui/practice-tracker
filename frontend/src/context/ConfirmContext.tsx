import type { PropsWithChildren }  from 'react'
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'

type ConfirmOptions = {
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  tone?: 'default' | 'danger'
}

type ConfirmContextValue = {
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null)

type PendingConfirm = ConfirmOptions & {
  resolve: (value: boolean) => void
}

export function ConfirmProvider({ children }: PropsWithChildren) {
  const [pending, setPending] = useState<PendingConfirm | null>(null)

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setPending({ ...options, resolve })
    })
  }, [])

  const close = useCallback((result: boolean) => {
    setPending((current) => {
      if (current) {
        current.resolve(result)
      }
      return null
    })
  }, [])

  const value = useMemo<ConfirmContextValue>(() => ({ confirm }), [confirm])

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {pending && (
        <ConfirmDialog
          title={pending.title}
          description={pending.description}
          confirmText={pending.confirmText}
          cancelText={pending.cancelText}
          tone={pending.tone}
          onConfirm={() => close(true)}
          onCancel={() => close(false)}
        />
      )}
    </ConfirmContext.Provider>
  )
}

export function useConfirmContext() {
  const context = useContext(ConfirmContext)

  if (!context) {
    throw new Error('useConfirmContext must be used inside ConfirmProvider')
  }

  return context
}