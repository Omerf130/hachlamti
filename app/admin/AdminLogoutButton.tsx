'use client'

import { signOut } from 'next-auth/react'
import styles from './layout.module.scss'

export default function AdminLogoutButton() {
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <button onClick={handleLogout} className={styles.logoutButton}>
      התנתק
    </button>
  )
}

