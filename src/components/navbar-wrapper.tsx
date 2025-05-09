import { getAuth } from "@/lib/auth";
import { getTranslations } from "next-intl/server";
import Navbar from "./navbar";

export default async function NavbarWrapper() {
  const { user } = await getAuth();
  const t = await getTranslations("Navbar");
  const tHowTo = await getTranslations("HowTo");

  const translations = {
    navbar: {
      home: t("home"),
      contact: t("contact"),
      about: t("about"),
      calculator: t("calculator"),
      admin_panel: t("admin_panel"),
      cars: t("cars"),
      add_car: t("add_car"),
      users: t("users"),
      register: t("register"),
      dashboard: t("dashboard"),
    },
    howTo: {
      navbar: tHowTo("navbar"),
    },
  };

  return <Navbar user={user} translations={translations} />;
} 