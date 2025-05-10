import { useTranslations } from 'next-intl';

interface LandingFeaturesProps {
  translations: {
    title: string;
    subtitle: string;
    features: {
      pricing: {
        title: string;
        description: string;
      };
      security: {
        title: string;
        description: string;
      };
      shipping: {
        title: string;
        description: string;
      };
      support: {
        title: string;
        description: string;
      };
      selection: {
        title: string;
        description: string;
      };
      quality: {
        title: string;
        description: string;
      };
    };
  };
}

export default function LandingFeaturesComponent({ translations }: LandingFeaturesProps) {
  return (
    <div className="max-w-6xl mx-auto px-5 mt-24 mb-24 text-gray-900 dark:text-white" id="features">
      <div className="text-center">
        <h2 className="font-bold text-4xl md:text-5xl animate-float bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 inline-block text-transparent bg-clip-text">
          {translations.title}
        </h2>
        <p className="max-w-2xl mx-auto mt-4 text-gray-600 dark:text-gray-400 text-lg">
          {translations.subtitle}
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
        <div className="flex gap-4 items-start p-6 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors animate-fadeInRight group">
          <span className="text-blue-600 bg-blue-500/10 p-3 rounded-xl group-hover:bg-blue-500/20 transition-colors">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          <div>
            <h3 className="font-semibold text-xl mb-2">{translations.features.pricing.title}</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {translations.features.pricing.description}
            </p>
          </div>
        </div>

        <div className="flex gap-4 items-start p-6 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors animate-fadeInLeft group">
          <span className="text-blue-600 bg-blue-500/10 p-3 rounded-xl group-hover:bg-blue-500/20 transition-colors">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </span>
          <div>
            <h3 className="font-semibold text-xl mb-2">{translations.features.security.title}</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {translations.features.security.description}
            </p>
          </div>
        </div>

        <div className="flex gap-4 items-start p-6 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors animate-fadeInRight group">
          <span className="text-blue-600 bg-blue-500/10 p-3 rounded-xl group-hover:bg-blue-500/20 transition-colors">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </span>
          <div>
            <h3 className="font-semibold text-xl mb-2">{translations.features.shipping.title}</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {translations.features.shipping.description}
            </p>
          </div>
        </div>

        <div className="flex gap-4 items-start p-6 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors animate-fadeInLeft group">
          <span className="text-blue-600 bg-blue-500/10 p-3 rounded-xl group-hover:bg-blue-500/20 transition-colors">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </span>
          <div>
            <h3 className="font-semibold text-xl mb-2">{translations.features.support.title}</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {translations.features.support.description}
            </p>
          </div>
        </div>

        <div className="flex gap-4 items-start p-6 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors animate-fadeInRight group">
          <span className="text-blue-600 bg-blue-500/10 p-3 rounded-xl group-hover:bg-blue-500/20 transition-colors">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </span>
          <div>
            <h3 className="font-semibold text-xl mb-2">{translations.features.selection.title}</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {translations.features.selection.description}
            </p>
          </div>
        </div>

        <div className="flex gap-4 items-start p-6 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors animate-fadeInLeft group">
          <span className="text-blue-600 bg-blue-500/10 p-3 rounded-xl group-hover:bg-blue-500/20 transition-colors">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          <div>
            <h3 className="font-semibold text-xl mb-2">{translations.features.quality.title}</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {translations.features.quality.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
