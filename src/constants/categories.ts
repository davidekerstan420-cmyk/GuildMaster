export const CATEGORIES = ['School', 'Health', 'General', 'Hobby'] as const;
export type Category = (typeof CATEGORIES)[number];

// Habits get their icon from the category.
export const CATEGORY_ICON = {
  School: 'book',
  Health: 'shield',
  General: 'sun',
  Hobby: 'sun',
} as const;