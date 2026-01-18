import { type StoryDocument } from '@/models/Story'
import { findMany } from '@/lib/db-queries'
import styles from './page.module.scss'
import sharedStyles from '@/styles/list-page.module.scss'
import Link from 'next/link'
import EmptyState from '@/components/EmptyState'

// Ensure Story model is imported
import '@/models/Story'

async function getStories(): Promise<StoryDocument[]> {
  return findMany<StoryDocument>('Story', { status: 'PUBLISHED' }, {
    publishedAt: -1,
  })
}

export default async function StoriesPage(): Promise<JSX.Element> {
  const stories = await getStories()

  return (
    <main className={sharedStyles.main}>
      <h1 className={sharedStyles.title}>סיפורי החלמה</h1>
      {stories.length === 0 ? (
        <EmptyState message="אין סיפורים זמינים כרגע" />
      ) : (
        <ul className={sharedStyles.list}>
          {stories.map((story) => (
            <li key={story._id.toString()} className={sharedStyles.item}>
              <Link
                href={`/stories/${story._id.toString()}`}
                className={sharedStyles.link}
              >
                <div className={styles.storyTitle}>{story.title}</div>
                <div className={styles.storyAuthor}>{story.displayName}</div>
                {story.publishedAt && (
                  <div className={styles.storyDate}>
                    {new Date(story.publishedAt).toLocaleDateString('he-IL', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

