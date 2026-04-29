"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function LanguageSwitcher({ currentLocale }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function switchTo(locale) {
    await fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale }),
    });
    startTransition(() => router.refresh());
  }

  return (
    <div className="btn-group btn-group-sm" role="group" aria-label="Language">
      <button
        type="button"
        className={`btn ${currentLocale === "hu" ? "btn-light" : "btn-outline-light"}`}
        onClick={() => switchTo("hu")}
        disabled={isPending || currentLocale === "hu"}
      >
        HU
      </button>
      <button
        type="button"
        className={`btn ${currentLocale === "en" ? "btn-light" : "btn-outline-light"}`}
        onClick={() => switchTo("en")}
        disabled={isPending || currentLocale === "en"}
      >
        EN
      </button>
    </div>
  );
}
