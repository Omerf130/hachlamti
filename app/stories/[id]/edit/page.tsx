import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { connectDB } from '@/lib/db'
import Story, { type StoryDocument } from '@/models/Story'
import StoryEditForm from './StoryEditForm'
import styles from './page.module.scss'

export const metadata = {
  title: 'עריכת סיפור | Hachlamti',
  description: 'ערוך את הסיפור שלך',
}

interface PageProps {
  params: { id: string }
}

export default async function EditStoryPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.id) {
    redirect(`/login?callbackUrl=/stories/${params.id}/edit`)
  }

  await connectDB()

  // Fetch the story
  // TypeScript workaround for Mongoose type overloads
  type StoryFindById = (id: string) => {
    lean: () => {
      exec: () => Promise<StoryDocument | null>
    }
  }
  const story = await (Story.findById as unknown as StoryFindById)(params.id).lean().exec()

  if (!story) {
    redirect('/my-stories')
  }

  // Check ownership
  if (story.authorUserId.toString() !== session.user.id) {
    redirect('/my-stories')
  }

  // Convert MongoDB ObjectId and Date to strings for client component
  const storyData = {
    _id: story._id.toString(),
    submitterFullName: story.submitterFullName,
    submitterPhone: story.submitterPhone,
    submitterEmail: story.submitterEmail,
    mayContact: story.mayContact,
    publicationChoice: story.publicationChoice,
    title: story.title,
    problem: story.problem,
    previousAttempts: story.previousAttempts,
    solution: story.solution,
    results: story.results,
    messageToOthers: story.messageToOthers,
    freeTextStory: story.freeTextStory || '',
  }

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>עריכת סיפור</h1>
        <p className={styles.subtitle}>עדכן את הסיפור שלך</p>
      </div>
      <StoryEditForm initialData={storyData} />
    </main>
  )
}

