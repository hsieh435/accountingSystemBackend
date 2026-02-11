import { getCurrentYear, getCurrentMonth, getTimeStampWithZone } from "@/utils/tools";
import { executeSQLsyntax } from "@/services/servicesTools";
import { searchingCurrencyAccountRecordList } from "@/services/currencyAccount/currencyAccountRecordServices";

export interface ICurrencyAccountData {
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
  isSalaryAccount: boolean;
  enable: boolean;
  createdDate: string;
  note: string;
}


export async function searchingCurrencyAccountList(data: { currencyId: string; userId: string }) {
  const searchingQuery = `
    SELECT currency_account_list.*,
      (
      SELECT to_jsonb(currency_list.*) FROM currency_list
      WHERE currency_list.currency_code = currency_account_list.currency
      ) AS currency_data,

      COALESCE(trade_totals.expense_sum, 0) AS expense_expenditure_current_month,
      COALESCE(trade_totals.income_sum, 0) AS income_expenditure_current_month,
      COALESCE(trade_totals.income_sum - trade_totals.expense_sum, 0) AS profit_Loss_expenditure_current_month
    FROM currency_account_list

    LEFT JOIN (
      SELECT account_id,
        SUM(CASE WHEN transaction_type = 'expense' THEN trade_amount ELSE 0 END) AS expense_sum,
        SUM(CASE WHEN transaction_type = 'income' THEN trade_amount ELSE 0 END) AS income_sum
      FROM currency_account_trade
      WHERE EXTRACT(YEAR FROM trade_datetime) = '${getCurrentYear()}'
        AND EXTRACT(MONTH FROM trade_datetime) = '${getCurrentMonth()}'
      GROUP BY account_id
    ) trade_totals ON currency_account_list.account_id = trade_totals.account_id

    WHERE currency_account_list.currency LIKE $1 AND currency_account_list.user_id = $2
    ORDER BY currency_account_list.created_date`;

  return executeSQLsyntax({
    query: searchingQuery,
    params: [`%${data.currencyId}%`, data.userId],
    successMessage: "查詢成功",
    errorMessage: "查詢失敗",
  });
}

export async function getCurrencyAccountById(accountId: string, userId: string) {

  return executeSQLsyntax({
    query: `
      SELECT currency_account_list.*,
        COALESCE(trade_totals.expense_sum, 0) AS expense_expenditure_current_month,
        COALESCE(trade_totals.income_sum, 0) AS income_expenditure_current_month,
        COALESCE(trade_totals.income_sum - trade_totals.expense_sum, 0) AS profit_Loss_expenditure_current_month
      FROM currency_account_list

      LEFT JOIN (
        SELECT account_id,
          SUM(CASE WHEN transaction_type = 'expense' THEN trade_amount ELSE 0 END) AS expense_sum,
          SUM(CASE WHEN transaction_type = 'income' THEN trade_amount ELSE 0 END) AS income_sum
        FROM currency_account_trade
        WHERE EXTRACT(YEAR FROM trade_datetime) = '${getCurrentYear()}'
          AND EXTRACT(MONTH FROM trade_datetime) = '${getCurrentMonth()}'
        GROUP BY account_id
      ) trade_totals ON currency_account_list.account_id = trade_totals.account_id

      WHERE currency_account_list.account_id = $1 AND currency_account_list.user_id = $2
    `,
    params: [accountId, userId],
    isReturnArray: false,
    successMessage: "查詢成功",
    errorMessage: "查詢失敗",
  });
}

export async function insertCurrencyAccountData(data: ICurrencyAccountData) {
  const timeStampWithZone = getTimeStampWithZone();

  const insertQuery = `
    INSERT INTO public.currency_account_list(
      account_id, user_id, account_type, account_name, account_bank_code,
      account_bank_name, currency, starting_amount, present_amount,
      minimum_value_allowed, alert_value, is_salary_account, open_alert,
      enable, created_date, note
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
  `;

  const insertParams = [
    data.accountId,
    data.userId,
    data.accountType,
    data.accountName,
    data.accountBankCode,
    data.accountBankName,
    data.currency,
    data.startingAmount,
    data.startingAmount,
    data.minimumValueAllowed,
    data.alertValue,
    data.isSalaryAccount,
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

export async function updateCurrencyAccountData(data: ICurrencyAccountData) {
  const query = `
    UPDATE public.currency_account_list
    SET account_name = $1, account_bank_code = $2, account_bank_name = $3, minimum_value_allowed = $4,
    alert_value = $5, open_alert = $6, is_salary_account = $7, note = $8
    WHERE account_id = $9 AND user_id = $10
  `;
  const params = [
    data.accountName,
    data.accountBankCode,
    data.accountBankName,
    data.minimumValueAllowed,
    data.alertValue,
    data.openAlert,
    data.isSalaryAccount,
    data.note,
    data.accountId,
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

export async function enableCurrencyAccountStatus(data: ICurrencyAccountData) {

  return executeSQLsyntax({
    query: "UPDATE public.currency_account_list SET enable = $1 WHERE account_id = $2 AND user_id = $3",
    params: [true, data.accountId, data.userId],
    isReturnArray: false,
    successMessage: "更新成功",
    errorMessage: "更新失敗",
  });
}

export async function disableCurrencyAccountStatus(data: ICurrencyAccountData) {

  return executeSQLsyntax({
    query: "UPDATE public.currency_account_list SET enable = $1 WHERE account_id = $2 AND user_id = $3",
    params: [false, data.accountId, data.userId],
    isReturnArray: false,
    successMessage: "更新成功",
    errorMessage: "更新失敗",
  });
}


export async function removeCurrencyAccountData(data: ICurrencyAccountData) {

  const accountData = await getCurrencyAccountById(data.accountId, data.userId);
  const recordData = await searchingCurrencyAccountRecordList({
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
      query: "DELETE FROM public.currency_account_list WHERE account_id = $1 AND user_id = $2",
      params: [data.accountId, data.userId],
      successMessage: "刪除成功",
      errorMessage: "刪除失敗",
    });

  } else {
    return { success: false, message: "刪除失敗" };
  }
}
