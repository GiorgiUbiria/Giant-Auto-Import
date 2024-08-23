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
    <div className="dark:bg-gratient-to-r dark:from-darkbg dark:to-darkfg bg-gradient-to-r from-darkbg to-darkfg pt-9">
      <div className="mx-auto w-full max-w-[1166px] px-4 xl:px-0">
        <div className="flex flex-col justify-between sm:px-[18px] md:flex-row md:px-10">
          <div className="md:w-[316px]">
            <div className="md:flex md:items-center md:gap-4">
              <Image
                src={CompanyLogo}
                alt="Company Logo"
                className="w-24 h-24 self-start invert brightness-0"
              />
              <h1 className="text-white font-extrabold text-lg">
                {t("companyName")}
              </h1>
            </div>
            <div className="mt-[18px] flex flex-col">
              <div className="flex gap-4">
                <Link className="hover:scale-110" href="/">
                  <Image
                    alt="facebook icon"
                    width="36"
                    height="36"
                    src={FacebookIcon}
                  />
                </Link>
                <Link className="hover:scale-110" href="/">
                  <Image
                    alt="instagram icon"
                    width="36"
                    height="36"
                    src={InstagramIcon}
                  />
                </Link>
                <Link className="hover:scale-110" href="/">
                  <Image
                    alt="whatsapp icon"
                    width="36"
                    height="36"
                    src={WhatsAppIcon}
                  />
                </Link>
                <Link className="hover:scale-110" href="/">
                  <Image
                    alt="telegram icon"
                    width="36"
                    height="36"
                    src={TelegramIcon}
                  />
                </Link>
              </div>
              <div className="self-start mt-4">
                <ModeToggle />
              </div>
            </div>
          </div>
          <div className="md:w-[316px]">
            <div className="mt-[23px] flex">
              <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[75%]">
                <Image
                  alt={t('phoneIconAlt')}
                  width="36"
                  height="36"
                  src={PhoneIcon}
                  className="invert"
                />
              </div>
              <div className="ml-[18px]">
                <a
                  href="tel:+995555550553"
                  className="font-Inter text-[14px] font-medium text-white"
                >
                  +995 555 550 553
                </a>
                <p className="font-Inter text-[12px] font-medium text-white">
                  {t('companyNumber')}
                </p>
              </div>
            </div>
            <div className="mt-[23px] flex">
              <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[75%]">
                <Image
                  alt={t('mailIconAlt')}
                  width="36"
                  height="36"
                  src={MailIcon}
                  className="invert"
                />
              </div>
              <div className="ml-[18px]">
                <a
                  href="mailto:giant.autoimporti@gmail.com"
                  className="font-Inter text-[14px] font-medium text-white"
                >
                  giant.autoimporti@gmail.com
                </a>
                <p className="font-Inter text-[12px] font-medium text-[#fff]">
                  {t('companyEmail')}
                </p>
              </div>
            </div>
            <div className="mt-[23px] flex">
              <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[75%]">
                <Image
                  alt={t('addressIconAlt')}
                  width="36"
                  height="36"
                  src={AddressIcon}
                  className="invert"
                />
              </div>
              <div className="ml-[18px]">
                <a
                  href=""
                  className="font-Inter text-[14px] font-medium text-[#fff]"
                >
                  {t('companyAddress')}
                </a>
                <p className="font-Inter text-[12px] font-medium text-white">
                  {t('address')}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-6 flex w-full flex-col justify-between text-white sm:flex-row md:mt-0 md:max-w-[341px]">
            <div className="">
              <p className="text-deutziawhite font-inter text-[18px] font-medium leading-normal">
                {t('pages')}
              </p>
              <ul>
                <li className="mt-[15px]">
                  <a
                    className="text-deutziawhite hover:text-deutziawhite/80 font-inter text-[15px] font-normal hover:font-semibold"
                    href="/"
                  >
                    {t('home')}
                  </a>
                </li>
                <li className="mt-[15px]">
                  <a
                    className="text-deutziawhite hover:text-deutziawhite/80 font-inter text-[15px] font-normal hover:font-semibold"
                    href="/contact"
                  >
                    {t('contactUs')}
                  </a>
                </li>
                <li className="mt-[15px]">
                  <a
                    className="text-deutziawhite hover:text-deutziawhite/80 font-inter text-[15px] font-normal hover:font-semibold"
                    href="/about"
                  >
                    {t('aboutUs')}
                  </a>
                </li>
                <li className="mt-[15px]">
                  <a
                    className="text-deutziawhite hover:text-deutziawhite/80 font-inter text-[15px] font-normal hover:font-semibold"
                    href="/terms"
                  >
                    {t('termsAndConditions')}
                  </a>
                </li>
                <li className="mt-[15px]">
                  <a
                    className="text-deutziawhite hover:text-deutziawhite/80 font-inter text-[15px] font-normal hover:font-semibold"
                    href="/privacy"
                  >
                    {t('privacyPolicy')}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <hr className="mt-[30px] text-white dark:bg-white bg-black h-1" />
        <div className="flex items-center justify-center pb-8 pt-[9px] md:py-8">
          <p className="text-[12px] font-normal text-white md:text-[14px]">
            {t('copyright')}
          </p>
        </div>
      </div>
    </div>
  );
};