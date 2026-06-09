import styles from '@/styles/legal-page.module.scss'

export const metadata = {
  title: 'הצהרת נגישות | החלמתי',
}

export default function AccessibilityPage(): JSX.Element {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>הצהרת נגישות</h1>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>מחויבות לנגישות</h2>
          <p className={styles.paragraph}>
            אתר החלמתי מחויב לספק חוויית גלישה נגישה לכלל המשתמשים, כולל אנשים עם מוגבלויות. אנו משקיעים מאמצים מתמשכים לשפר את נגישות האתר ולהבטיח שכל אדם יוכל לגשת לתוכן ולשירותים שלנו בצורה נוחה ושוויונית.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>תקן הנגישות</h2>
          <p className={styles.paragraph}>
            אנו שואפים לעמוד בדרישות תקן הנגישות הישראלי (ת&quot;י 5568) ובהנחיות WCAG 2.1 ברמת AA. תקנים אלו מגדירים כיצד להפוך תוכן אינטרנט לנגיש יותר עבור אנשים עם מוגבלויות שונות, כולל מוגבלויות ראייה, שמיעה, מוטוריקה וקוגניטיביות.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>פעולות שננקטו</h2>
          <p className={styles.paragraph}>
            במסגרת מחויבותנו לנגישות, נקטנו בצעדים הבאים:
          </p>
          <ul className={styles.list}>
            <li>התקנת תוסף הנגישות UserWay המאפשר התאמות תצוגה אישיות כגון הגדלת טקסט, ניגודיות צבעים, הדגשת קישורים ועוד</li>
            <li>שימוש ב-HTML סמנטי לשיפור תאימות עם קוראי מסך</li>
            <li>תמיכה מלאה בניווט באמצעות מקלדת</li>
            <li>תיוג תמונות ואלמנטים גרפיים עם טקסט חלופי (alt text)</li>
            <li>שימוש בניגודיות צבעים מספקת בין טקסט לרקע</li>
            <li>מבנה כותרות היררכי ומסודר לניווט קל</li>
            <li>טפסים עם תוויות (labels) ברורות והודעות שגיאה מובנות</li>
            <li>תמיכה מלאה בכיוון טקסט מימין לשמאל (RTL) עבור עברית</li>
            <li>עיצוב רספונסיבי המותאם למגוון מכשירים וגדלי מסך</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>תוסף הנגישות</h2>
          <p className={styles.paragraph}>
            באתר מותקן תוסף הנגישות של UserWay. ניתן לגשת אליו באמצעות לחיצה על סמל הנגישות המופיע בפינת המסך. התוסף מאפשר:
          </p>
          <ul className={styles.list}>
            <li>הגדלה והקטנה של גודל הטקסט</li>
            <li>שינוי ניגודיות הצבעים</li>
            <li>הדגשת קישורים</li>
            <li>שינוי גופן לגופן קריא יותר</li>
            <li>עצירת אנימציות</li>
            <li>סמן מוגדל</li>
            <li>מדריך קריאה (Reading Guide)</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>מגבלות ידועות</h2>
          <p className={styles.paragraph}>
            על אף מאמצינו, ייתכן שחלקים מסוימים באתר אינם נגישים באופן מלא. אנו עובדים באופן שוטף לזהות ולתקן בעיות נגישות. אם נתקלתם בבעיית נגישות באתר, נשמח לשמוע מכם כדי שנוכל לטפל בה.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>דפדפנים וטכנולוגיות מסייעות</h2>
          <p className={styles.paragraph}>
            האתר תוכנן לתמוך בדפדפנים המודרניים העיקריים:
          </p>
          <ul className={styles.list}>
            <li>Google Chrome (גרסה אחרונה)</li>
            <li>Mozilla Firefox (גרסה אחרונה)</li>
            <li>Microsoft Edge (גרסה אחרונה)</li>
            <li>Apple Safari (גרסה אחרונה)</li>
          </ul>
          <p className={styles.paragraph}>
            האתר תואם לעבודה עם טכנולוגיות מסייעות כגון קוראי מסך (NVDA, JAWS, VoiceOver) ותוכנות הגדלה.
          </p>
        </section>

      </div>
    </div>
  )
}
