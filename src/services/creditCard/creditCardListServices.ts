import pool from "@/db";
import { executeSQLsyntax } from "@/services/servicesTools";
import { getCurrentTimestamp, getTimeStampWithZone } from "@/utils/tools";

export interface ICreditCardData {
  creditcardId: string;
  userId: string;
  accountType: string;
  creditcardName: string;
  creditcardBankCode: string;
  creditcardBankName: string;
  creditcardSchema: string;
  currency: string;
  currencyName?: string;
  creditPerMonth: number;
  expirationDate: string;
  alertValue: number;
  openAlert: boolean;
  enable: boolean;
  createdDate: string;
  note: string;
}



export async function searchingCreditCardList(data: { currencyId: string; userId: string }) {
  const query = `
    SELECT creditcard_list.*, currency_list.currency_name
    FROM creditcard_list
    LEFT JOIN currency_list ON creditcard_list.currency = currency_list.currency_code
    WHERE currency LIKE $1 AND user_id = $2
    ORDER BY created_date
  `;

  return executeSQLsyntax({
    query: query,
    params: [`%${data.currencyId}%`, data.userId],
    successMessage: "查詢成功",
    errorMessage: "查詢失敗",
  });
}

export async function getCreditCardById(creditcardId: string, userId: string) {
  return executeSQLsyntax({
    query: "SELECT * FROM creditcard_list WHERE creditcard_id = $1 AND user_id = $2",
    params: [creditcardId, userId],
    isReturnArray: false,
    successMessage: "查詢成功",
    errorMessage: "查詢失敗",
  });
}

export async function insertCreditCardData(data: ICreditCardData) {
  const currentTimestamp = getCurrentTimestamp();
  const timeStampWithZone = getTimeStampWithZone();
  const creditcardId = `CC-${currentTimestamp}`;

  const insertQuery = `
    INSERT INTO public.creditcard_list(
      creditcard_id, user_id, account_type, creditcard_name, creditcard_bank_code,
      creditcard_bank_name, creditcard_schema, currency, credit_per_month,
      expiration_date, alert_value, open_alert, enable, created_date, note
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
  `;
  const insertParams = [
    creditcardId,
    data.userId,
    data.accountType,
    data.creditcardName,
    data.creditcardBankCode,
    data.creditcardBankName,
    data.creditcardSchema,
    data.currency,
    data.creditPerMonth,
    data.expirationDate,
    data.alertValue,
    data.openAlert,
    data.enable,
    timeStampWithZone,
    data.note,
  ];

  return executeSQLsyntax({
    query: insertQuery,
    params: insertParams,
    isReturnArray: false,
    successMessage: "新增成功",
    errorMessage: "新增失敗",
  });
}

export async function updateCreditCardData(data: ICreditCardData) {
  const query = `
    UPDATE public.creditcard_list
    SET creditcard_name = $1, creditcard_bank_code = $2, creditcard_bank_name = $3, credit_per_month = $4, alert_value = $5, open_alert = $6, note = $7
    WHERE creditcard_id = $8 AND user_id = $9
  `;
  const params = [
    data.creditcardName,
    data.creditcardBankCode,
    data.creditcardBankName,
    data.creditPerMonth,
    data.alertValue,
    data.openAlert,
    data.note,
    data.creditcardId,
    data.userId,
  ];

  return executeSQLsyntax({
    query: query,
    params: params,
    isReturnArray: false,
    successMessage: "更新成功",
    errorMessage: "更新失敗",
  });
}

export async function enableCreditCardStatus(data: ICreditCardData) {
  return executeSQLsyntax({
    query: "UPDATE public.creditcard_list SET enable = $1 WHERE creditcard_id = $2 AND user_id = $3",
    params: [true, data.creditcardId, data.userId],
    isReturnArray: false,
    successMessage: "成功",
    errorMessage: "失敗",
  });
}

export async function disableCreditCardStatus(data: ICreditCardData) {
  return executeSQLsyntax({
    query: "UPDATE public.creditcard_list SET enable = $1 WHERE creditcard_id = $2 AND user_id = $3",
    params: [false, data.creditcardId, data.userId],
    isReturnArray: false,
    successMessage: "成功",
    errorMessage: "失敗",
  });
}

export async function removeCreditCardData(data: ICreditCardData) {
  try {
    const checkQuery = "SELECT * FROM creditcard_trade WHERE credit_card_id = $1 AND user_id = $2";
    const searchingResult = await pool.query(checkQuery, [data.creditcardId, data.userId]);

    if (searchingResult.rows.length > 0) {
      return { success: false, message: "已有收支紀錄，無法刪除" };
    }

    // Delete the credit card
    return executeSQLsyntax({
      query: "DELETE FROM public.creditcard_list WHERE creditcard_id = $1 AND user_id = $2",
      params: [data.creditcardId, data.userId],
      successMessage: "刪除成功",
      errorMessage: "刪除失敗",
    });

  } catch (error) {
    return { success: false, message: "刪除失敗" };
  }
}
