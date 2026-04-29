import { getLocale } from "../../lib/locale.js";
import { getTranslations } from "../../lib/i18n.js";
import ScanClient from "./ScanClient.jsx";

export const dynamic = "force-dynamic";

export default async function ScanPage() {
  const locale = await getLocale();
  const t = getTranslations(locale);
  return <ScanClient strings={{
    title: t("scan.title"),
    scanning: t("scan.scanning"),
    notFound: t("scan.not_found.desc"),
  }} />;
}
