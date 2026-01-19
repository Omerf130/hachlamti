import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { connectDB } from '@/lib/db'
import Story, { type StoryDocument } from '@/models/Story'
import Link from 'next/link'
import DeleteStoryButton from './DeleteStoryButton'
import styles from './page.module.scss'

export const metadata = {
  title: 'הסיפורים שלי | Hachlamti',
  description: 'ניהול הסיפורים שלי',
}

export default async function MyStoriesPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.id) {
    redirect('/login?callbackUrl=/my-stories')
  }

  await connectDB()

  // Fetch user's stories
  // TypeScript workaround for Mongoose type overloads
  type StoryFind = (filter: { authorUserId: string }) => {
    sort: (sort: any) => {
      lean: () => {
        exec: () => Promise<StoryDocument[]>
      }
    }
  }
  const stories = await (Story.find as unknown as StoryFind)({ authorUserId: session.user.id })
    .sort({ createdAt: -1 })
    .lean()
    .exec()

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>הסיפורים שלי</h1>
        <p className={styles.subtitle}>
          כאן תוכל לנהל את הסיפורים שכתבת - לערוך או למחוק אותם
        </p>
      </div>

      {stories.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyMessage}>עדיין לא שיתפת סיפורים</p>
          <Link href="/submit-story" className={styles.emptyButton}>
            שתף את הסיפור הראשון שלך
          </Link>
        </div>
      ) : (
        <div className={styles.storiesList}>
          {stories.map((story) => (
            <div key={story._id.toString()} className={styles.storyCard}>
              <div className={styles.cardContent}>
                <h2 className={styles.storyTitle}>{story.title}</h2>
                <p className={styles.storyExcerpt}>
                  {story.problem.substring(0, 150)}
                  {story.problem.length > 150 ? '...' : ''}
                </p>
                <div className={styles.storyMeta}>
                  <span className={styles.date}>
                    {new Date(story.createdAt).toLocaleDateString('he-IL')}
                  </span>
                  <span className={styles.status}>
                    {story.status === 'PUBLISHED' ? '✓ פורסם' : 'טיוטה'}
                  </span>
                </div>
              </div>
              <div className={styles.cardActions}>
                <Link
                  href={`/stories/${story._id.toString()}/edit`}
                  className={styles.editButton}
                >
                  ערוך
                </Link>
                <DeleteStoryButton
                  storyId={story._id.toString()}
                  storyTitle={story.title}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}

