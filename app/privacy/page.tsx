import styles from '@/styles/legal-page.module.scss'

export const metadata = {
  title: 'מדיניות פרטיות | החלמתי',
}

export default function PrivacyPage(): JSX.Element {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>מדיניות פרטיות</h1>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>מבוא</h2>
          <p className={styles.paragraph}>
            ברוכים הבאים לאתר החלמתי. אנו מחויבים להגן על פרטיותכם ולשמור על המידע האישי שלכם בצורה מאובטחת. מדיניות פרטיות זו מסבירה כיצד אנו אוספים, משתמשים ומגנים על המידע שלכם בעת השימוש בפלטפורמה שלנו.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>מידע שאנו אוספים</h2>
          <p className={styles.paragraph}>
            אנו עשויים לאסוף את סוגי המידע הבאים:
          </p>
          <ul className={styles.list}>
            <li>פרטים אישיים כגון שם, כתובת אימייל וסיסמה בעת הרשמה לאתר</li>
            <li>תוכן שאתם מפרסמים באתר, כולל סיפורי החלמה ותגובות</li>
            <li>מידע מקצועי של מטפלים הנרשמים לפלטפורמה, כולל תחומי התמחות ופרטי קשר מקצועיים</li>
            <li>נתוני שימוש באתר כגון דפים שנצפו, זמן שהייה ופעולות שבוצעו</li>
            <li>מידע טכני כגון כתובת IP, סוג דפדפן ומערכת הפעלה</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>שימוש במידע</h2>
          <p className={styles.paragraph}>
            אנו משתמשים במידע שנאסף למטרות הבאות:
          </p>
          <ul className={styles.list}>
            <li>ניהול חשבון המשתמש ומתן גישה לשירותי הפלטפורמה</li>
            <li>הצגת סיפורי החלמה ופרופילי מטפלים בהתאם להרשאות</li>
            <li>שיפור חוויית המשתמש והפלטפורמה</li>
            <li>שליחת עדכונים והודעות הקשורות לחשבונכם</li>
            <li>הגנה על אבטחת הפלטפורמה ומניעת שימוש לרעה</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>עוגיות (Cookies)</h2>
          <p className={styles.paragraph}>
            האתר משתמש בעוגיות לצורך ניהול הפעלות (sessions), שמירת העדפות משתמש ושיפור חוויית הגלישה. עוגיות אלו חיוניות לתפקוד התקין של האתר, כולל תהליך ההתחברות ושמירת המצב המחובר.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>שיתוף מידע עם צדדים שלישיים</h2>
          <p className={styles.paragraph}>
            אנו לא מוכרים, סוחרים או מעבירים את המידע האישי שלכם לצדדים שלישיים, למעט במקרים הבאים:
          </p>
          <ul className={styles.list}>
            <li>ספקי שירות הנדרשים לתפעול הפלטפורמה (כגון שירותי אחסון ואימות)</li>
            <li>כאשר נדרש על פי חוק או צו בית משפט</li>
            <li>להגנה על זכויותינו, רכושנו או בטיחותנו</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>אבטחת מידע</h2>
          <p className={styles.paragraph}>
            אנו נוקטים באמצעי אבטחה סבירים להגנה על המידע האישי שלכם, כולל הצפנת סיסמאות, שימוש בפרוטוקול HTTPS ואחסון מאובטח. עם זאת, אין שיטת העברה באינטרנט או אחסון אלקטרוני שהיא מאובטחת ב-100%.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>זכויות המשתמש</h2>
          <p className={styles.paragraph}>
            יש לכם את הזכויות הבאות בנוגע למידע האישי שלכם:
          </p>
          <ul className={styles.list}>
            <li>לעיין במידע האישי שנאסף עליכם</li>
            <li>לבקש תיקון מידע שגוי</li>
            <li>לבקש מחיקת המידע האישי שלכם</li>
            <li>למשוך הסכמה לשימוש במידע שלכם</li>
          </ul>
        </section>

    
      </div>
    </div>
  )
}
