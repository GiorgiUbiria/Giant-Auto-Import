import { getTranslations } from 'next-intl/server';
import ContactForm from './ContactForm';

export default async function Page() {
  const t = await getTranslations('ContactPage');

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 py-16 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight animate-fade-in bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-primary to-gray-700 dark:from-white dark:to-gray-300 leading-tight">
            {t('title')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed animate-fade-in-up opacity-90 break-words">
            {t('description')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold mb-4 leading-tight">{t('contactInfo')}</h3>
              <div className="space-y-4">
                <div>
                  <p className="font-medium leading-relaxed">{t('address')}</p>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">123 Business Street</p>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">City, Country</p>
                </div>
                <div>
                  <p className="font-medium leading-relaxed">{t('email')}</p>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed break-all">contact@giantautoimport.com</p>
                </div>
                <div>
                  <p className="font-medium leading-relaxed">{t('phone')}</p>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">+1 234 567 8900</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold mb-4 leading-tight">{t('businessHours')}</h3>
              <div className="space-y-2">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  <span className="font-medium">{t('weekdays')}:</span> 9:00 AM - 6:00 PM
                </p>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  <span className="font-medium">{t('weekends')}:</span> {t('closed')}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <ContactForm translations={{
            name: t('form.name'),
            email: t('form.email'),
            message: t('form.message'),
            submit: t('form.submit'),
            success: t('form.success'),
            error: t('form.error'),
            required: t('form.required'),
          }} />
        </div>
      </div>
    </main>
  );
}