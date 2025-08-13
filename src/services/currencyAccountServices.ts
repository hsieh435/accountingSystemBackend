import pool from "@/db";
import { keysToCamel, getCurrentTimestamp, getCurrentYMD } from "@/utils/tools";



export interface ICurrencyAccountData {
  accountId: string;
  userId: string;
  accountName: string;
  accountType: string;
  accountBankCode: string;
  accountBankName: string;
  currency: string;
  currencyName?: string;
  startingAmount: number;
  presentAmount: number;
  minimumValueAllowed: number;
  alertValue: number;
  openAlert: boolean;
  isSalaryAccount: boolean;
  enable: boolean;
  createdDate: string;
  note: string;
}



export async function searchingCurrencyAccountList(data: { currencyId: string; userId: string }) {
  // console.log("data:", data);

  try {
    const searchingResult =
      await pool.query(`SELECT currency_account_list.*, currency_list.currency_name FROM currency_account_list
        LEFT JOIN currency_list ON currency_account_list.currency = currency_list.currency_code
        WHERE currency LIKE '%${data.currencyId}%' AND user_id = '${data.userId}' ORDER BY created_date`);
    // console.log("searchingResult:", searchingResult);
    return { success: true, data: keysToCamel(searchingResult.rows) };
  } catch (err) {
    return { success: false, data: [] };
  }
}



export async function insertCurrencyAccountData(data: ICurrencyAccountData) {

  const insertResult =
    await pool.query(`INSERT INTO public.currency_account_list(account_id, user_id, account_name, account_bank_code, account_bank_name, currency, starting_amount, present_amount, minimum_value_allowed, alert_value, open_alert, is_salary_account, enable, created_date, note)	VALUES ('${getCurrentTimestamp()}', '${data.userId}', '${data.accountName}', '${data.accountBankCode}', '${data.accountBankName}', '${data.currency}', ${data.startingAmount}, ${data.startingAmount}, ${data.minimumValueAllowed}, ${data.alertValue}, ${data.openAlert}, ${data.isSalaryAccount}, ${true}, '${getCurrentYMD()}', '${data.note}')`);
  // console.log("insertResult:", insertResult);
  if (insertResult.rowCount === 1) {
    return { success: true, userData: keysToCamel(insertResult.rows[0]) };
  } else {
    return { success: false, userData: [] };
  }
};



export async function updateCurrencyAccountData(data: ICurrencyAccountData) {
  // console.log("data:", data);
  const updateResult =
    await pool.query(`UPDATE public.currency_account_list SET account_name = '${data.accountName}', account_bank_code = '${data.accountBankCode}', account_bank_name = '${data.accountBankName}', currency = '${data.currency}', minimum_value_allowed = ${data.minimumValueAllowed}, alert_value = ${data.alertValue}, open_alert = ${data.openAlert}, is_salary_account = ${data.isSalaryAccount}, note = '${data.note}' WHERE account_id = '${data.accountId}' and user_id = '${data.userId}';`);
  // console.log("updateResult:", updateResult);
  if (updateResult.rowCount === 1) {
    return true;
  } else {
    return false;
  }
};



export async function enableCurrencyAccountStatus(data: ICurrencyAccountData) {
  // console.log("data:", data);

  const updateResult =
    await pool.query(`UPDATE public.currency_account_list SET enable = ${true} WHERE account_id = '${data.accountId}' and user_id = '${data.userId}';`);
  console.log("updateResult:", updateResult);
  if (updateResult.rowCount === 1) {
    return true;
  } else {
    return false;
  }
}

export async function disableCurrencyAccountStatus(data: ICurrencyAccountData) {

  const updateResult =
    await pool.query(`UPDATE public.currency_account_list SET enable = ${false} WHERE account_id = '${data.accountId}' and user_id = '${data.userId}';`);
  // console.log("updateResult:", updateResult);
  if (updateResult.rowCount === 1) {
    return true;
  } else {
    return false;
  }
}



export async function removeCurrencyAccountData(data: ICurrencyAccountData) {

  const searchingResult =
    await pool.query(`SELECT * FROM currency_account_trade where account_id = '${data.accountId}' and user_id = '${data.userId}';`);
  // console.log("searchingResult:", searchingResult);
  if (searchingResult.rows.length > 0) {
    return { success: false, message: "已有收支紀錄，無法刪除" };
  } else {
    const deleteResult =
      await pool.query(`DELETE FROM public.currency_account_list WHERE account_id = '${data.accountId}' and user_id = '${data.userId}';`);
    // console.log("deleteResult:", deleteResult);
    if (deleteResult.rowCount === 1) {
      return { success: true, message: "刪除成功" };
    } else {
      return { success: false, message: "刪除失敗" };
    }
  }
};
