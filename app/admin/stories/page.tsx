import Link from 'next/link'
import Story from '@/models/Story'
import User from '@/models/User'
import { findMany } from '@/lib/mongoose-helpers'
import DeleteStoryButtonAdmin from './DeleteStoryButtonAdmin'
import styles from './page.module.scss'

async function getAllStories() {
  const stories = await findMany(
    Story,
    { status: 'PUBLISHED' },
    { publishedAt: -1 } // Newest first
  )
  
  // Get unique author IDs
  const authorIds = [...new Set(stories.map(s => s.authorUserId.toString()))]
  
  // Fetch all authors
  const authors = await findMany(
    User,
    { _id: { $in: authorIds } },
    {}
  )
  
  // Create author map
  const authorMap = new Map(
    authors.map(author => [author._id.toString(), author.email])
  )
  
  return stories.map(story => ({
    ...story,
    authorEmail: authorMap.get(story.authorUserId.toString()) || 'Unknown',
  }))
}

export default async function AdminStoriesPage() {
  const stories = await getAllStories()

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>ניהול סיפורים</h1>
        <p className={styles.subtitle}>
          {stories.length > 0
            ? `${stories.length} סיפורים פורסמו`
            : 'אין סיפורים כרגע'}
        </p>
      </div>

      {stories.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📖</div>
          <h2 className={styles.emptyTitle}>אין סיפורים</h2>
          <p className={styles.emptyText}>לא הוגשו סיפורים עדיין</p>
          <Link href="/admin" className={styles.backButton}>
            חזרה לדשבורד
          </Link>
        </div>
      ) : (
        <div className={styles.storiesTable}>
          <div className={styles.tableHeader}>
            <div className={styles.colTitle}>כותרת</div>
            <div className={styles.colAuthor}>מחבר</div>
            <div className={styles.colDate}>תאריך</div>
            <div className={styles.colActions}>פעולות</div>
          </div>

          <div className={styles.tableBody}>
            {stories.map((story) => (
              <div key={story._id.toString()} className={styles.row}>
                <div className={styles.colTitle}>
                  <Link
                    href={`/stories/${story._id.toString()}`}
                    className={styles.storyTitle}
                    target="_blank"
                  >
                    {story.title}
                  </Link>
                  <span className={styles.displayName}>{story.displayName}</span>
                </div>

                <div className={styles.colAuthor}>
                  <span className={styles.email}>{story.authorEmail}</span>
                </div>

                <div className={styles.colDate}>
                  {new Date(story.publishedAt).toLocaleDateString('he-IL', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>

                <div className={styles.colActions}>
                  <Link
                    href={`/stories/${story._id.toString()}/edit`}
                    className={`${styles.actionButton} ${styles.edit}`}
                  >
                    ✏️ ערוך
                  </Link>
                  <DeleteStoryButtonAdmin
                    storyId={story._id.toString()}
                    storyTitle={story.title}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

