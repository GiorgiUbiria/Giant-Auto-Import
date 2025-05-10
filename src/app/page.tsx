import dynamic from 'next/dynamic';
import { Suspense } from "react";
import { getTranslations } from 'next-intl/server';

function LoadingSpinner({ height = "h-24" }: { height?: string }) {
  return (
    <div className={`flex items-center justify-center w-full ${height}`} role="status">
      <div
        className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"
        aria-label="Loading content"
      />
    </div>
  );
}

const DynamicHero = dynamic(() => import('@/components/hero'), {
  loading: () => <LoadingSpinner height="h-96" />,
  ssr: true,
});

const DynamicLandingFeatures = dynamic(() => import('@/components/landing-features'), {
  loading: () => <LoadingSpinner height="h-96" />,
  ssr: true,
});

export const metadata = {
  title: 'Giant Auto Import - Home',
  description: 'Discover and import your dream car from our extensive worldwide collection',
};

export default async function HomePage() {
  const t = await getTranslations('LandingFeatures');

  const translations = {
    title: t('title'),
    subtitle: t('subtitle'),
    features: {
      pricing: {
        title: t('features.pricing.title'),
        description: t('features.pricing.description'),
      },
      security: {
        title: t('features.security.title'),
        description: t('features.security.description'),
      },
      shipping: {
        title: t('features.shipping.title'),
        description: t('features.shipping.description'),
      },
      support: {
        title: t('features.support.title'),
        description: t('features.support.description'),
      },
      selection: {
        title: t('features.selection.title'),
        description: t('features.selection.description'),
      },
      quality: {
        title: t('features.quality.title'),
        description: t('features.quality.description'),
      },
    },
  };

  return (
    <div className="flex flex-col gap-8">
      <section aria-label="Hero Section" className="w-full">
        <Suspense fallback={<LoadingSpinner height="h-96" />}>
          <DynamicHero />
        </Suspense>
      </section>

      <section aria-label="Features Section" className="w-full">
        <Suspense fallback={<LoadingSpinner height="h-96" />}>
          <DynamicLandingFeatures translations={translations} />
        </Suspense>
      </section>
    </div>
  );
}
