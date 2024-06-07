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

export default async function Footer() {
  return (
    <div className="mt-8 bg-muted pt-9">
      <div className="mx-auto w-full max-w-[1166px] px-4 xl:px-0">
        <div className="flex flex-col justify-between sm:px-[18px] md:flex-row md:px-10">
          <div className="md:w-[316px]">
            <h1 className="md:flex md:items-center md:gap-4 dark:text-white text-black font-extrabold">
              <Image
                src={CompanyLogo}
                alt="Company Logo"
                className="w-24 h-24"
              />
              Giant Auto Import
            </h1>
            <p className="mt-[18px] text-[15px] font-normal dark:text-white/[80%]">
              Website where you can find all the information about cars and
              their history.
            </p>
            <div className="mt-[18px] flex gap-4">
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
          </div>
          <div className="md:w-[316px]">
            <div className="mt-[23px] flex">
              <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[75%]">
                <Image
                  alt="phone icon"
                  width="36"
                  height="36"
                  className="dark:filter dark:invert"
                  src={PhoneIcon}
                />
              </div>
              <div className="ml-[18px]">
                <a
                  href="tel:+911800123444"
                  className="font-Inter text-[14px] font-medium dark:text-white"
                >
                  +995 551443314{" "}
                </a>
                <p className="font-Inter text-[12px] font-medium dark:text-white">
                  Company Number
                </p>
              </div>
            </div>
            <div className="mt-[23px] flex">
              <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[75%]">
                <Image
                  alt="mail icon"
                  width="36"
                  height="36"
                  className="dark:filter dark:invert"
                  src={MailIcon}
                />
              </div>
              <div className="ml-[18px]">
                <a
                  href="mailto:help@lorem.com"
                  className="font-Inter text-[14px] font-medium dark:text-[#fff]"
                >
                  giantautoimport@gmail.com
                </a>
                <p className="font-Inter text-[12px] font-medium dark:text-[#fff]">
                  Company Email
                </p>
              </div>
            </div>
            <div className="mt-[23px] flex">
              <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[75%]">
                <Image
                  alt="address icon"
                  width="36"
                  height="36"
                  className="dark:filter dark:invert"
                  src={AddressIcon}
                />
              </div>
              <div className="ml-[18px]">
                <a
                  href="mailto:help@lorem.com"
                  className="font-Inter text-[14px] font-medium dark:text-[#fff]"
                >
                  Poti, Georgia, 10001, Georgia
                </a>
                <p className="font-Inter text-[12px] font-medium dark:text-white">
                  Address
                </p>
              </div>
            </div>
          </div>
          <div className="mt-6 flex w-full flex-col justify-between dark:text-white sm:flex-row md:mt-0 md:max-w-[341px]">
            <div className="">
              <p className="text-deutziawhite font-inter text-[18px] font-medium leading-normal">
                Pages
              </p>
              <ul>
                <li className="mt-[15px]">
                  <a
                    className="text-deutziawhite hover:text-deutziawhite/80 font-inter text-[15px] font-normal hover:font-semibold"
                    href="/"
                  >
                    Home
                  </a>
                </li>
                <li className="mt-[15px]">
                  <a
                    className="text-deutziawhite hover:text-deutziawhite/80 font-inter text-[15px] font-normal hover:font-semibold"
                    href="/contact"
                  >
                    Contact Us
                  </a>
                </li>
                <li className="mt-[15px]">
                  <a
                    className="text-deutziawhite hover:text-deutziawhite/80 font-inter text-[15px] font-normal hover:font-semibold"
                    href="/about"
                  >
                    About Us
                  </a>
                </li>
                <li className="mt-[15px]">
                  <a
                    className="text-deutziawhite hover:text-deutziawhite/80 font-inter text-[15px] font-normal hover:font-semibold"
                    href="/terms"
                  >
                    Terms and conditions
                  </a>
                </li>
                <li className="mt-[15px]">
                  <a
                    className="text-deutziawhite hover:text-deutziawhite/80 font-inter text-[15px] font-normal hover:font-semibold"
                    href="/privacy"
                  >
                    Privcay policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <hr className="mt-[30px] text-white dark:bg-white bg-black h-1" />
        <div className="flex items-center justify-center pb-8 pt-[9px] md:py-8">
          <p className="text-[12px] font-normal dark:text-white md:text-[14px]">
            © Copyright 2024. Giant Auto Import
          </p>
        </div>
      </div>
    </div>
  );
}
