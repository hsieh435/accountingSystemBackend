import pool from "@/db";
import { keysToCamel, getCurrentTimestamp, getTimeStampWithZone } from "@/utils/tools";
import * as accountBalanceServices from "@/services/accountBalanceServices";

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
  // console.log("data:", data);

  try {
    const searchingResult = await pool.query(`SELECT creditcard_list.*, currency_list.currency_name FROM creditcard_list
        LEFT JOIN currency_list ON creditcard_list.currency = currency_list.currency_code
        WHERE currency LIKE '%${data.currencyId}%' AND user_id = '${data.userId}' ORDER BY created_date`);
    // console.log("searchingResult:", searchingResult);
    return { success: true, data: keysToCamel(searchingResult.rows) };
  } catch (err) {
    return { success: false, data: [] };
  }
}

export async function insertCreditCardData(data: ICreditCardData) {
  const currentTimestamp = getCurrentTimestamp();
  const timeStampWithZone = getTimeStampWithZone();

  const insertResult = await pool.query(
    `INSERT INTO public.creditcard_list(creditcard_id, user_id, account_type, creditcard_name, creditcard_bank_code, creditcard_bank_name, creditcard_schema, currency, credit_per_month, expiration_date, alert_value, open_alert, enable, created_date, note)	VALUES  ('CC-${currentTimestamp}', '${data.userId}', '${data.accountType}', '${data.creditcardName}', '${data.creditcardBankCode}', '${data.creditcardBankName}', '${data.creditcardSchema}', '${data.currency}', ${data.creditPerMonth}, '${data.expirationDate}', ${data.alertValue}, ${data.openAlert}, ${data.enable}, '${timeStampWithZone}', '${data.note}')`,
  );
  // console.log("insertResult:", insertResult);
  if (insertResult.rowCount === 1) {
    const insertBalanceResult = await accountBalanceServices.insertBalance({
      tradeId: `CC-${data.currency}-${currentTimestamp}`,
      accountId: `CC-${currentTimestamp}`,
      userId: data.userId,
      transactionType: "expense",
      tradeCode: "default",
      tradeAmount: 0,
      accountBalance: 0,
      eventDatetimes: timeStampWithZone,
    });
    if (insertBalanceResult === true) {
      return { success: true, userData: keysToCamel(insertResult.rows[0]) };
    } else {
      return { success: false, userData: [] };
    }
  } else {
    return { success: false, userData: [] };
  }
}

export async function updateCreditCardData(data: ICreditCardData) {
  // console.log("data:", data);
  const updateResult = await pool.query(
    `UPDATE public.creditcard_list SET creditcard_name = '${data.creditcardName}', creditcard_bank_code = '${data.creditcardBankCode}', creditcard_bank_name = '${data.creditcardBankName}', credit_per_month = ${data.creditPerMonth}, alert_value = ${data.alertValue}, open_alert = ${data.openAlert}, note = '${data.note}' WHERE creditcard_id = '${data.creditcardId}' AND user_id = '${data.userId}'`,
  );
  // console.log("updateResult:", updateResult);
  if (updateResult.rowCount === 1) {
    return true;
  } else {
    return false;
  }
}

export async function enableCreditCardStatus(data: ICreditCardData) {
  // console.log("data:", data);

  const updateResult = await pool.query(
    `UPDATE public.creditcard_list SET enable = ${true} WHERE creditcard_id = '${data.creditcardId}' AND user_id = '${data.userId}'`,
  );
  console.log("updateResult:", updateResult);
  if (updateResult.rowCount === 1) {
    return true;
  } else {
    return false;
  }
}

export async function disableCreditCardStatus(data: ICreditCardData) {
  const updateResult = await pool.query(
    `UPDATE public.creditcard_list SET enable = ${false} WHERE creditcard_id = '${data.creditcardId}' AND user_id = '${data.userId}'`,
  );
  // console.log("updateResult:", updateResult);
  if (updateResult.rowCount === 1) {
    return true;
  } else {
    return false;
  }
}

export async function removeCreditCardData(data: ICreditCardData) {
  const searchingResult = await pool.query(
    `SELECT * FROM creditcard_trade WHERE credit_card_id = '${data.creditcardId}' AND user_id = '${data.userId}'`,
  );
  // console.log("searchingResult:", searchingResult);
  if (searchingResult.rows.length > 0) {
    return { success: false, message: "已有收支紀錄，無法刪除" };
  } else {
    const deleteResult = await pool.query(
      `DELETE FROM public.creditcard_list WHERE creditcard_id = '${data.creditcardId}' AND user_id = '${data.userId}'`,
    );
    // console.log("deleteResult:", deleteResult);
    if (deleteResult.rowCount === 1) {
      return { success: true, message: "刪除成功" };
    } else {
      return { success: false, message: "刪除失敗" };
    }
  }
}
