import { getCurrentYear, getCurrentMonth, getCurrentTimestamp, setTimezone } from "@/utils/tools";
import { executeSQLsyntax } from "@/services/servicesTools";

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
  createdDate: string;
  note: string;
}

export interface IAccountSearchingParams {
  currencyId: string;
  userId: string;
}

export async function searchingCashFlowList(data: IAccountSearchingParams) {
  return executeSQLsyntax({
    query: `
      SELECT cashflow_list.*,
        (
        SELECT to_jsonb(currency_list.*) FROM currency_list
        WHERE currency_list.currency_code = cashflow_list.currency
        ) AS currency_data,

        (
        SELECT COUNT(*)::INTEGER FROM cashflow_trade
        WHERE cashflow_trade.cashflow_id = cashflow_list.cashflow_id
        ) AS frequency,

        COALESCE(trade_totals.expense_sum, 0) AS expense_expenditure_current_month,
        COALESCE(trade_totals.income_sum, 0) AS income_expenditure_current_month,
        COALESCE(trade_totals.income_sum - trade_totals.expense_sum, 0) AS profit_loss_expenditure_current_month
      FROM cashflow_list

      LEFT JOIN (
        SELECT cashflow_id,
          SUM(CASE WHEN transaction_type = 'expense' THEN trade_amount ELSE 0 END) AS expense_sum,
          SUM(CASE WHEN transaction_type = 'income' THEN trade_amount ELSE 0 END) AS income_sum
        FROM cashflow_trade
        WHERE EXTRACT(YEAR FROM trade_datetime) = '${getCurrentYear()}'
          AND EXTRACT(MONTH FROM trade_datetime) = '${getCurrentMonth()}'
        GROUP BY cashflow_id
      ) trade_totals ON cashflow_list.cashflow_id = trade_totals.cashflow_id

      WHERE currency LIKE '%${data.currencyId}%' AND user_id = '${data.userId}'
      ORDER BY created_date`,
    successMessage: "查詢成功",
    errorMessage: "查詢失敗",
  });
}

export async function getCashFlowById(cashflowId: string, userId: string) {
  return executeSQLsyntax({
    query: `
      SELECT cashflow_list.*,
        COALESCE(trade_totals.expense_sum, 0) AS expense_expenditure_current_month,
        COALESCE(trade_totals.income_sum, 0) AS income_expenditure_current_month,
        COALESCE(trade_totals.income_sum - trade_totals.expense_sum, 0) AS profit_loss_expenditure_current_month
      FROM cashflow_list

      LEFT JOIN (
        SELECT cashflow_id,
          SUM(CASE WHEN transaction_type = 'expense' THEN trade_amount ELSE 0 END) AS expense_sum,
          SUM(CASE WHEN transaction_type = 'income' THEN trade_amount ELSE 0 END) AS income_sum
          FROM cashflow_trade
        WHERE EXTRACT(YEAR FROM trade_datetime) = '${getCurrentYear()}'
          AND EXTRACT(MONTH FROM trade_datetime) = '${getCurrentMonth()}'
        GROUP BY cashflow_id
      ) trade_totals ON cashflow_list.cashflow_id = trade_totals.cashflow_id

      WHERE cashflow_list.cashflow_id = '${cashflowId}' AND cashflow_list.user_id = '${userId}'
    `,
    isReturnArray: false,
    successMessage: "查詢成功",
    errorMessage: "查詢失敗",
  });
}

export async function insertCashflowData(data: ICashFlowData) {
  const currentTimestamp = getCurrentTimestamp();
  const timeStampWithZone = setTimezone();
  const cashflowId = `CF-${currentTimestamp}`;

  return executeSQLsyntax({
    query: `
      INSERT INTO public.cashflow_list(
      cashflow_id, user_id, account_type, cashflow_name, currency, starting_amount, present_amount, minimum_value_allowed, alert_value, open_alert, enable, created_date, note)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
    params: [
      cashflowId,
      data.userId,
      data.accountType,
      data.cashflowName,
      data.currency,
      data.startingAmount,
      data.startingAmount,
      data.minimumValueAllowed,
      data.alertValue,
      data.openAlert,
      true,
      timeStampWithZone,
      data.note,
    ],
    isReturnArray: false,
    successMessage: "新增成功",
    errorMessage: "新增失敗",
  });
}

export async function updateCashflowData(data: ICashFlowData) {
  return executeSQLsyntax({
    query: `
      UPDATE public.cashflow_list
      SET cashflow_name = $1, minimum_value_allowed = $2, alert_value = $3, open_alert = $4, note = $5
      WHERE cashflow_id = $6 AND user_id = $7`,
    params: [
      data.cashflowName,
      data.minimumValueAllowed,
      data.alertValue,
      data.openAlert,
      data.note,
      data.cashflowId,
      data.userId,
    ],
    isReturnArray: false,
    successMessage: "更新成功",
    errorMessage: "更新失敗",
  });
}

export async function enableCashFlowStatus(data: ICashFlowData) {
  return executeSQLsyntax({
    query: `
      UPDATE public.cashflow_list SET enable = ${true}
      WHERE cashflow_id = '${data.cashflowId}' AND user_id = '${data.userId}'`,
    params: [],
    isReturnArray: false,
    successMessage: "啟用成功",
    errorMessage: "啟用失敗",
  });
}

export async function disableCashFlowStatus(data: ICashFlowData) {
  return executeSQLsyntax({
    query: `
      UPDATE public.cashflow_list SET enable = ${false}
      WHERE cashflow_id = '${data.cashflowId}' AND user_id = '${data.userId}'`,
    params: [],
    isReturnArray: false,
    successMessage: "停用成功",
    errorMessage: "停用失敗",
  });
}

export async function removeCashflowData(data: ICashFlowData) {

  const recordDetectResult = await executeSQLsyntax({
    query: `
      SELECT 1 FROM public.cashflow_list
      WHERE cashflow_id = '${data.cashflowId}' AND user_id = '${data.userId}' AND currency = '${data.currency}'
      `,
  });

  // console.log("recordDetectResult:", recordDetectResult);
  if (recordDetectResult.success && recordDetectResult.data.length > 0) {
    return { success: true, message: "已有收支紀錄", returnCode: -1 };
  } else if (recordDetectResult.success && recordDetectResult.data.length === 0) {
    return executeSQLsyntax({
      query: `
        DELETE FROM public.cashflow_list
        WHERE cashflow_id = '${data.cashflowId}' AND user_id = '${data.userId}'`,
      successMessage: "刪除成功",
      errorMessage: "刪除失敗",
    });
  } else {
    return { success: false, message: "刪除失敗", returnCode: -1 };
  }
}
