import dynamic from 'next/dynamic';
import { Suspense } from "react";

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
  return (
    <div className="flex flex-col gap-8">
      <section aria-label="Hero Section" className="w-full">
        <Suspense fallback={<LoadingSpinner height="h-96" />}>
          <DynamicHero />
        </Suspense>
      </section>

      <section aria-label="Features Section" className="w-full">
        <Suspense fallback={<LoadingSpinner height="h-96" />}>
          <DynamicLandingFeatures />
        </Suspense>
      </section>
    </div>
  );
}
