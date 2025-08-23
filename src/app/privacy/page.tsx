import { getTranslations } from 'next-intl/server';

export default async function Page() {
  const t = await getTranslations('PrivacyPolicy');

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20 text-primary">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">{t('title')}</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('lastUpdated')}
        </p>
      </div>
      <div className="prose dark:prose-invert max-w-none">
        <p>{t('introduction')}</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          {t('informationWeCollect')}
        </h2>
        <p>{t('informationWeCollectContent')}</p>
        <ul>
          <li>{t('personalInfo')}</li>
          <li>{t('vehicleInfo')}</li>
          <li>{t('usageData')}</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          {t('howWeUseInfo')}
        </h2>
        <p>{t('howWeUseInfoContent')}</p>
        <ul>
          <li>{t('providingServices')}</li>
          <li>{t('processingTransactions')}</li>
          <li>{t('communicating')}</li>
          <li>{t('analyzingUsage')}</li>
          <li>{t('complyingLegal')}</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">{t('dataSecurity')}</h2>
        <p>{t('dataSecurityContent')}</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          {t('thirdPartyServices')}
        </h2>
        <p>{t('thirdPartyServicesContent')}</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">{t('yourRights')}</h2>
        <p>{t('yourRightsContent')}</p>
        <ul>
          <li>{t('accessInfo')}</li>
          <li>{t('correctInfo')}</li>
          <li>{t('deleteInfo')}</li>
          <li>{t('objectProcessing')}</li>
          <li>{t('requestCopy')}</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">{t('changes')}</h2>
        <p>{t('changesContent')}</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">{t('contactUs')}</h2>
        <p>{t('contactUsContent')}</p>
        <p>
          {t('email')}:{" "}
          <a
            href="mailto:giant.autoimporti@gmail.com"
            className="text-blue-600 dark:text-blue-400"
          >
            giant.autoimporti@gmail.com
          </a>
          <br />
          {t('phone')}:{" "}
          <a
            href="tel:+995555550553"
            className="text-blue-600 dark:text-blue-400"
          >
            +995 555 550 553
          </a>
        </p>
      </div>
    </div>
  );
}