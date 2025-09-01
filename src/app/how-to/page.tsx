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
          <div className="step-container bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg hover:shadow-2xl 
            dark:shadow-black/40 transition-all duration-300 ease-in-out transform hover:scale-[1.01]
            border-2 border-gray-200 dark:border-gray-600">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 
                text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl 
                shadow-lg dark:shadow-blue-500/30">
                1
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {t('step1')}
              </h2>
            </div>

            <div className="space-y-4 ml-0 sm:ml-16">
              <p className="text-base sm:text-lg text-gray-800 dark:text-gray-100 font-medium leading-relaxed">
                {t('step1Description')}
              </p>

              <div className="mt-6">
                <a
                  href="https://chromewebstore.google.com/detail/auctiongate/ehpiejnmbdjkaplmbafaejdhodalfbie?hl=en&pli=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                  {t('step1DownloadButton')}
                </a>

                <div className="mt-4 p-4 bg-blue-100 dark:bg-blue-900/40 rounded-lg border-2 border-blue-300 dark:border-blue-700">
                  <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-2">{t('step1FeaturesTitle')}</h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1 font-medium">
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
              className="step-container bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg hover:shadow-2xl 
                dark:shadow-black/40 transition-all duration-300 ease-in-out transform hover:scale-[1.01]
                border-2 border-gray-200 dark:border-gray-600"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 
                  text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl 
                  shadow-lg dark:shadow-blue-500/30">
                  {step}
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {t(`step${step}`)}
                </h2>
              </div>

              <div className="space-y-4 ml-0 sm:ml-16">
                <p className="text-base sm:text-lg text-gray-800 dark:text-gray-100 font-medium leading-relaxed">
                  {t(`step${step}Description`)}
                </p>

                {(step === 3 || step === 5) && (
                  <div className="mt-6">
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl 
                      ring-2 ring-gray-300 dark:ring-gray-600 shadow-lg">
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

          <div className="bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-800/40 dark:to-blue-900/40 
            p-6 sm:p-8 rounded-2xl border-2 border-blue-300 dark:border-blue-700 shadow-lg mt-12">
            <p className="font-bold text-blue-900 dark:text-blue-200 text-center sm:text-left text-lg">
              {t('note')}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}