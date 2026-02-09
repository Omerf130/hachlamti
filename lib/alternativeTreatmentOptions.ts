/**
 * Alternative Treatment Categories and Sub-Categories
 * Single source of truth for alternative treatment options
 */

export const ALT_TREATMENT_OPTIONS: Record<string, string[]> = {
  'גוף-נפש ותנועה טיפולית': [
    'שיטת פאולה (השרירים הטבעתיים)',
    'יוגה טיפולית',
    'מדיטציה (מיינדפולנס, ויפאסנה, טרנסנדנטלית)',
    'טיפול במגע ותנועה',
    'אחר',
  ],
  'רפואה מסורתית ואנרגטית': [
    'דיקור סיני (אקופונקטורה)',
    'הומאופתיה',
    'רפלקסולוגיה',
    'נטורופתיה',
    'רפואת תדרים (ביורזוננס)',
    'ארומתרפיה (שמנים אתריים)',
    'רייקי / הילינג',
    'שיאצו / טווינא',
    'איורוודה (רפואה הודית)',
    'אחר',
  ],
  'תזונה ותוספים': [
    'ניקוי רעלים (דיטוקס)',
    'תזונה מבוססת צמחים (טבעונות/צמחונות)',
    'תזונה קטוגנית / פליאו',
    'דיאטת ללא גלוטן / ללא סוכר',
    'תוספי תזונה וויטמינים (אורתומולקולרית)',
    'רפואת צמחים (הרבליזם)',
    'אחר',
  ],
  'גוף-נפש וטיפול רגשי': [
    'NLP ודמיון מודרך',
    'שיטת קינגסטון (היגיינה טבעית)',
    'ביואורגונומי',
    'שיטת גרינברג',
    'טיפול באמצעות קול / צלילים',
    'פרחי באך',
    'פסיכותרפיה הוליסטית',
    'קינסיולוגיה',
    'אחר',
  ],
  'מסגרות וסדנאות': [
    'בתי בריאות (מרכזי החלמה וצום)',
    'סדנאות החלמה וטרנספורמציה',
    'מעגלי נשים',
    'אחר',
  ],
}

// Primary options include all category names plus "אחר"
export const ALT_TREATMENT_PRIMARY_OPTIONS: string[] = [
  ...Object.keys(ALT_TREATMENT_OPTIONS),
  'אחר',
]

/**
 * Get sub-options for a given primary category
 * @param primary - The primary category name
 * @returns Array of sub-category options, or ['אחר'] if primary is 'אחר' or invalid
 */
export function getAltTreatmentSubOptions(primary: string): string[] {
  if (primary === 'אחר' || !primary) {
    return ['אחר']
  }
  return ALT_TREATMENT_OPTIONS[primary] || ['אחר']
}

/**
 * Validate that a sub-category belongs to the given primary category
 * @param primary - The primary category
 * @param sub - The sub-category to validate
 * @returns true if valid, false otherwise
 */
export function isValidAltTreatmentSubCategory(primary: string, sub: string): boolean {
  if (primary === 'אחר') {
    return sub === 'אחר'
  }
  const subOptions = ALT_TREATMENT_OPTIONS[primary]
  if (!subOptions) return false
  return subOptions.includes(sub)
}

/**
 * Example valid payloads:
 * 
 * 1. Standard selection:
 * {
 *   primary: "רפואה מסורתית ואנרגטית",
 *   sub: "דיקור סיני (אקופונקטורה)"
 * }
 * 
 * 2. Primary other:
 * {
 *   primary: "אחר",
 *   primaryOtherText: "רפואה סינית מסורתית",
 *   sub: "אחר",
 *   subOtherText: "טיפול מיוחד"
 * }
 * 
 * 3. Sub other only:
 * {
 *   primary: "תזונה ותוספים",
 *   sub: "אחר",
 *   subOtherText: "דיאטה מיוחדת"
 * }
 */

