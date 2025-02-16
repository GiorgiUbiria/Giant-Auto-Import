import Image from "next/image";
import CompanyLogo from "../../public/logo.png";
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
    <footer className="bg-gradient-to-r from-darkbg to-darkfg py-12">
      <div className="mx-auto w-full max-w-7xl px-4 xl:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          {/* Company Info Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Image
                src={CompanyLogo}
                alt="Company Logo"
                className="h-16 w-16 brightness-0 invert"
              />
              <h2 className="text-xl font-bold text-white">
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
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                  <Image
                    src={item.icon}
                    alt={item.alt}
                    width={24}
                    height={24}
                    className="invert"
                  />
                </div>
                <div>
                  <a
                    href={item.href}
                    className="text-sm font-medium text-white hover:text-white/80"
                  >
                    {item.text}
                  </a>
                  <p className="mt-1 text-xs text-white/80">
                    {item.subtext}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Links Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">
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
                      className="text-sm text-white/80 transition-colors hover:text-white hover:font-medium"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <hr className="my-8 border-white/20" />

        <div className="text-center">
          <p className="text-sm text-white/80">
            {t('copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}