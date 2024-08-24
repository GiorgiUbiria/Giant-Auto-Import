import { getTranslations } from 'next-intl/server';

export default async function Page() {
  const t = await getTranslations('TermsAndConditions');

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20 text-primary">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
      </div>
      <div className="prose prose-lg">
        <p>{t('introduction')}</p>

        <h2>{t('accountsTitle')}</h2>
        <p>{t('accountsContent')}</p>

        <h2>{t('intellectualPropertyTitle')}</h2>
        <p>{t('intellectualPropertyContent')}</p>

        <h2>{t('userContentTitle')}</h2>
        <p>{t('userContentContent')}</p>

        <h2>{t('limitationOfLiabilityTitle')}</h2>
        <p>{t('limitationOfLiabilityContent')}</p>

        <h2>{t('indemnificationTitle')}</h2>
        <p>{t('indemnificationContent')}</p>

        <h2>{t('terminationTitle')}</h2>
        <p>{t('terminationContent')}</p>

        <h2>{t('governingLawTitle')}</h2>
        <p>{t('governingLawContent')}</p>

        <h2>{t('changesTitle')}</h2>
        <p>{t('changesContent')}</p>

        <h2>{t('contactTitle')}</h2>
        <p>{t('contactContent')}</p>

        <p>{t('agreement')}</p>
      </div>
    </div>
  );
}