import { ItemAnswerStatus } from "@prisma/client";

export const SCORE_MAP: Record<ItemAnswerStatus, number | null> = {
  [ItemAnswerStatus.NORMAL]: 100,
  [ItemAnswerStatus.LENGKAP]: 100,
  [ItemAnswerStatus.PERLU_PERBAIKAN]: 50,
  [ItemAnswerStatus.RUSAK]: 0,
  [ItemAnswerStatus.PERLU_GANTI]: 0,
  [ItemAnswerStatus.TIDAK_LENGKAP]: 0,
  [ItemAnswerStatus.BELUM_DIPERIKSA]: null,
  [ItemAnswerStatus.TIDAK_BERLAKU]: null,
};
