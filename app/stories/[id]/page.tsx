import { connectDB } from '@/lib/db'
import { type StoryDocument } from '@/models/Story'
import { notFound } from 'next/navigation'
import mongoose from 'mongoose'
import styles from './page.module.scss'

// Ensure Story model is imported
import '@/models/Story'

interface StoryDetailPageProps {
  params: {
    id: string
  }
}

async function getStory(id: string): Promise<StoryDocument | null> {
  try {
    await connectDB()

    const StoryModel = mongoose.models.Story
    if (!StoryModel) {
      return null
    }

    const storyIdObj = new mongoose.Types.ObjectId(id)
    const findOneMethod = StoryModel.findOne as unknown as (
      filter: { _id: mongoose.Types.ObjectId; status: string }
    ) => { exec: () => Promise<StoryDocument | null> }
    const story = await findOneMethod({
      _id: storyIdObj,
      status: 'PUBLISHED',
    }).exec()

    return story
  } catch {
    // Return null on any error
    return null
  }
}

export default async function StoryDetailPage({
  params,
}: StoryDetailPageProps): Promise<JSX.Element> {
  const story = await getStory(params.id)

  if (!story) {
    notFound()
  }

  return (
    <main className={styles.main}>
      <article className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>{story.displayName}</h1>
          <div className={styles.meta}>
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

        <div className={styles.content}>
          {story.therapistDisplayName && (
            <div className={styles.therapist}>
              <strong>מטפל:</strong> {story.therapistDisplayName}
            </div>
          )}

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>תהליך הטיפול</h2>
            <p className={styles.text}>{story.treatmentProcess}</p>
          </section>

          {story.duration && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>משך הטיפול</h2>
              <p className={styles.text}>{story.duration}</p>
            </section>
          )}

          {story.outcome && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>תוצאות</h2>
              <p className={styles.text}>{story.outcome}</p>
            </section>
          )}
        </div>
      </article>
    </main>
  )
}

