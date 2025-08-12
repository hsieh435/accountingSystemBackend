import pool from "@/db";
import { keysToCamel, getCurrentTimestamp, getCurrentYMD } from "@/utils/tools";



export interface ICashCardData {
  cashcardId: string;
  userId: string;
  cashcardName: string;
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


export async function searchingCashCardList(data: { currencyId: string; userId: string }) {
  // console.log("data:", data);

  try {
    const searchingResult =
      await pool.query(`SELECT cashcard_list.*, currency_list.currency_name FROM cashcard_list
        LEFT JOIN currency_list ON cashcard_list.currency = currency_list.currency_code
        WHERE currency LIKE '%${data.currencyId}%' AND user_id = '${data.userId}' ORDER BY created_date`);
    // console.log("searchingResult:", searchingResult);
    return { success: true, data: keysToCamel(searchingResult.rows) };
  } catch (err) {
    return { success: false, data: [] };
  }
}



export async function insertCashCardData(data: ICashCardData) {

  const insertResult =
    await pool.query(`INSERT INTO public.cashcard_list(cashcard_id, user_id, cashcard_name, currency, starting_amount, present_amount, minimum_value_allowed, maximum_value_allowed, alert_value, open_alert, created_date, note)	VALUES (${getCurrentTimestamp() + ''}, '${data.userId}', '${data.cashcardName}', '${data.currency}', ${data.startingAmount}, ${data.presentAmount}, ${data.minimumValueAllowed}, ${data.maximumValueAllowed}, ${data.alertValue}, ${data.openAlert}, '${getCurrentYMD()}', '${data.note}')`);
  // console.log("insertResult:", insertResult);
  if (insertResult.rowCount === 1) {
    return { success: true, userData: keysToCamel(insertResult.rows[0]) };
  } else {
    return { success: false, userData: [] };
  }
};



export async function uodateCashCardData(data: ICashCardData) {
  // console.log("data:", data);
  const updateResult =
    await pool.query(`UPDATE public.cashcard_list SET cashcard_name = '${data.cashcardName}', minimum_value_allowed = ${data.minimumValueAllowed}, maximum_value_allowed = ${data.maximumValueAllowed}, alert_value = ${data.alertValue}, open_alert = ${data.openAlert}, note = '${data.note}' WHERE cashcard_id = '${data.cashcardId}' and user_id = '${data.userId}';`);
  // console.log("updateResult:", updateResult);
  if (updateResult.rowCount === 1) {
    return true;
  } else {
    return false;
  }
};



export async function removeCashCardData(data: ICashCardData) {

  const searchingResult =
    await pool.query(`SELECT * FROM cashcard_trade where cashcard_id = '${data.cashcardId}' and user_id = '${data.userId}';`);
  // console.log("searchingResult:", searchingResult);
  if (searchingResult.rows.length > 0) {
    return { success: false, message: "已有收支紀錄，無法刪除" };
  } else {
    const deleteResult =
      await pool.query(`DELETE FROM public.cashcard_list WHERE cashcard_id = '${data.cashcardId}' and user_id = '${data.userId}';`);
    // console.log("deleteResult:", deleteResult);
    if (deleteResult.rowCount === 1) {
      return { success: true, message: "刪除成功" };
    } else {
      return { success: false, message: "刪除失敗" };
    }
  }
};
