import dynamic from 'next/dynamic';
import { Suspense } from "react";
import { getTranslations } from 'next-intl/server';
import LoadingSpinner from '@/components/loading-spinner';

const DynamicHero = dynamic(() => import('@/components/hero'), {
  loading: () => <LoadingSpinner height="h-96" variant="gradient" size="lg" />,
  ssr: false,
});

const DynamicLandingFeatures = dynamic(() => import('@/components/landing-features'), {
  loading: () => <LoadingSpinner height="h-96" variant="pulse" size="lg" />,
  ssr: false,
});

export const metadata = {
  title: 'Giant Auto Import - Premium Vehicle Import Services',
  description: 'Discover and import your dream car from our extensive worldwide collection with secure, transparent pricing and professional support.',
};

export default async function HomePage() {
  const t = await getTranslations('LandingFeatures');
  const tHero = await getTranslations('Hero');

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

  const heroTranslations = {
    title: tHero('title'),
    subtitle: tHero('subtitle'),
    startImporting: tHero('startImporting'),
    howItWorks: tHero('howItWorks'),
  };

  return (
    <div className="flex flex-col scroll-smooth overflow-x-hidden">
      <section aria-label="Hero Section" className="w-full relative">
        <Suspense fallback={<LoadingSpinner height="h-96" variant="gradient" size="lg" />}>
          <DynamicHero translations={heroTranslations} />
        </Suspense>
      </section>

      <section aria-label="Features Section" className="w-full relative">
        <Suspense fallback={<LoadingSpinner height="h-96" variant="pulse" size="lg" />}>
          <DynamicLandingFeatures translations={translations} />
        </Suspense>
      </section>
    </div>
  );
}
