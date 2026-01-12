import styles from './EmptyState.module.scss'

interface EmptyStateProps {
  message: string
}

export default function EmptyState({ message }: EmptyStateProps): JSX.Element {
  return (
    <div className={styles.empty}>
      <p>{message}</p>
    </div>
  )
}

