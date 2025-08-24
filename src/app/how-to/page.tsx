import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

export default async function Page() {
  const t = await getTranslations('HowTo');

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-primary max-w-4xl">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-300">
          {t('title')}
        </h1>

        <div className="space-y-8 sm:space-y-12">
          {/* Step 1: Chrome Extension Download */}
          <div className="step-container bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-xl 
            dark:shadow-gray-900/50 transition-all duration-300 ease-in-out transform hover:scale-[1.01]
            border border-gray-100 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-500 
                text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl 
                shadow-md dark:shadow-gray-900/50">
                1
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100">
                {t('step1')}
              </h2>
            </div>

            <div className="space-y-4 ml-0 sm:ml-16">
              <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300">
                {t('step1Description')}
              </p>

              <div className="mt-6">
                <a
                  href="https://chromewebstore.google.com/detail/auctiongate/ehpiejnmbdjkaplmbafaejdhodalfbie?hl=en&pli=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                  {t('step1DownloadButton')}
                </a>

                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">{t('step1FeaturesTitle')}</h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                    <li>• {t('step1Features.priceCalculations')}</li>
                    <li>• {t('step1Features.vinChecking')}</li>
                    <li>• {t('step1Features.invoiceGeneration')}</li>
                    <li>• {t('step1Features.accountManagement')}</li>
                    <li>• {t('step1Features.multiLanguage')}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Existing Steps (now 2-5) */}
          {[2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className="step-container bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-xl 
                dark:shadow-gray-900/50 transition-all duration-300 ease-in-out transform hover:scale-[1.01]
                border border-gray-100 dark:border-gray-700"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-500 
                  text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl 
                  shadow-md dark:shadow-gray-900/50">
                  {step}
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100">
                  {t(`step${step}`)}
                </h2>
              </div>

              <div className="space-y-4 ml-0 sm:ml-16">
                <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300">
                  {t(`step${step}Description`)}
                </p>

                {(step === 3 || step === 5) && (
                  <div className="mt-6">
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl 
                      ring-1 ring-gray-200 dark:ring-gray-700">
                      <Image
                        src={`/extension${step === 3 ? '1' : '2'}.webp`}
                        alt={t(`imageAlt${step === 3 ? '1' : '2'}`)}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300
                          dark:brightness-90 dark:contrast-more"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 800px"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 
            p-6 sm:p-8 rounded-2xl border border-blue-200 dark:border-blue-800 shadow-sm mt-12">
            <p className="font-semibold text-blue-800 dark:text-blue-300 text-center sm:text-left">
              {t('note')}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}