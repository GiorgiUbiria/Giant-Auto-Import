"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from 'sonner';
import { Loader2 } from "lucide-react";

export default function Page() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const sendEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const { email, name, message } = formData;
    const recipientEmail = "ubiriagiorgi8@gmail.com";

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipientEmail, name, email, message }),
      });

      if (response.ok) {
        toast.success('Email sent successfully!');
        setFormData({ name: "", email: "", message: "" });
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <section id="contact" className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-4">
            <div className="mb-6 max-w-3xl text-center sm:text-center md:mx-auto md:mb-12">
              <h2 className="font-heading mb-4 font-bold tracking-tight text-gray-900 dark:text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
                Get in Touch
              </h2>
              <p className="mx-auto mt-4 max-w-3xl text-base sm:text-lg md:text-xl text-gray-600 dark:text-slate-400">
                In hac habitasse platea dictumst
              </p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-stretch justify-center">
            <div className="w-full md:w-1/2 mb-8 md:mb-0 md:pr-6">
              <p className="mt-3 mb-8 text-base sm:text-lg text-gray-600 dark:text-slate-400">
                Class aptent taciti sociosqu ad litora torquent per conubia
                nostra, per inceptos himenaeos. Duis nec ipsum orci. Ut
                scelerisque sagittis ante, ac tincidunt sem venenatis ut.
              </p>
              <ul className="space-y-6">
                <li className="flex flex-col sm:flex-row items-start sm:items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-blue-900 text-gray-50 mb-4 sm:mb-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6"
                    >
                      <path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"></path>
                      <path d="M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0z"></path>
                    </svg>
                  </div>
                  <div className="sm:ml-4">
                    <h3 className="mb-2 text-lg font-medium leading-6 text-gray-900 dark:text-white">
                      Our Address
                    </h3>
                    <p className="text-gray-600 dark:text-slate-400">
                      Poti, 32 Javakhishvili St., Terminal-Gezi, R. 109
                    </p>
                  </div>
                </li>
                <li className="flex flex-col sm:flex-row items-start sm:items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-blue-900 text-gray-50 mb-4 sm:mb-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6"
                    >
                      <path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2"></path>
                      <path d="M15 7a2 2 0 0 1 2 2"></path>
                      <path d="M15 3a6 6 0 0 1 6 6"></path>
                    </svg>
                  </div>
                  <div className="sm:ml-4">
                    <h3 className="mb-2 text-lg font-medium leading-6 text-gray-900 dark:text-white">
                      Contact
                    </h3>
                    <p className="text-gray-600 dark:text-slate-400">
                      WhatsApp:{" "}
                      <a
                        href="https://wa.me/995555550553?text=I'm%20interested%20in%20your%20car%20for%20sale"
                      >
                      +995 555 550 553
                      </a>
                    </p>
                    <p className="text-gray-600 dark:text-slate-400">
                      Mail:{" "}
                      <a href="mailto:giant.autoimporti@gmail.com">
                        giant.autoimporti@gmail.com
                      </a>
                    </p>
                  </div>
                </li>
                <li className="flex flex-col sm:flex-row items-start sm:items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-blue-900 text-gray-50 mb-4 sm:mb-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6"
                    >
                      <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"></path>
                      <path d="M12 7v5l3 3"></path>
                    </svg>
                  </div>
                  <div className="sm:ml-4">
                    <h3 className="mb-2 text-lg font-medium leading-6 text-gray-900 dark:text-white">
                      Working hours
                    </h3>
                    <p className="text-gray-600 dark:text-slate-400">
                      Monday - Sunday: 10:00 - 18:00
                    </p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="w-full md:w-1/2">
              <div className="card h-fit max-w-6xl p-5 md:p-12" id="form">
                <h2 className="mb-4 text-xl sm:text-2xl font-bold dark:text-white">
                  Ready to Get Started?
                </h2>
                <form id="contactForm" onSubmit={sendEmail}>
                  <div className="mb-6">
                    <div className="mb-4">
                      <label
                        htmlFor="name"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Your name
                      </label>
                      <input
                        type="text"
                        id="name"
                        placeholder="Your name"
                        className="w-full rounded-md border border-gray-400 py-2 px-4 shadow-md dark:text-gray-300"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label
                        htmlFor="email"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Your email
                      </label>
                      <input
                        type="email"
                        id="email"
                        placeholder="Your email address"
                        className="w-full rounded-md border border-gray-400 py-2 px-4 shadow-md dark:text-gray-300"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label
                        htmlFor="message"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Your message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={5}
                        placeholder="Write your message..."
                        className="w-full rounded-md border border-gray-400 py-2 px-4 shadow-md dark:text-gray-300"
                        value={formData.message}
                        onChange={handleChange}
                        required
                      ></textarea>
                    </div>
                  </div>
                  <div className="text-center">
                    <Button type="submit" className="w-full sm:w-auto light:bg-blue-900" disabled={isLoading}>
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Send Message'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
  );
}