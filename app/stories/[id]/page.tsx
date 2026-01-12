import { type StoryDocument } from '@/models/Story'
import { findOneByIdAndStatus } from '@/lib/db-queries'
import { notFound } from 'next/navigation'
import styles from './page.module.scss'
import sharedStyles from '@/styles/detail-page.module.scss'

// Ensure Story model is imported
import '@/models/Story'

interface StoryDetailPageProps {
  params: {
    id: string
  }
}

async function getStory(id: string): Promise<StoryDocument | null> {
  return findOneByIdAndStatus<StoryDocument>('Story', id, 'PUBLISHED')
}

export default async function StoryDetailPage({
  params,
}: StoryDetailPageProps): Promise<JSX.Element> {
  const story = await getStory(params.id)

  if (!story) {
    notFound()
  }

  return (
    <main className={sharedStyles.main}>
      <article className={sharedStyles.container}>
        <header className={sharedStyles.header}>
          <h1 className={sharedStyles.title}>{story.displayName}</h1>
          <div className={sharedStyles.meta}>
            <span className={styles.category}>{story.treatmentCategory}</span>
            {story.medicalCondition && (
              <span className={styles.condition}>{story.medicalCondition}</span>
            )}
            {story.publishedAt && (
              <time className={styles.date}>
                {new Date(story.publishedAt).toLocaleDateString('he-IL', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            )}
          </div>
        </header>

        <div className={sharedStyles.content}>
          {story.therapistDisplayName && (
            <div className={styles.therapist}>
              <strong>מטפל:</strong> {story.therapistDisplayName}
            </div>
          )}

          <section className={sharedStyles.section}>
            <h2 className={sharedStyles.sectionTitle}>תהליך הטיפול</h2>
            <p className={sharedStyles.text}>{story.treatmentProcess}</p>
          </section>

          {story.duration && (
            <section className={sharedStyles.section}>
              <h2 className={sharedStyles.sectionTitle}>משך הטיפול</h2>
              <p className={sharedStyles.text}>{story.duration}</p>
            </section>
          )}

          {story.outcome && (
            <section className={sharedStyles.section}>
              <h2 className={sharedStyles.sectionTitle}>תוצאות</h2>
              <p className={sharedStyles.text}>{story.outcome}</p>
            </section>
          )}
        </div>
      </article>
    </main>
  )
}

