export type Locale = (typeof locales)[number];

export const locales = ['en', 'ge', 'ru'] as const;
export const defaultLocale: Locale = 'en';
