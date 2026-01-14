'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import type { ReactNode } from 'react'

interface SessionProviderProps {
  children: ReactNode
}

export default function SessionProvider({
  children,
}: SessionProviderProps): JSX.Element {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
}

