import pool from "@/db";
import { keysToCamel, getCurrentTimestamp, getTimeStampWithZone } from "@/utils/tools";
import * as accountBalanceServices from "@/services/accountBalanceServices";



export interface IStoredValueCardData {
  storedValueCardId: string;
  userId: string;
  accountType: string;
  storedValueCardName: string;
  currency: string;
  startingAmount: number;
  presentAmount: number;
  minimumValueAllowed: number;
  maximumValueAllowed: number;
  alertValue: number;
  openAlert: boolean;
  enable: boolean;
  createdDate: string;
  note: string;
}

export async function searchingStoredValueCardList(data: { currencyId: string; userId: string }) {
  // console.log("data:", data);

  try {
    const searchingResult =
      await pool.query(`SELECT stored_value_card_list.*, currency_list.currency_name FROM stored_value_card_list
        LEFT JOIN currency_list ON stored_value_card_list.currency = currency_list.currency_code
        WHERE currency LIKE '%${data.currencyId}%' AND user_id = '${data.userId}' ORDER BY created_date`);
    // console.log("searchingResult:", searchingResult);
    return { success: true, data: keysToCamel(searchingResult.rows) };
  } catch (err) {
    return { success: false, data: [] };
  }
}

export async function insertStoredValueCardData(data: IStoredValueCardData) {
  const currentTimestamp = getCurrentTimestamp();
  const timeStampWithZone = getTimeStampWithZone();

  const insertResult = await pool.query(
    `INSERT INTO public.stored_value_card_list(stored_value_card_id, user_id, account_type, stored_value_card_name, currency, starting_amount, present_amount, minimum_value_allowed, maximum_value_allowed, alert_value, open_alert, enable, created_date, note)	VALUES ('SVC-${currentTimestamp}', '${data.userId}', '${data.accountType}', '${data.storedValueCardName}', '${data.currency}', ${data.startingAmount}, ${data.startingAmount}, ${data.minimumValueAllowed}, ${data.maximumValueAllowed}, ${data.alertValue}, ${data.openAlert}, ${data.enable}, '${timeStampWithZone}', '${data.note}')`,
  );
  // console.log("insertResult:", insertResult);
  if (insertResult.rowCount === 1) {
    await accountBalanceServices.insertBalance({
      tradeId: `SVC-${data.currency}-${currentTimestamp}`,
      accountId: `SVC-${currentTimestamp}`,
      userId: data.userId,
      transactionType: "income",
      tradeCode: "default",
      tradeAmount: data.startingAmount,
      accountBalance: data.startingAmount,
      eventDatetimes: timeStampWithZone,
    });

    return { success: true, userData: keysToCamel(insertResult.rows[0]) };
  } else {
    return { success: false, userData: [] };
  }
}

export async function updateStoredValueCardData(data: IStoredValueCardData) {
  // console.log("data:", data);
  const updateResult = await pool.query(
    `UPDATE public.stored_value_card_list SET stored_value_card_name = '${data.storedValueCardName}', minimum_value_allowed = ${data.minimumValueAllowed}, maximum_value_allowed = ${data.maximumValueAllowed}, alert_value = ${data.alertValue}, open_alert = ${data.openAlert}, note = '${data.note}' WHERE stored_value_card_id = '${data.storedValueCardId}' AND user_id = '${data.userId}'`,
  );
  // console.log("updateResult:", updateResult);
  if (updateResult.rowCount === 1) {
    return true;
  } else {
    return false;
  }
}

export async function enableStoredValueCardStatus(data: IStoredValueCardData) {
  // console.log("data:", data);

  const updateResult = await pool.query(
    `UPDATE public.stored_value_card_list SET enable = ${true} WHERE stored_value_card_id = '${data.storedValueCardId}' AND user_id = '${data.userId}'`,
  );
  // console.log("updateResult:", updateResult);
  if (updateResult.rowCount === 1) {
    return true;
  } else {
    return false;
  }
}

export async function disableStoredValueCardStatus(data: IStoredValueCardData) {
  const updateResult = await pool.query(
    `UPDATE public.stored_value_card_list SET enable = ${false} WHERE stored_value_card_id = '${data.storedValueCardId}' AND user_id = '${data.userId}'`,
  );
  // console.log("updateResult:", updateResult);
  if (updateResult.rowCount === 1) {
    return true;
  } else {
    return false;
  }
}

export async function removeStoredValueCardData(data: IStoredValueCardData) {
  const deleteResult = await pool.query(
    `DELETE FROM public.stored_value_card_list WHERE stored_value_card_id = '${data.storedValueCardId}' AND user_id = '${data.userId}'`,
  );
  // console.log("deleteResult:", deleteResult);
  if (deleteResult.rowCount === 1) {
    await pool.query(
      `DELETE FROM public.stored_value_card_trade WHERE stored_value_card_id = '${data.storedValueCardId}' AND user_id = '${data.userId}';`,
    );
    return { success: true, message: "刪除成功" };
  } else {
    return { success: false, message: "刪除失敗" };
  }
}
