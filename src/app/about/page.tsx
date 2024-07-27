import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import ServiceOne from "../../../public/service1.avif";
import ServiceTwo from "../../../public/service2.avif";
import ServiceThree from "../../../public/service3.avif";
import ServiceFour from "../../../public/service4.avif";
import ServiceFive from "../../../public/service5.avif";

import Image from "next/image";

export default async function Page() {
  return (
    <div>
      <div className="mx-auto max-w-6xl px-6 py-12 grid place-items-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-black dark:text-white mb-4">
            Welcome to Giant Auto Import
          </h1>
          <p className="text-xl dark:text-white text-black mb-8">
            Giant Auto Import is an auto importing company staffed by highly qualified professionals. Our main goal is to make the process of buying and delivering cars more transparent. We aim to make the desired car available for all customers, simplifying and securing the purchase and shipping process. Our team will help you choose the right car, inspect it, and transport it to Georgia. Creating a comfortable environment for the customer is our top priority.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
            <Image src={ServiceOne} alt="Service One" className="w-full max-h-64 rounded-md" />
            <div className="p-5">
              <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Free Auto-Expert Consultation</h5>
              <Accordion type="single" collapsible className="w-full rounded-md text-gray-900 dark:text-white">
                <AccordionItem value="item-1">
                  <AccordionTrigger>What is included in the free consultation?</AccordionTrigger>
                  <AccordionContent>
                    Our free consultation with an auto-expert includes personalized advice on selecting the right car based on your needs, budget, and preferences. The expert will also provide insights into the current market trends and offer recommendations for the best deals available.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
          <div className="max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
            <Image src={ServiceTwo} alt="Service Two" className="w-full max-h-64 rounded-md"  />
            <div className="p-5">
              <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Car Selection from Leading Auctions</h5>
              <Accordion type="single" collapsible className="w-full rounded-md text-gray-900 dark:text-white">
                <AccordionItem value="item-1">
                  <AccordionTrigger>How to select cars from top auctions?</AccordionTrigger>
                  <AccordionContent>
                    {"We provide access to a wide range of cars from the world's leading auctions. Our platform allows you to browse, compare, and select your desired cars. We also offer assistance in understanding auction processes and making informed bids."}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
          <div className="max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
            <Image src={ServiceThree} alt="Service Three" className="w-full max-h-64 rounded-md" />
            <div className="p-5">
              <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Live Auction Participation</h5>
              <Accordion type="single" collapsible className="w-full rounded-md text-gray-900 dark:text-white">
                <AccordionItem value="item-1">
                  <AccordionTrigger>What is live auction participation?</AccordionTrigger>
                  <AccordionContent>
                    Live auction participation allows you to bid on cars in real-time. Our team can represent you in live auctions, providing you with updates and guidance throughout the process to ensure you secure the best deals.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          <div className="max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
            <Image src={ServiceFour} alt="Service Four" className="w-full max-h-64 rounded-md" />
            <div className="p-5">
              <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Vehicle History Check</h5>
              <Accordion type="single" collapsible className="w-full rounded-md text-gray-900 dark:text-white">
                <AccordionItem value="item-1">
                  <AccordionTrigger>{"Why check the vehicle's history?"}</AccordionTrigger>
                  <AccordionContent>
                    {"Checking the vehicle's history is crucial to ensure you are making a safe investment. We provide comprehensive vehicle history reports that include past ownership, accident records, maintenance history, and more to give you peace of mind before purchasing."}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
          <div className="max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
            <Image src={ServiceFive} alt="Service Five" className="w-full max-h-64 rounded-md" />
            <div className="p-5">
              <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Comprehensive Shipping Service</h5>
              <Accordion type="single" collapsible className="w-full rounded-md text-gray-900 dark:text-white">
                <AccordionItem value="item-1">
                  <AccordionTrigger>What does the shipping service include?</AccordionTrigger>
                  <AccordionContent>
                    Our shipping service covers transportation from the port of Georgia to any location within Georgia and beyond. We ensure safe and timely delivery, handling all logistics and customs clearance to provide a hassle-free experience.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
