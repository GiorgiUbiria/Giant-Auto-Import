export type Locale = (typeof locales)[number];

export const locales = ['en', 'ge'] as const;
export const defaultLocale: Locale = 'en';
