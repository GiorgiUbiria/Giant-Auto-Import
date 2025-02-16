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
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <section className="relative py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16 space-y-4">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white tracking-tight animate-fade-in">
              {t('title')}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              {t('description')}
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {services.map((service, index) => (
              <div
                key={index}
                className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={service.image}
                    alt={t(`services.${service.key}.title`)}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                    placeholder="blur"
                  />
                </div>
                <div className="p-6 space-y-4">
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {t(`services.${service.key}.title`)}
                  </h3>
                  <Accordion
                    type="single"
                    collapsible
                    className="border-none shadow-none"
                  >
                    <AccordionItem
                      value="description"
                      className="border-none"
                    >
                      <AccordionTrigger className="text-primary hover:text-primary/80 transition-colors py-2 px-0">
                        {t('learnMore')}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {t(`services.${service.key}.description`)}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
