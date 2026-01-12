import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'

export default async function AdminDashboardPage(): Promise<JSX.Element> {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'admin') {
    redirect('/admin/login')
  }

  return (
    <main>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {session.user.email}</p>
    </main>
  )
}

