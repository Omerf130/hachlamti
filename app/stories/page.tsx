import { connectDB } from '@/lib/db'
import { type StoryDocument } from '@/models/Story'
import mongoose from 'mongoose'
import styles from './page.module.scss'
import Link from 'next/link'

// Ensure Story model is imported
import '@/models/Story'

async function getStories(): Promise<StoryDocument[]> {
  try {
    await connectDB()

    const StoryModel = mongoose.models.Story
    if (!StoryModel) {
      return []
    }

    const filter = { status: 'PUBLISHED' }
    const query = StoryModel.find(filter).sort({ publishedAt: -1 })
    const execResult = query.exec() as unknown as Promise<StoryDocument[]>
    const stories = await execResult

    return stories || []
  } catch {
    // Return empty array on any error
    return []
  }
}

export default async function StoriesPage(): Promise<JSX.Element> {
  const stories = await getStories()

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>סיפורי החלמה</h1>
      {stories.length === 0 ? (
        <div className={styles.empty}>
          <p>אין סיפורים זמינים כרגע</p>
        </div>
      ) : (
        <ul className={styles.storiesList}>
          {stories.map((story) => (
            <li key={story._id.toString()} className={styles.storyItem}>
              <Link href={`/stories/${story._id.toString()}`} className={styles.storyLink}>
                <div className={styles.storyTitle}>{story.displayName}</div>
                <div className={styles.storyCategory}>{story.treatmentCategory}</div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

