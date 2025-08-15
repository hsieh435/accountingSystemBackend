import pool from "@/db";
import { keysToCamel, getCurrentTimestamp, getCurrentYMD } from "@/utils/tools";



export interface ICashFlowData {
  cashflowId: string;
  userId: string;
  accountType: string;
  currency: string;
  startingAmount: number;
  presentAmount: number;
  minimumValueAllowed: number;
  alertValue: number;
  openAlert: boolean;
  createDate: string;
  note: string;
}



export async function searchingCashFlowList(data: ICashFlowData) {
  try {
    const searchingResult =
      await pool.query(`SELECT cashflow_list.*, currency_list.currency_name FROM cashflow_list
        LEFT JOIN currency_list ON cashflow_list.currency = currency_list.currency_code
        WHERE currency LIKE '%${data.currency}%' AND user_id = '${data.userId}' ORDER BY created_date`);
    // console.log("searchingResult:", searchingResult.rows);
    return { success: true, data: keysToCamel(searchingResult.rows) };
  } catch (err) {
    return { success: false, data: [] };
  }
}



export async function insertCashflowData(data: ICashFlowData) {

  const insertResult =
    await pool.query(`INSERT INTO public.cashflow_list(cashflow_id, user_id, account_type, currency, starting_amount, present_amount, minimum_value_allowed, alert_value, open_alert, created_date, note) VALUES ('${getCurrentTimestamp()}', '${data.userId}', '${data.accountType}', '${data.currency}', ${data.startingAmount}, ${data.startingAmount}, ${data.minimumValueAllowed}, ${data.alertValue}, ${data.openAlert}, '${getCurrentYMD()}', '${data.note}')`);
  // console.log("insertResult:", insertResult);
  if (insertResult.rowCount === 1) {
    return { success: true, userData: keysToCamel(insertResult.rows[0]) };
  } else {
    return { success: false, userData: [] };
  }
};



export async function uodateCashflowData(data: ICashFlowData) {
  // console.log("data:", data);
  const updateResult =
    await pool.query(`UPDATE public.cashcard_list SET minimum_value_allowed = ${data.minimumValueAllowed}, alert_value = ${data.alertValue}, open_alert = ${data.openAlert}, note = '${data.note}' WHERE cashcard_id = '${data.cashflowId}' and user_id = '${data.userId}';`);
  // console.log("updateResult:", updateResult);
  if (updateResult.rowCount === 1) {
    return true;
  } else {
    return false;
  }
};



export async function removeCashflowData(data: ICashFlowData) {

  const searchingResult =
    await pool.query(`SELECT * FROM cashcard_trade where cashcard_id = '${data.cashflowId}' and user_id = '${data.userId}';`);
  // console.log("searchingResult:", searchingResult);
  if (searchingResult.rows.length > 0) {
    return { success: false, message: "現金流已被使用，無法刪除" };
  } else {
    const deleteResult =
      await pool.query(`DELETE FROM public.cashcard_list WHERE cashcard_id = '${data.cashflowId}' and user_id = '${data.userId}';`);
    // console.log("deleteResult:", deleteResult);
    if (deleteResult.rowCount === 1) {
      return { success: true, message: "刪除成功" };
    } else {
      return { success: false, message: "刪除失敗" };
    }
  }
};
