import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getTranslations } from 'next-intl/server';
import Image from "next/image";
import ServiceOne from "../../../public/service1.jpeg";
import ServiceTwo from "../../../public/service2.jpeg"; 
import ServiceThree from "../../../public/service3.jpeg";
import ServiceFour from "../../../public/service4.jpeg";
import ServiceFive from "../../../public/service5.jpeg";

// Mark this page as statically generated with ISR
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

// Pre-generate the page for all supported locales
export async function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'ge' }, { locale: 'ru' }];
}

export default async function Page() {
  const t = await getTranslations('AboutPage');

  const services = [
    { image: ServiceOne, key: 'consultation' },
    { image: ServiceTwo, key: 'carSelection' },
    { image: ServiceThree, key: 'liveAuction' },
    { image: ServiceFour, key: 'historyCheck' },
    { image: ServiceFive, key: 'shipping' },
  ];

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 py-16 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight animate-fade-in bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-primary to-gray-700 dark:from-white dark:to-gray-300">
            {t('title')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed animate-fade-in-up opacity-90">
            {t('description')}
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
          {services.map((service, index) => (
            <div
              key={index}
              className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl 
              transition-all duration-500 overflow-hidden border border-gray-200 
              dark:border-gray-700 hover:border-primary/50 dark:hover:border-primary/50"
            >
              <div className="relative h-48 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Image
                  src={service.image}
                  alt={t(`services.${service.key}.title`)}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out"
                  placeholder="blur"
                  priority={index < 3} // Prioritize loading first 3 images
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <div className="p-5 flex flex-col h-[calc(100%-192px)]">
                <h3 className="text-xl font-semibold mb-3">
                  {t(`services.${service.key}.title`)}
                </h3>
                <p className="text-sm mb-4 flex-grow">
                  {t(`services.${service.key}.description`)}
                </p>
                <Accordion
                  type="single"
                  collapsible
                  className="border-none shadow-none mt-auto"
                >
                  <AccordionItem
                    value="description"
                    className="border-t border-gray-200 dark:border-gray-700"
                  >
                    <AccordionTrigger className="py-3 px-0">
                      {t('learnMore')}
                    </AccordionTrigger>
                    <AccordionContent className="pb-3">
                      {t(`services.${service.key}.description`)}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
