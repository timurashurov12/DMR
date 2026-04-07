import { toast } from "sonner";
import type { BulkTranslateResult } from "./api";

/** Результат массового перевода с бэкенда — один toast с итогом. */
export function toastBulkTranslateResult(data: BulkTranslateResult, n: number) {
  if (data.errors.length === 0) {
    if (data.totalNewLocales === 0) {
      toast.info(
        "Новых переводов не добавлено: для выбранных записей эти языки уже есть или нечего переводить.",
        { duration: 8000 },
      );
    } else {
      toast.success(
        `Готово: добавлено ${data.totalNewLocales} переводов по ${n} записям.`,
        { duration: 8000 },
      );
    }
    return;
  }
  const ok = n - data.errors.length;
  const errText = data.errors.map((e) => e.message).join(" ");
  toast.warning(
    `Частично: без ошибок ${ok} из ${n} записей. Добавлено новых переводов: ${data.totalNewLocales}.`,
    { description: errText, duration: 12000 },
  );
}
