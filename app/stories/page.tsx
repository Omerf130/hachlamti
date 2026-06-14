import Story from '@/models/Story'
import { findMany } from '@/lib/mongoose-helpers'
import styles from './page.module.scss'
import Link from 'next/link'
import EmptyState from '@/components/EmptyState'
import SearchInput from '@/components/SearchInput'
import { Suspense } from 'react'

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '...'
}

async function getStories(query?: string) {
  const filter: Record<string, unknown> = { status: 'PUBLISHED' }

  if (query) {
    filter.$or = [
      { title: { $regex: query, $options: 'i' } },
      { problem: { $regex: query, $options: 'i' } },
      { therapistName: { $regex: query, $options: 'i' } },
      { 'healthChallenge.primary': { $regex: query, $options: 'i' } },
    ]
  }

  return findMany(Story, filter, { publishedAt: -1 })
}

interface PageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function StoriesPage({ searchParams }: PageProps): Promise<JSX.Element> {
  const params = await searchParams
  const query = params.q ?? ''
  const stories = await getStories(query || undefined)

  return (
    <main className={styles.page}>
      <section className={styles.header}>
        <h1 className={styles.title}>סיפורי החלמה והשראה</h1>
        <p className={styles.intro}>
          גלו סיפורי החלמה מעוררי השראה מאנשים שעברו תהליכים דומים.
          כל סיפור הוא מקור תקווה וכוח עבור אחרים.
        </p>
      </section>

      <section className={styles.searchSection}>
        <Suspense fallback={
          <div className={styles.searchBar}>
            <input type="text" placeholder="חפש סיפורי החלמה..." className={styles.searchInput} disabled />
          </div>
        }>
          <SearchInput
            basePath="/stories"
            placeholder="חפש סיפורי החלמה..."
            className={styles.searchInput}
            iconClassName={styles.searchIcon}
            wrapperClassName={styles.searchBar}
          />
        </Suspense>
      </section>

      <section className={styles.gridSection}>
        {stories.length === 0 ? (
          <EmptyState message={query ? 'לא נמצאו סיפורים תואמים' : 'אין סיפורים זמינים כרגע'} />
        ) : (
          <div className={styles.grid}>
            {stories.map((story) => (
              <article key={story._id.toString()} className={styles.card}>
                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{story.title}</h3>
                  <p className={styles.cardSummary}>
                    {truncate(story.problem || '', 120)}
                  </p>
                  <div className={styles.cardMeta}>
                    {story.healthChallenge?.primary && (
                      <span className={styles.tag}>{story.healthChallenge.primary}</span>
                    )}
                  </div>
                  {story.therapistName && story.therapistName !== 'ללא' && (
                    <p className={styles.cardTherapist}>
                      מטפל/ת: {story.therapistName}
                    </p>
                  )}
                </div>
                <Link
                  href={`/stories/${story._id.toString()}`}
                  className={styles.cardButton}
                >
                  קרא את הסיפור המלא
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
