import pool from "@/db";
import { keysToCamel, getCurrentTimestamp, getCurrentYMD } from "@/utils/tools";



export interface ICashFlowData {
  cashflowId: string;
  userId: string;
  accountType: string;
  cashflowName: string;
  currency: string;
  startingAmount: number;
  presentAmount: number;
  minimumValueAllowed: number;
  alertValue: number;
  openAlert: boolean;
  createDate: string;
  note: string;
}


export interface IAccountSearchingParams {
  currencyId: string;
  userId: string;
}



export async function searchingCashFlowList(data: IAccountSearchingParams) {
  try {
    const searchingResult =
      await pool.query(`SELECT cashflow_list.*, currency_list.currency_name FROM cashflow_list
        LEFT JOIN currency_list ON cashflow_list.currency = currency_list.currency_code
        WHERE currency LIKE '%${data.currencyId}%' AND user_id = '${data.userId}' ORDER BY created_date`);
    // console.log("searchingResult:", searchingResult.rows);
    return { success: true, data: keysToCamel(searchingResult.rows) };
  } catch (err) {
    return { success: false, data: [] };
  }
}



export async function insertCashflowData(data: ICashFlowData) {

  const insertResult =
    await pool.query(`INSERT INTO public.cashflow_list(cashflow_id, user_id, account_type, cashflow_name, currency, starting_amount, present_amount, minimum_value_allowed, alert_value, open_alert, created_date, note) VALUES ('${getCurrentTimestamp()}', '${data.userId}', '${data.accountType}', '${data.cashflowName}', '${data.currency}', ${data.startingAmount}, ${data.startingAmount}, ${data.minimumValueAllowed}, ${data.alertValue}, ${data.openAlert}, '${getCurrentYMD()}', '${data.note}')`);
  // console.log("insertResult:", insertResult);
  if (insertResult.rowCount === 1) {
    return { success: true, userData: keysToCamel(insertResult.rows[0]) };
  } else {
    return { success: false, userData: [] };
  }
};



export async function updateCashflowData(data: ICashFlowData) {
  // console.log("data:", data);
  const updateResult =
    await pool.query(`UPDATE public.cashflow_list SET cashflow_name='${data.cashflowName}', minimum_value_allowed=${data.minimumValueAllowed}, alert_value=${data.alertValue}, open_alert=${data.openAlert}, note='${data.note}' WHERE cashflow_id = '${data.cashflowId}' AND user_id = '${data.userId}'`);
  // console.log("updateResult:", updateResult);
  if (updateResult.rowCount === 1) {
    return true;
  } else {
    return false;
  }
};




export async function enableCashFlowStatus(data: ICashFlowData) {
  // console.log("data:", data);

  const updateResult =
    await pool.query(`UPDATE public.cashflow_list SET enable = ${true} WHERE cashflow_id = '${data.cashflowId}' AND user_id = '${data.userId}'`);
  // console.log("updateResult:", updateResult);
  if (updateResult.rowCount === 1) {
    return true;
  } else {
    return false;
  }
}

export async function disableCashFlowStatus(data: ICashFlowData) {

  const updateResult =
    await pool.query(`UPDATE public.cashflow_list SET enable = ${false} WHERE cashflow_id = '${data.cashflowId}' AND user_id = '${data.userId}'`);
  // console.log("updateResult:", updateResult);
  if (updateResult.rowCount === 1) {
    return true;
  } else {
    return false;
  }
}



export async function removeCashflowData(data: ICashFlowData) {
    const deleteResult = await pool.query(
      `DELETE FROM public.cashflow_list WHERE cashflow_id = '${data.cashflowId}' AND user_id = '${data.userId}';`,
    );
  // console.log("deleteResult:", deleteResult);
  if (deleteResult.rowCount === 1) {
    await pool.query(
      `DELETE FROM public.cashflow_trade WHERE cashflow_id = '${data.cashflowId}' AND user_id = '${data.userId}';`,
    );
    return { success: true, message: "刪除成功" };
  } else {
    return { success: false, message: "刪除失敗" };
  }
}
