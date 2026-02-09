/**
 * Health Challenge Categories and Sub-Categories
 * Single source of truth for all health-related options in the intake form
 */

export const HEALTH_OPTIONS: Record<string, string[]> = {
  'מערכת העיכול': [
    'תסמונת המעי הרגיז (IBS)',
    'מחלות מעי דלקתיות (קרוהן, קוליטיס)',
    'ריפלוקס וצרבות',
    'עצירות כרונית / נפיחות',
    'הליקובקטור פילורי',
    'קרוהן',
    'קוליטיס',
    'שיקום פלורת המעי',
    'אחר',
  ],
  'כאב ושלד (אורתופדיה)': [
    'כאבי גב תחתון ופריצות דיסק',
    'מפרקים',
    'אורתופדיה',
    'פציעות ספורט',
    'מיגרנות וכאבי ראש כרוניים',
    'פיברומיאלגיה (דאבת השרירים)',
    'דלקות פרקים (ארתריטיס)',
    'כאבי ברכיים / שחיקת סחוס',
    'דלקות בגידים (טניס אלבו וכדומה)',
    'אחר',
  ],
  'בריאות הנפש ורגש': [
    'חרדה והתקפי חרדה',
    'דיכאון קל עד בינוני',
    'פוסט טראומה (PTSD)',
    'נדודי שינה (אינסומניה)',
    'מתח (Stress) כרוני והתמוטטות עצבים',
    'התפתחות אישית',
    'אחר',
  ],
  'עור ואלרגיות': [
    'אטופיק דרמטיטיס (אסתמה של העור)',
    'פסוריאזיס',
    'אקנה (פצעי בגרות)',
    'אלרגיות עונתיות / קדחת השחת',
    'אורטיקריה (סרפדת)',
    'אחר',
  ],
  'נשים והורמונים': [
    'תסמונת השחלות הפוליציסטיות (PCOS)',
    'אנדומטריוזיס',
    'כאבי מחזור קשים (דיסמנוריאה)',
    'גיל המעבר (גלי חום, שינויי מצב רוח)',
    'פריון (כליווי לטיפולי פוריות או טבעי)',
    'איזון הורמונאלי',
    'אחר',
  ],
  'מחלות כרוניות ומטבוליות': [
    'סוכרת סוג 2',
    'יתר לחץ דם',
    'תת/יתר פעילות של בלוטת התריס',
    'כולסטרול גבוה',
    'עייפות כרונית (תשישות)',
    'ניקוי רעלים',
    'אחר',
  ],
  'נשימה וחיסון': [
    'אסתמה',
    'סינוסיטיס כרוני',
    'חיזוק המערכת החיסונית (מחלות ויראליות חוזרות)',
    'חיזוק חיסוני',
    'אחר',
  ],
  'ילדים ותינוקות': [
    'בעיית קשב',
    'קשיים רגשיים',
    'חרדות',
    'קשיי תקשורת',
    'חיזוקים חברתיים',
    'קלינאית תקשורת',
    'אחר',
  ],
  'שיפור איכות החיים': [
    'עייפות כרונית',
    'הפרעות שינה',
    'סטרס',
    'חיזוק חוסן נפשי',
    'חיוניות מנטאלית',
    'ניקוי רעלים',
    'שיפור היציבה, הנשימה והחיבור לגוף',
    'אחר',
  ],
}

// Primary options include all category names plus "אחר"
export const PRIMARY_OPTIONS: string[] = [
  ...Object.keys(HEALTH_OPTIONS),
  'אחר',
]

/**
 * Get sub-options for a given primary category
 * @param primary - The primary category name
 * @returns Array of sub-category options, or ['אחר'] if primary is 'אחר' or invalid
 */
export function getSubOptions(primary: string): string[] {
  if (primary === 'אחר' || !primary) {
    return ['אחר']
  }
  return HEALTH_OPTIONS[primary] || ['אחר']
}

/**
 * Validate that a sub-category belongs to the given primary category
 * @param primary - The primary category
 * @param sub - The sub-category to validate
 * @returns true if valid, false otherwise
 */
export function isValidSubCategory(primary: string, sub: string): boolean {
  if (primary === 'אחר') {
    return sub === 'אחר'
  }
  const subOptions = HEALTH_OPTIONS[primary]
  if (!subOptions) return false
  return subOptions.includes(sub)
}

/**
 * Example valid payloads:
 * 
 * 1. Standard selection:
 * {
 *   primary: "מערכת העיכול",
 *   sub: "תסמונת המעי הרגיז (IBS)"
 * }
 * 
 * 2. Primary other:
 * {
 *   primary: "אחר",
 *   primaryOtherText: "אלרגיה לגלוטן",
 *   sub: "אחר",
 *   subOtherText: "רגישות חמורה"
 * }
 * 
 * 3. Sub other only:
 * {
 *   primary: "כאב ושלד (אורתופדיה)",
 *   sub: "אחר",
 *   subOtherText: "כאבי צוואר כרוניים"
 * }
 * 
 * Example INVALID payloads:
 * 
 * 1. Missing required fields:
 * {
 *   primary: "מערכת העיכול"
 *   // Missing sub!
 * }
 * 
 * 2. Invalid sub for primary:
 * {
 *   primary: "מערכת העיכול",
 *   sub: "אסתמה" // This belongs to "נשימה וחיסון"
 * }
 * 
 * 3. Primary is "אחר" but missing primaryOtherText:
 * {
 *   primary: "אחר",
 *   sub: "אחר"
 *   // Missing primaryOtherText!
 * }
 */

