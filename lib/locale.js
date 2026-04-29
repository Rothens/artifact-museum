import { cookies } from "next/headers";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, LOCALE_COOKIE } from "./i18n.js";

export async function getLocale() {
  const store = await cookies();
  const val = store.get(LOCALE_COOKIE)?.value;
  return SUPPORTED_LOCALES.includes(val) ? val : DEFAULT_LOCALE;
}
