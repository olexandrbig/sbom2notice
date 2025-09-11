"use client";

import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
  NavigationMenuContent
} from "@/components/ui/navigation-menu";
import Link from "next/link";
import Image from "next/image";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import logo from "@/public/logo.png";

export default function Navigation() {
  const { t, i18n } = useTranslation("common");
  const current = (i18n.language || "en").toLowerCase();

  const setLang = (lng: "en" | "de") => {
    if (lng === current) return;
    i18n.changeLanguage(lng);
    document.documentElement.setAttribute("lang", lng);
  };

  return (

    <header className="w-full">
      <div className="container mx-auto flex h-14 items-center justify-between">
        <Link
          href={{ pathname: "/" }}
          aria-label={t("app.name")}
          className="text-sm font-semibold tracking-tight"
        >
          <Image
            src={logo}
            alt={t("branding.logoAlt")}
            width={70}
            height={32}
            priority
            className="inline-block dark:hidden h-8 w-auto mr-1"
          />
          <Image
            src={logo}
            alt={t("branding.logoAlt")}
            width={70}
            height={32}
            priority
            className="hidden dark:inline-block h-8 w-auto mr-1"
          />
          {t("app.name")}
        </Link>
        <div className="flex items-center gap-4">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink asChild href="/notice">
                  <Link href={{ pathname: "/notice" }}>
                    {t("nav.notice")}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>{t("nav.language")}</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[160px] gap-2 p-2 text-left">
                    <li>
                      <NavigationMenuLink asChild>
                        <button
                          type="button"
                          onClick={() => setLang("en")}
                          className="flex w-full justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                        >
                          <span>{t("lang.enLong")} {current === "en" && <Check className="size-3 inline" aria-hidden />}</span>
                        </button>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <button
                          type="button"
                          onClick={() => setLang("de")}
                          className="flex w-full justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                        >
                          <span>{t("lang.deLong")} {current === "de" && <Check className="size-3 inline" aria-hidden />}</span>
                        </button>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    </header>
  );
}
