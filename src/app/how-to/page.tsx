import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

export default async function Page() {
  const t = await getTranslations('HowTo');

  return (
    <div className="container mx-auto px-4 py-8 text-primary">
      <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-2">{t('step1')}</h2>
          <p>{t('step1Description')}</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">{t('step2')}</h2>
          <p>{t('step2Description')}</p>
          <Image
            src="/extension1.jpeg"
            alt={t('imageAlt1')}
            width={800}
            height={450}
            className="mt-4 rounded-lg shadow-md"
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">{t('step3')}</h2>
          <p>{t('step3Description')}</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">{t('step4')}</h2>
          <p>{t('step4Description')}</p>
          <Image
            src="/extension2.jpeg"
            alt={t('imageAlt2')}
            width={800}
            height={450}
            className="mt-4 rounded-lg shadow-md"
          />
        </div>

        <div className="bg-blue-100 p-4 rounded-lg">
          <p className="font-semibold text-blue-700">{t('note')}</p>
        </div>
      </div>
    </div>
  );
}