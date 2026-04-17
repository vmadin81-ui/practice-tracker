import type { PropsWithChildren } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './queryClient'
import { ToastProvider } from '../context/ToastContext'
import { ConfirmProvider } from '../context/ConfirmContext'
import { AuthProvider } from '../context/AuthContext'

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <ConfirmProvider>
          <AuthProvider>{children}</AuthProvider>
        </ConfirmProvider>
      </ToastProvider>
    </QueryClientProvider>
  )
}