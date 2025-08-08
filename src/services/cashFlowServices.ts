import pool from "@/db";
import { keysToCamel, getCurrentYMD } from "@/utils/tools";
import { StringifyOptions } from "querystring";



export interface ICashFlowList {
  cashflowId: string;
  userId: string;
  currency: string;
  startingAmount: number;
  presentAmount: number;
  minimumValueAllowed: number;
  alertValue: number;
  openAlert: boolean;
  createDate: string;
  note: string;
}



export async function searchingCashFlowList(currencyId: string, userId: string) {
  try {
    const searchingResult =
      await pool.query(`SELECT cashflow_list.*, currency_list.currency_name FROM cashflow_list
        LEFT JOIN currency_list ON cashflow_list.currency = currency_list.currency_code
        WHERE currency LIKE '%${currencyId}%' AND user_id = '${userId}' ORDER BY created_date`);
    // console.log("searchingResult:", searchingResult.rows);
    return { success: true, data: keysToCamel(searchingResult.rows) };
  } catch (err) {
    return { success: false, data: [] };
  }
}



export async function insertCashflowData(data: ICashFlowList) {

  const insertResult =
    await pool.query(`INSERT INTO cashflow_list(cashflow_id, user_id, currency, starting_amount, present_amount, minimum_value_allowed, alert_value, open_alert, created_date, note) VALUES ('${data.cashflowId}', '${data.userId}', '${data.currency}', ${data.startingAmount}, ${data.presentAmount}, ${data.minimumValueAllowed}, ${data.alertValue}, ${data.openAlert}, '${getCurrentYMD()}', '${data.note}')`);
  // console.log("insertResult:", insertResult);
  if (insertResult.rowCount === 1) {
    return { success: true, userData: keysToCamel(insertResult.rows[0]) };
  } else {
    return { success: false, userData: [] };
  }
};



export async function cashflowDataUpdate(data: ICashFlowList) {
  // console.log("data:", data);
  const updateResult =
    await pool.query(`UPDATE public.cashflow_list SET minimum_value_allowed = ${data.minimumValueAllowed}, alert_value = ${data.alertValue}, open_alert = ${data.openAlert}, note = '${data.note}' WHERE cashflow_id = '${data.cashflowId}' and user_id = '${data.userId}';`);
  // console.log("updateResult:", updateResult);
  if (updateResult.rowCount === 1) {
    return true;
  } else {
    return false;
  }
};



export async function removeCashflowData(data: ICashFlowList) {

  const searchingResult =
    await pool.query(`SELECT * FROM cashflow_trade where cashflow_id = '${data.cashflowId}' and user_id = '${data.userId}';`);
  // console.log("searchingResult:", searchingResult);
  if (searchingResult.rows.length > 0) {
    return { success: false, message: "現金流已被使用，無法刪除" };
  } else {
    const deleteResult =
      await pool.query(`DELETE FROM public.cashflow_list WHERE cashflow_id = '${data.cashflowId}' and user_id = '${data.userId}';`);
    // console.log("deleteResult:", deleteResult);
    if (deleteResult.rowCount === 1) {
      return { success: true, message: "刪除成功" };
    } else {
      return { success: false, message: "刪除失敗" };
    }
  }  
};
