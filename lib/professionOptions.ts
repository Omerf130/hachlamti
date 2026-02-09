/**
 * Profession Options for Therapist Application
 * Single source of truth for all profession options
 */

export const PROFESSION_OPTIONS = [
  'נטורופת/ית',
  'דיקור סיני',
  'רפלקסולוג/ית',
  'תזונאי/ת הוליסטי/ת',
  'פיזיותרפיסט/ית',
  'פסיכותרפיסט/ית',
  'מטפל/ת NLP',
  'מטפל/ת רגשי/ת',
  'כירופרקט/ית',
  'שיאצו',
  'עיסוי רפואי',
  'הומאופת/ית',
  'יוגה טיפולית',
  'קינסיולוג/ית',
  'מדריך/ה מדיטציה',
  'אחר',
] as const

export type ProfessionOption = typeof PROFESSION_OPTIONS[number]

