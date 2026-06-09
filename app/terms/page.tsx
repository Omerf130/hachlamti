import styles from '@/styles/legal-page.module.scss'

export const metadata = {
  title: 'תנאי שימוש | החלמתי',
}

export default function TermsPage(): JSX.Element {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>תנאי שימוש</h1>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>קבלת התנאים</h2>
          <p className={styles.paragraph}>
            בעצם השימוש באתר החלמתי, אתם מסכימים לתנאי שימוש אלו במלואם. אם אינכם מסכימים לתנאים אלו, אנא הימנעו משימוש באתר. אנו שומרים לעצמנו את הזכות לעדכן תנאים אלו מעת לעת, ושימוש מתמשך באתר מהווה הסכמה לתנאים המעודכנים.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>תיאור השירות</h2>
          <p className={styles.paragraph}>
            החלמתי היא פלטפורמה דיגיטלית המאפשרת שיתוף סיפורי החלמה וחיבור בין משתמשים למטפלים מקצועיים. הפלטפורמה מספקת מרחב לשיתוף חוויות אישיות ומידע על מטפלים, אך אינה מהווה תחליף לייעוץ מקצועי או טיפול רפואי.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>שימוש מותר</h2>
          <p className={styles.paragraph}>
            בעת השימוש בפלטפורמה, אתם מתחייבים:
          </p>
          <ul className={styles.list}>
            <li>לספק מידע מדויק ואמיתי בעת ההרשמה ובפרופיל שלכם</li>
            <li>לשמור על סודיות פרטי ההתחברות שלכם</li>
            <li>לא לפרסם תוכן פוגעני, מטעה, מאיים או בלתי חוקי</li>
            <li>לא להתחזות לאדם אחר או לגוף אחר</li>
            <li>לא להשתמש בפלטפורמה למטרות מסחריות ללא אישור מראש</li>
            <li>לכבד את פרטיות המשתמשים האחרים ואת סיפוריהם האישיים</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>תוכן משתמשים</h2>
          <p className={styles.paragraph}>
            אתם אחראים לכל תוכן שאתם מפרסמים בפלטפורמה, כולל סיפורי החלמה ותגובות. בפרסום תוכן באתר, אתם מעניקים לנו רישיון לא בלעדי להציג, להפיץ ולשתף את התוכן במסגרת הפלטפורמה. אנו שומרים לעצמנו את הזכות להסיר תוכן שמפר את תנאי השימוש.
          </p>
          <p className={styles.paragraph}>
            סיפורים שמתפרסמים באתר עשויים להיות גלויים לכלל המשתמשים, בהתאם להגדרות הפרסום. אנו ממליצים לשקול בזהירות מה לשתף ולהימנע מפרסום מידע מזהה רגיש.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>מטפלים בפלטפורמה</h2>
          <p className={styles.paragraph}>
            מטפלים הנרשמים לפלטפורמה אחראים לוודא שהמידע המקצועי שלהם מדויק ועדכני, כולל הסמכות, תחומי התמחות ופרטי קשר. הפלטפורמה אינה אחראית לאימות ההסמכות המקצועיות של המטפלים, והקשר בין משתמשים למטפלים הוא באחריותם הבלעדית.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>קניין רוחני</h2>
          <p className={styles.paragraph}>
            כל התוכן, העיצוב, הלוגו והקוד של אתר החלמתי מוגנים בזכויות יוצרים ובקניין רוחני. אין להעתיק, לשכפל, להפיץ או ליצור יצירות נגזרות מתוכן האתר ללא אישור מראש ובכתב.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>הגבלת אחריות</h2>
          <p className={styles.paragraph}>
            הפלטפורמה מסופקת &quot;כפי שהיא&quot; (AS IS) ללא כל אחריות מפורשת או משתמעת. אנו לא אחראים לכל נזק ישיר, עקיף, מקרי או תוצאתי הנובע משימוש בפלטפורמה. התוכן המופיע באתר, כולל סיפורי החלמה ומידע על מטפלים, הוא למטרות מידע בלבד ואינו מהווה ייעוץ מקצועי.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>סיום חשבון</h2>
          <p className={styles.paragraph}>
            אנו שומרים לעצמנו את הזכות להשעות או לסגור חשבונות של משתמשים המפרים את תנאי השימוש, ללא הודעה מוקדמת. משתמשים רשאים לבקש סגירת חשבונם בכל עת באמצעות פנייה אלינו.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>דין חל וסמכות שיפוט</h2>
          <p className={styles.paragraph}>
            תנאי שימוש אלו כפופים לחוקי מדינת ישראל. כל מחלוקת הנובעת משימוש בפלטפורמה תידון בבתי המשפט המוסמכים בישראל.
          </p>
        </section>

      </div>
    </div>
  )
}
