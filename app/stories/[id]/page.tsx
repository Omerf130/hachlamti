import Story, { type StoryDocument } from '@/models/Story'
import { findByIdAndStatus } from '@/lib/mongoose-helpers'
import { notFound } from 'next/navigation'
import styles from './page.module.scss'
import sharedStyles from '@/styles/detail-page.module.scss'

interface StoryDetailPageProps {
  params: {
    id: string
  }
}

async function getStory(id: string): Promise<StoryDocument | null> {
  return findByIdAndStatus(Story, id, 'PUBLISHED')
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
          <h1 className={sharedStyles.title}>{story.title}</h1>
          <div className={sharedStyles.meta}>
            <span className={styles.author}>{story.displayName}</span>
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
          {story.freeTextStory ? (
            <section className={sharedStyles.section}>
              <p className={sharedStyles.text} style={{ whiteSpace: 'pre-wrap' }}>
                {story.freeTextStory}
              </p>
            </section>
          ) : (
            <>
              <section className={sharedStyles.section}>
                <h2 className={sharedStyles.sectionTitle}>הבעיה הרפואית</h2>
                <p className={sharedStyles.text}>{story.problem}</p>
              </section>

              <section className={sharedStyles.section}>
                <h2 className={sharedStyles.sectionTitle}>מה ניסיתי קודם?</h2>
                <p className={sharedStyles.text}>{story.previousAttempts}</p>
              </section>

              <section className={sharedStyles.section}>
                <h2 className={sharedStyles.sectionTitle}>הפתרון שעזר</h2>
                <p className={sharedStyles.text}>{story.solution}</p>
              </section>

              <section className={sharedStyles.section}>
                <h2 className={sharedStyles.sectionTitle}>התוצאות - מה המצב שלי היום?</h2>
                <p className={sharedStyles.text}>{story.results}</p>
              </section>

              <section className={sharedStyles.section}>
                <h2 className={sharedStyles.sectionTitle}>מה הייתי אומר למישהו שעובר את זה כרגע?</h2>
                <p className={sharedStyles.text}>{story.messageToOthers}</p>
              </section>
            </>
          )}
        </div>
      </article>
    </main>
  )
}

