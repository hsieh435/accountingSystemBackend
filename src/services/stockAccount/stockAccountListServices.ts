import { getCurrentYear, getCurrentMonth, getTimeStampWithZone } from "@/utils/tools";
import { executeSQLsyntax } from "@/services/servicesTools";
import { searchingStockAccountRecordList } from "@/services/stockAccount/stockAccountRecordServices";

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

  return executeSQLsyntax({
    query: `
      SELECT stock_account_list.*,
        (
        SELECT to_jsonb(currency_list.*) FROM currency_list
        WHERE currency_list.currency_code = stock_account_list.currency
        ) AS currency_data,

        (
        SELECT COUNT(*)::INTEGER FROM stock_account_trade
        WHERE stock_account_trade.account_id = stock_account_list.account_id
        ) AS frequency,

        COALESCE(trade_totals.expense_sum, 0) AS expense_expenditure_current_month,
        COALESCE(trade_totals.income_sum, 0) AS income_expenditure_current_month,
        COALESCE(trade_totals.income_sum - trade_totals.expense_sum, 0) AS profit_Loss_expenditure_current_month
      FROM stock_account_list

      LEFT JOIN (
        SELECT account_id,
          SUM(CASE WHEN transaction_type = 'expense' THEN trade_total_price ELSE 0 END) AS expense_sum,
          SUM(CASE WHEN transaction_type = 'income' THEN trade_total_price ELSE 0 END) AS income_sum
        FROM stock_account_trade
      WHERE EXTRACT(YEAR FROM trade_datetime) = '${getCurrentYear()}'
        AND EXTRACT(MONTH FROM trade_datetime) = '${getCurrentMonth()}'
        GROUP BY account_id
      ) trade_totals ON stock_account_list.account_id = trade_totals.account_id

      WHERE currency LIKE '%${data.currencyId}%' AND user_id = '${data.userId}'
      ORDER BY created_date`,
    successMessage: "查詢成功",
    errorMessage: "查詢失敗"
  });
}

export async function getStockAccountById(data: { accountId: string; userId: string }) {

  return executeSQLsyntax({
    query: `
      SELECT stock_account_list.*,
        COALESCE(trade_totals.expense_sum, 0) AS expense_expenditure_current_month,
        COALESCE(trade_totals.income_sum, 0) AS income_expenditure_current_month,
        COALESCE(trade_totals.income_sum - trade_totals.expense_sum, 0) AS profit_Loss_expenditure_current_month
      FROM stock_account_list

      LEFT JOIN (
        SELECT account_id,
          SUM(CASE WHEN transaction_type = 'expense' THEN trade_total_price ELSE 0 END) AS expense_sum,
          SUM(CASE WHEN transaction_type = 'income' THEN trade_total_price ELSE 0 END) AS income_sum
        FROM stock_account_trade
        WHERE EXTRACT(YEAR FROM trade_datetime) = '${getCurrentYear()}'
          AND EXTRACT(MONTH FROM trade_datetime) = '${getCurrentMonth()}'
        GROUP BY account_id
      ) trade_totals ON stock_account_list.account_id = trade_totals.account_id

      WHERE stock_account_list.account_id = '${data.accountId}' AND user_id = '${data.userId}'`,
    isReturnArray: false,
    successMessage: "查詢成功",
    errorMessage: "查詢失敗"
  });
}

export async function insertStockAccountData(data: IStockAccountList) {
  const timeStampWithZone = getTimeStampWithZone();

  return executeSQLsyntax({
    query: `
      INSERT INTO public.stock_account_list(account_id, user_id, account_type, account_name, account_bank_code, account_bank_name, currency, starting_amount, present_amount, minimum_value_allowed, alert_value, open_alert, enable, created_date, note)
      VALUES ('${data.accountId}', '${data.userId}', '${data.accountType}', '${data.accountName}', '${data.accountBankCode}', '${data.accountBankName}', '${data.currency}', ${data.startingAmount}, ${data.startingAmount}, ${data.minimumValueAllowed}, ${data.alertValue}, ${data.openAlert}, ${data.enable}, '${timeStampWithZone}', '${data.note}')`,
    isReturnArray: false,
    successMessage: "新增成功",
    errorMessage: "新增失敗"
  });
}

export async function updateStockAccountData(data: IStockAccountList) {

  return executeSQLsyntax({
    query: `
      UPDATE public.stock_account_list SET account_name = '${data.accountName}', account_bank_code = '${data.accountBankCode}', account_bank_name = '${data.accountBankName}', currency = '${data.currency}', starting_amount = ${data.startingAmount}, present_amount = ${data.presentAmount}, minimum_value_allowed = ${data.minimumValueAllowed}, alert_value = ${data.alertValue}, open_alert = ${data.openAlert}, enable = ${data.enable}, created_date = '${data.createdDate}', note = '${data.note}'
      WHERE account_id = '${data.accountId}' AND user_id = '${data.userId}'`,
    isReturnArray: false,
    successMessage: "更新成功",
    errorMessage: "更新失敗" });
}

export async function enableStockAccountStatus(data: IStockAccountList) {

  return executeSQLsyntax({
    query: `
      UPDATE public.stock_account_list SET enable = ${true}
      WHERE account_id = '${data.accountId}' AND user_id = '${data.userId}'`,
    isReturnArray: false,
    successMessage: "更新成功",
    errorMessage: "更新失敗"
  });
}

export async function disableStockAccountStatus(data: IStockAccountList) {

  return executeSQLsyntax({
    query: `
      UPDATE public.stock_account_list SET enable = ${false}
      WHERE account_id = '${data.accountId}' AND user_id = '${data.userId}'`,
    isReturnArray: false,
    successMessage: "更新成功",
    errorMessage: "更新失敗"
  });
}

export async function removeStockAccountData(data: IStockAccountList) {
  const accountData = await getStockAccountById(data);
  const recordData = await searchingStockAccountRecordList({
    userId: data.userId,
    currencyId: accountData.data.currency,
    accountId: data.accountId,
    tradeCategory: "",
    startingDate: "1900-01-01 00:00:00",
    endDate: "9999-12-31 23:59:59",
  });

  if (recordData.success && recordData.data.length > 0) {
    return { success: true, message: "已有收支紀錄", returnCode: -1 };
  } else if (recordData.success && recordData.data.length === 0) {
    return executeSQLsyntax({
      query: `DELETE FROM stock_account_trade WHERE account_id = '${data.accountId}' AND user_id = '${data.userId}'`,
      successMessage: "移除成功",
      errorMessage: "移除失敗"
    });

  } else {
    return { success: false, message: "刪除失敗" };
  }
}
