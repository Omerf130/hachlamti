import Link from 'next/link'
import { connectDB } from '@/lib/db'
import Story from '@/models/Story'
import Therapist from '@/models/Therapist'
import Event from '@/models/Event'
import styles from './page.module.scss'

interface LeanStory {
  _id: string
  title: string
  problem: string
  healthChallenge: { primary: string; sub: string }
  alternativeTreatment: { primary: string; sub: string }
  therapistName: string
  publicationChoice: string
  displayName: string
}

interface LeanTherapist {
  _id: string
  fullName: string
  profileImageUrl: string
  profession: { value: string; otherText?: string }
  location: { city: string }
  treatedConditions: { primary: string; sub: string }[]
  specialServices: {
    onlineTreatment: boolean
    homeVisits: boolean
    accessibleClinic: boolean
  }
  credoAndSpecialty: string
}

async function getRandomStories(): Promise<LeanStory[]> {
  try {
    await connectDB()
    return await (Story as any).aggregate([
      { $match: { status: 'PUBLISHED' } },
      { $sample: { size: 8 } },
      {
        $project: {
          title: 1,
          problem: 1,
          healthChallenge: 1,
          alternativeTreatment: 1,
          therapistName: 1,
          publicationChoice: 1,
          displayName: 1,
        },
      },
    ])
  } catch (error) {
    console.error('Error fetching random stories:', error)
    return []
  }
}

async function getRandomTherapists(): Promise<LeanTherapist[]> {
  try {
    await connectDB()
    return await (Therapist as any).aggregate([
      { $match: { status: 'APPROVED' } },
      { $sample: { size: 8 } },
      {
        $project: {
          fullName: 1,
          profileImageUrl: 1,
          profession: 1,
          location: 1,
          treatedConditions: 1,
          specialServices: 1,
          credoAndSpecialty: 1,
        },
      },
    ])
  } catch (error) {
    console.error('Error fetching random therapists:', error)
    return []
  }
}

interface LeanEvent {
  _id: string
  title: string
  eventType: string
  eventDate: string
  eventTime: string
  locationType: 'PHYSICAL' | 'ONLINE'
  city?: string
  price?: string
  therapistName: string
  featuredImageUrl: string
  registrationUrl: string
}

async function getUpcomingEvents(): Promise<LeanEvent[]> {
  try {
    await connectDB()
    return await (Event as any).aggregate([
      { $match: { status: 'APPROVED', eventDate: { $gte: new Date() } } },
      { $sort: { eventDate: 1 } },
      { $limit: 6 },
      {
        $project: {
          title: 1,
          eventType: 1,
          eventDate: 1,
          eventTime: 1,
          locationType: 1,
          city: 1,
          price: 1,
          therapistName: 1,
          featuredImageUrl: 1,
          registrationUrl: 1,
        },
      },
    ])
  } catch (error) {
    console.error('Error fetching upcoming events:', error)
    return []
  }
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '...'
}

export default async function Home(): Promise<JSX.Element> {
  const [stories, therapists, events] = await Promise.all([
    getRandomStories(),
    getRandomTherapists(),
    getUpcomingEvents(),
  ])

  return (
    <main>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>החלמתי</h1>
          <p className={styles.heroSubtitle}>
            פלטפורמה לסיפורי החלמה וחיבור למטפלים מקצועיים.
            <br />
            המקום שלכם לשתף, להתחבר ולמצוא את הדרך להחלמה.
          </p>
          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="חפש סיפורי החלמה, מטפלים, מצבים רפואיים..."
              className={styles.searchInput}
              disabled
            />
            <span className={styles.searchIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className={styles.vision}>
        <div className={styles.visionContent}>
          <h2 className={styles.visionTitle}>החזון שלנו</h2>
          <p className={styles.visionText}>
            אנו מאמינים שלכל סיפור החלמה יש כוח לעורר תקווה ולהאיר את הדרך עבור אחרים.
            החלמתי נוצרה כדי לחבר בין אנשים שעברו תהליכי החלמה לבין אלו שמחפשים
            השראה, תמיכה ומטפלים מקצועיים שילוו אותם בדרך.
          </p>
          <Link href="/about" className={styles.visionButton}>
            קרא עוד על החזון שלנו
          </Link>
        </div>
      </section>

      {/* Stories Grid */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>סיפורי החלמה</h2>
          {stories.length > 0 ? (
            <div className={styles.grid}>
              {stories.map((story) => (
                <article key={story._id.toString()} className={styles.storyCard}>
                  <div className={styles.storyCardBody}>
                    <h3 className={styles.storyCardTitle}>{story.title}</h3>
                    <p className={styles.storyCardSummary}>
                      {truncate(story.problem || '', 100)}
                    </p>
                    <div className={styles.storyCardMeta}>
                      {story.healthChallenge?.primary && (
                        <span className={styles.tag}>{story.healthChallenge.primary}</span>
                      )}
                      {story.alternativeTreatment?.primary && (
                        <span className={styles.tag}>{story.alternativeTreatment.primary}</span>
                      )}
                    </div>
                    {story.therapistName && story.therapistName !== 'ללא' && (
                      <p className={styles.storyTherapist}>
                        מטפל/ת: {story.therapistName}
                      </p>
                    )}
                    <div className={styles.storyCardFooter}>
                      <span className={styles.anonymityBadge}>
                        {story.publicationChoice === 'ANONYMOUS'
                          ? 'פורסם בעילום שם'
                          : story.displayName}
                      </span>
                    </div>
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
          ) : (
            <p className={styles.emptyMessage}>אין סיפורים זמינים כרגע</p>
          )}
          <div className={styles.ctaRow}>
            <Link href="/submit-story" className={styles.ctaPrimary}>
              שתף את סיפור ההחלמה שלך
            </Link>
            <Link href="/stories" className={styles.ctaSecondary}>
              צפה בכל סיפורי ההחלמה
            </Link>
          </div>
        </div>
      </section>

      {/* Therapists + Events */}
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.sectionInner}>
          <div className={styles.therapistsEventsLayout}>
            {/* Therapists Grid */}
            <div className={styles.therapistsColumn}>
              <h2 className={styles.sectionTitle}>המטפלים שלנו</h2>
              {therapists.length > 0 ? (
                <div className={styles.grid}>
                  {therapists.map((therapist) => {
                    const professionDisplay = therapist.profession
                      ? (therapist.profession.value === 'אחר' && therapist.profession.otherText
                          ? therapist.profession.otherText
                          : therapist.profession.value)
                      : ''
                    const expertiseList = (therapist.treatedConditions || [])
                      .slice(0, 3)
                      .map((c) => c?.primary)
                      .filter((v): v is string => !!v)
                      .filter((v, i, arr) => arr.indexOf(v) === i)

                    return (
                      <article key={therapist._id.toString()} className={styles.therapistCard}>
                        <div className={styles.therapistCardHeader}>
                          {therapist.profileImageUrl ? (
                            <img
                              src={therapist.profileImageUrl}
                              alt={therapist.fullName}
                              className={styles.therapistImage}
                            />
                          ) : (
                            <div className={styles.therapistImagePlaceholder}>
                              {therapist.fullName.charAt(0)}
                            </div>
                          )}
                          <span className={styles.verifiedBadge} title="מטפל מאומת">&#10003;</span>
                        </div>
                        <div className={styles.therapistCardBody}>
                          <h3 className={styles.therapistCardName}>{therapist.fullName}</h3>
                          {professionDisplay && (
                            <p className={styles.therapistProfession}>{professionDisplay}</p>
                          )}
                          {expertiseList && expertiseList.length > 0 && (
                            <div className={styles.therapistExpertise}>
                              {expertiseList.map((area) => (
                                <span key={area} className={styles.expertiseTag}>
                                  {area}
                                </span>
                              ))}
                            </div>
                          )}
                          {therapist.location?.city && (
                            <p className={styles.therapistLocation}>{therapist.location.city}</p>
                          )}
                          <div className={styles.meetingTypes}>
                            {therapist.specialServices?.onlineTreatment && (
                              <span className={styles.meetingBadge}>אונליין</span>
                            )}
                            {therapist.specialServices?.homeVisits && (
                              <span className={styles.meetingBadge}>ביקורי בית</span>
                            )}
                            {!therapist.specialServices?.onlineTreatment &&
                              !therapist.specialServices?.homeVisits && (
                                <span className={styles.meetingBadge}>פרונטלי</span>
                              )}
                          </div>
                        </div>
                        <Link
                          href={`/therapists/${therapist._id.toString()}`}
                          className={styles.cardButton}
                        >
                          צפה בפרופיל המלא
                        </Link>
                      </article>
                    )
                  })}
                </div>
              ) : (
                <p className={styles.emptyMessage}>אין מטפלים זמינים כרגע</p>
              )}
              <div className={styles.ctaRow}>
                <Link href="/apply-therapist" className={styles.ctaPrimary}>
                  הצטרף למאגר המטפלים
                </Link>
                <Link href="/therapists" className={styles.ctaSecondary}>
                  צפה בכל המטפלים
                </Link>
              </div>
            </div>

            {/* Events Sidebar */}
            <aside className={styles.eventsSidebar}>
              <h3 className={styles.sidebarTitle}>אירועים קרובים</h3>
              {events.length > 0 ? (
                <div className={styles.eventsList}>
                  {events.map((event) => (
                    <div key={event._id.toString()} className={styles.eventSidebarCard}>
                      {event.featuredImageUrl && (
                        <img
                          src={event.featuredImageUrl}
                          alt={event.title}
                          className={styles.eventSidebarImage}
                        />
                      )}
                      <div className={styles.eventSidebarBody}>
                        <h4 className={styles.eventSidebarTitle}>{event.title}</h4>
                        <p className={styles.eventSidebarDate}>
                          {new Date(event.eventDate).toLocaleDateString('he-IL', {
                            month: 'short',
                            day: 'numeric',
                          })} | {event.eventTime}
                        </p>
                        <p className={styles.eventSidebarLocation}>
                          {event.locationType === 'ONLINE' ? 'אונליין' : event.city}
                        </p>
                        {event.price && (
                          <p className={styles.eventSidebarPrice}>{event.price}</p>
                        )}
                      </div>
                      <a
                        href={event.registrationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.eventSidebarCta}
                      >
                        פרטים והרשמה
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.emptyMessage}>אין אירועים קרובים</p>
              )}
              <Link href="/events" className={styles.sidebarLink}>
                צפה בכל האירועים
              </Link>
            </aside>
          </div>
        </div>
      </section>
    </main>
  )
}
