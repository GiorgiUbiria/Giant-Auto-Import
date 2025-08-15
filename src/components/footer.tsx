import Image from "next/image";
import CompanyLogo from "../../public/giant_logo_dark.png";
import Link from "next/link";
import FacebookIcon from "../../public/icons8-facebook.svg";
import InstagramIcon from "../../public/icons8-instagram.svg";
import TelegramIcon from "../../public/icons8-telegram.svg";
import WhatsAppIcon from "../../public/icons8-whatsapp.svg";
import PhoneIcon from "../../public/icons8-phone.svg";
import MailIcon from "../../public/icons8-mail.svg";
import AddressIcon from "../../public/icons8-address-50.png";
import { ModeToggle } from "./theme-toggle";
import { getTranslations } from "next-intl/server";

export default async function Footer() {
  const t = await getTranslations("Footer");

  return (
    <footer className="bg-white dark:bg-gray-900 shadow-lg shadow-md shadow-black/30 border-t border-gray-200 dark:border-gray-800">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 xl:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          {/* Company Info Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Image
                src={CompanyLogo}
                alt="Company Logo"
                className="h-16 w-16 dark:invert"
              />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t("companyName")}
              </h2>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <div className="flex gap-4">
                {[
                  { icon: FacebookIcon, alt: "Facebook" },
                  { icon: InstagramIcon, alt: "Instagram" },
                  { icon: WhatsAppIcon, alt: "WhatsApp" },
                  { icon: TelegramIcon, alt: "Telegram" },
                ].map((social) => (
                  <Link
                    key={social.alt}
                    href="/"
                    className="transition-transform hover:scale-110"
                  >
                    <Image
                      src={social.icon}
                      alt={social.alt}
                      width={32}
                      height={32}
                      className="dark:invert hover:opacity-80 transition-opacity"
                    />
                  </Link>
                ))}
              </div>
              <ModeToggle />
            </div>
          </div>

          {/* Contact Info Section */}
          <div className="space-y-6">
            {[
              {
                icon: PhoneIcon,
                alt: t('phoneIconAlt'),
                href: "tel:+995555550553",
                text: "+995 555 550 553",
                subtext: t('companyNumber')
              },
              {
                icon: MailIcon,
                alt: t('mailIconAlt'),
                href: "mailto:giant.autoimporti@gmail.com",
                text: "giant.autoimporti@gmail.com",
                subtext: t('companyEmail')
              },
              {
                icon: AddressIcon,
                alt: t('addressIconAlt'),
                href: "",
                text: t('companyAddress'),
                subtext: t('address')
              }
            ].map((item) => (
              <div key={item.alt} className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                  <Image
                    src={item.icon}
                    alt={item.alt}
                    width={24}
                    height={24}
                    className="dark:invert"
                  />
                </div>
                <div>
                  <a
                    href={item.href}
                    className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {item.text}
                  </a>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    {item.subtext}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Links Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('pages')}
            </h3>
            <nav>
              <ul className="space-y-3">
                {[
                  { href: "/", label: t('home') },
                  { href: "/contact", label: t('contactUs') },
                  { href: "/about", label: t('aboutUs') },
                  { href: "/terms", label: t('termsAndConditions') },
                  { href: "/privacy", label: t('privacyPolicy') },
                ].map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-gray-600 dark:text-gray-400 transition-colors 
                        hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <hr className="my-8 border-gray-200 dark:border-gray-800" />

        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}