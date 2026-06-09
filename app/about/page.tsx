import Link from 'next/link'
import styles from '@/styles/legal-page.module.scss'

export const metadata = {
  title: 'אודות | החלמתי',
}

export default function AboutPage(): JSX.Element {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>אודות החלמתי</h1>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>החזון שלנו</h2>
          <p className={styles.paragraph}>
            החלמתי נולדה מתוך אמונה עמוקה שלכל סיפור החלמה יש כוח לעורר תקווה ולהאיר את הדרך עבור אחרים. אנו מאמינים שכאשר אנשים משתפים את חוויותיהם האישיות, הם לא רק מסייעים לעצמם בתהליך ההחלמה, אלא גם יוצרים קהילה תומכת שמעניקה כוח ועידוד.
          </p>
          <p className={styles.paragraph}>
            המטרה שלנו היא ליצור מרחב בטוח ומכיל, שבו כל אדם יכול למצוא השראה, תמיכה וחיבור לאנשי מקצוע שיעזרו לו בדרכו להחלמה.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>מה אנחנו מציעים</h2>
          <ul className={styles.list}>
            <li>
              <strong>סיפורי החלמה</strong> — מרחב לשיתוף חוויות אישיות של התמודדות והחלמה, בעילום שם או בגילוי פנים
            </li>
            <li>
              <strong>מאגר מטפלים</strong> — רשימה מקיפה של מטפלים מקצועיים ממגוון תחומים, עם פרופילים מפורטים שמאפשרים למצוא את ההתאמה הנכונה
            </li>
            <li>
              <strong>חיבור וקהילה</strong> — פלטפורמה שמחברת בין אנשים שעוברים תהליכים דומים ומאפשרת ללמוד מניסיון של אחרים
            </li>
            <li>
              <strong>מידע נגיש</strong> — תוכן מקצועי ומידע שימושי על תהליכי החלמה, סוגי טיפולים ומשאבים זמינים
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>למי הפלטפורמה מיועדת</h2>
          <p className={styles.paragraph}>
            החלמתי מיועדת לכל מי שמחפש תמיכה, השראה או מידע בנושאי החלמה:
          </p>
          <ul className={styles.list}>
            <li>אנשים שעוברים תהליכי החלמה ומחפשים קהילה תומכת ומעוררת השראה</li>
            <li>בני משפחה וחברים של אנשים בתהליכי החלמה</li>
            <li>מטפלים מקצועיים המעוניינים להנגיש את שירותיהם ולהגיע לאנשים שזקוקים לעזרה</li>
            <li>כל מי שמאמין בכוח השיתוף והקהילה בתהליכי ריפוי</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>הערכים שלנו</h2>
          <ul className={styles.list}>
            <li>
              <strong>כבוד ורגישות</strong> — אנו מתייחסים בכבוד רב לכל סיפור ולכל אדם, ושומרים על מרחב בטוח ומכבד
            </li>
            <li>
              <strong>שקיפות ואמינות</strong> — אנו מחויבים לשקיפות מלאה ולמידע אמין ומדויק
            </li>
            <li>
              <strong>נגישות</strong> — אנו פועלים להנגיש את הפלטפורמה לכלל האוכלוסייה, ללא הבדל
            </li>
            <li>
              <strong>פרטיות</strong> — הגנה על פרטיות המשתמשים שלנו היא בראש סדר העדיפויות
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>צרו קשר</h2>
          <p className={styles.paragraph}>
            יש לכם שאלות, הצעות או רעיונות? נשמח לשמוע מכם! אתם מוזמנים לפנות אלינו דרך <Link href="/contact">טופס יצירת הקשר</Link> שלנו.
          </p>
          <div className={styles.contactInfo}>
            <p>אימייל: <a href="mailto:info@hachlamti.co.il">info@hachlamti.co.il</a></p>
          </div>
        </section>
      </div>
    </div>
  )
}
