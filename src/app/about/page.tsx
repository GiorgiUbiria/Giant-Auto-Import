import { useTranslations } from 'next-intl';
import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getTranslations } from 'next-intl/server';

import ServiceOne from "../../../public/service1.png";
import ServiceTwo from "../../../public/service2.png";
import ServiceThree from "../../../public/service3.png";
import ServiceFour from "../../../public/service4.png";
import ServiceFive from "../../../public/service5.png";

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
    <div>
      <div className="mx-auto max-w-6xl px-6 py-12 grid place-items-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-black dark:text-white mb-4">
            {t('title')}
          </h1>
          <p className="text-xl dark:text-white text-black mb-8">
            {t('description')}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          {services.slice(0, 3).map((service, index) => (
            <div key={index} className="max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
              <Image src={service.image} alt={t(`services.${service.key}.title`)} className="w-full max-h-64 rounded-md" />
              <div className="p-5">
                <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {t(`services.${service.key}.title`)}
                </h5>
                <Accordion type="single" collapsible className="w-full rounded-md text-gray-900 dark:text-white">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>{t('learnMore')}</AccordionTrigger>
                    <AccordionContent>
                      {t(`services.${service.key}.description`)}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          {services.slice(3).map((service, index) => (
            <div key={index} className="max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
              <Image src={service.image} alt={t(`services.${service.key}.title`)} className="w-full max-h-64 rounded-md" />
              <div className="p-5">
                <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {t(`services.${service.key}.title`)}
                </h5>
                <Accordion type="single" collapsible className="w-full rounded-md text-gray-900 dark:text-white">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>{t('learnMore')}</AccordionTrigger>
                    <AccordionContent>
                      {t(`services.${service.key}.description`)}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}