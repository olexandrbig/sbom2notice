"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

const KEY = "consent:v1";

export default function ConsentBanner() {
  const [show, setShow] = useState(false);
  const { t } = useTranslation("common");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      setShow(!saved);
    } catch { setShow(false); }
  }, []);

  if (!show) return null;

  const set = (analytics: boolean) => {
    localStorage.setItem(KEY, JSON.stringify({ analytics, ts: Date.now() }));
    setShow(false);
  };

  return (
    <div className="fixed bottom-4 inset-x-0 mx-auto max-w-2xl z-50">
      <Card className="shadow-lg">
        <CardContent className="p-4 flex items-center justify-between gap-3">
          <p className="text-sm">
            {t("components.consentBanner.message")}
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => set(false)}>
              {t("components.consentBanner.reject")}
            </Button>
            <Button onClick={() => set(true)}>
              {t("components.consentBanner.allow")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
