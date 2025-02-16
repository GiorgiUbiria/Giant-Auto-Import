import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

export default async function Page() {
  const t = await getTranslations('HowTo');

  return (
    <div className="container mx-auto px-4 py-12 text-primary max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-center">{t('title')}</h1>

      <div className="space-y-12">
        {/* Step 1 */}
        <div className="step-container hover:transform hover:scale-[1.02] transition-transform">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl">
              1
            </div>
            <h2 className="text-2xl font-semibold">{t('step1')}</h2>
          </div>
          <p className="text-lg text-gray-700 ml-14">{t('step1Description')}</p>
        </div>

        {/* Step 2 */}
        <div className="step-container hover:transform hover:scale-[1.02] transition-transform">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl">
              2
            </div>
            <h2 className="text-2xl font-semibold">{t('step2')}</h2>
          </div>
          <p className="text-lg text-gray-700 ml-14 mb-4">{t('step2Description')}</p>
          <div className="ml-14">
            <Image
              src="/extension1.jpeg"
              alt={t('imageAlt1')}
              width={800}
              height={450}
              className="rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            />
          </div>
        </div>

        {/* Step 3 */}
        <div className="step-container hover:transform hover:scale-[1.02] transition-transform">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl">
              3
            </div>
            <h2 className="text-2xl font-semibold">{t('step3')}</h2>
          </div>
          <p className="text-lg text-gray-700 ml-14">{t('step3Description')}</p>
        </div>

        {/* Step 4 */}
        <div className="step-container hover:transform hover:scale-[1.02] transition-transform">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl">
              4
            </div>
            <h2 className="text-2xl font-semibold">{t('step4')}</h2>
          </div>
          <p className="text-lg text-gray-700 ml-14 mb-4">{t('step4Description')}</p>
          <div className="ml-14">
            <Image
              src="/extension2.jpeg"
              alt={t('imageAlt2')}
              width={800}
              height={450}
              className="rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            />
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 shadow-sm">
          <p className="font-semibold text-blue-800">{t('note')}</p>
        </div>
      </div>
    </div>
  );
}