import { executeSQLsyntax } from "@/services/servicesTools";
import { getTimeStampWithZone } from "@/utils/tools";

export interface IStockAccountList {
  accountId: string;
  userId: string;
  accountType: string;
  accountName: string;
  accountBankCode: string;
  accountBankName: string;
  currency: string;
  currencyName?: string;
  startingAmount: number;
  presentAmount: number;
  minimumValueAllowed: number;
  alertValue: number;
  openAlert: boolean;
  enable: boolean;
  createdDate: string;
  note: string;
}

export async function searchingStockAccountList(data: { currencyId: string; userId: string }) {
  const query = `
    SELECT stock_account_list.*, currency_list.currency_name FROM stock_account_list
    LEFT JOIN currency_list ON stock_account_list.currency = currency_list.currency_code
    WHERE currency LIKE '%${data.currencyId}%' AND user_id = '${data.userId}' ORDER BY created_date`;

  return executeSQLsyntax({ query: query, successMessage: "查詢成功", errorMessage: "查詢失敗" });
}

export async function getStockAccountById(data: { accountId: string; userId: string }) {
  const query = `
    SELECT * FROM public.stock_account_list
    WHERE account_id = '${data.accountId}' AND user_id='${data.userId}'`;

  return executeSQLsyntax({ query: query, successMessage: "查詢成功", errorMessage: "查詢失敗" });
}

export async function insertStockAccountData(data: IStockAccountList) {
  const timeStampWithZone = getTimeStampWithZone();
  const query = `
    INSERT INTO public.stock_account_list(account_id, user_id, account_type, account_name, account_bank_code, account_bank_name, currency, starting_amount, present_amount, minimum_value_allowed, alert_value, open_alert, enable, created_date, note)
    VALUES ('${data.accountId}', '${data.userId}', '${data.accountType}', '${data.accountName}', '${data.accountBankCode}', '${data.accountBankName}', '${data.currency}', ${data.startingAmount}, ${data.startingAmount}, ${data.minimumValueAllowed}, ${data.alertValue}, ${data.openAlert}, ${data.enable}, '${timeStampWithZone}', '${data.note}')`;

  return executeSQLsyntax({ query: query, successMessage: "新增成功", errorMessage: "新增失敗" });
}

export async function updateStockAccountData(data: IStockAccountList) {
  const query = `
    UPDATE public.stock_account_list SET account_name='${data.accountName}', account_bank_code='${data.accountBankCode}', account_bank_name='${data.accountBankName}', currency='${data.currency}', starting_amount=${data.startingAmount}, present_amount=${data.presentAmount}, minimum_value_allowed=${data.minimumValueAllowed}, alert_value=${data.alertValue}, open_alert=${data.openAlert}, enable=${data.enable}, created_date='${data.createdDate}', note='${data.note}'
    WHERE account_id = '${data.accountId}' AND user_id = '${data.userId}'`;

  return executeSQLsyntax({ query: query, successMessage: "更新成功", errorMessage: "更新失敗" });
}

export async function enableStockAccountStatus(data: IStockAccountList) {
  const query = `
    UPDATE public.stock_account_list SET enable = ${true}
    WHERE account_id = '${data.accountId}' AND user_id = '${data.userId}'`;

  return executeSQLsyntax({ query: query, successMessage: "更新成功", errorMessage: "更新失敗" });
}

export async function disableStockAccountStatus(data: IStockAccountList) {
  const query = `
    UPDATE public.stock_account_list SET enable = ${false}
    WHERE account_id = '${data.accountId}' AND user_id = '${data.userId}'`;

  return executeSQLsyntax({ query: query, successMessage: "更新成功", errorMessage: "更新失敗" });
}

export async function removeStockAccountData(data: IStockAccountList) {

  return executeSQLsyntax({
    query: `SELECT * FROM stock_account_trade WHERE account_id = '${data.accountId}' AND user_id = '${data.userId}'`,
    successMessage: "移除成功",
    errorMessage: "移除失敗"
  });
}
