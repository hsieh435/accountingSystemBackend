import { getCurrentYear, getCurrentMonth, getCurrentTimestamp, getTimeStampWithZone } from "@/utils/tools";
import { executeSQLsyntax } from "@/services/servicesTools";
import { searchingStoredValueCardRecordList } from "@/services/storedValueCard/storedValueCardRecordServices";

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
  const query = `
    SELECT stored_value_card_list.*,
      (
      SELECT to_jsonb(currency_list.*) FROM currency_list
      WHERE currency_list.currency_code = stored_value_card_list.currency
      ) AS currency_data,

      COALESCE(trade_totals.expense_sum, 0) AS expense_expenditure_current_month,
      COALESCE(trade_totals.income_sum, 0) AS income_expenditure_current_month,
      COALESCE(trade_totals.income_sum - trade_totals.expense_sum, 0) AS profit_Loss_expenditure_current_month
    FROM stored_value_card_list

    LEFT JOIN (
      SELECT stored_value_card_id,
      SUM(CASE WHEN transaction_type = 'expense' THEN trade_amount ELSE 0 END) AS expense_sum,
      SUM(CASE WHEN transaction_type = 'income' THEN trade_amount ELSE 0 END) AS income_sum
      FROM stored_value_card_trade
      WHERE EXTRACT(YEAR FROM trade_datetime) = '${getCurrentYear()}'
      AND EXTRACT(MONTH FROM trade_datetime) = '${getCurrentMonth()}'
      GROUP BY stored_value_card_id
    ) trade_totals ON stored_value_card_list.stored_value_card_id = trade_totals.stored_value_card_id

    WHERE currency LIKE '%${data.currencyId}%' AND user_id = '${data.userId}'
    ORDER BY created_date`;

  return executeSQLsyntax({ query: query, successMessage: "查詢成功", errorMessage: "查詢失敗" });
}

export async function getStoredValueCardData(storedValueCardId: string, userId: string) {
  const query = `
    SELECT stored_value_card_list.*,
      COALESCE(trade_totals.expense_sum, 0) AS expense_expenditure_current_month,
      COALESCE(trade_totals.income_sum, 0) AS income_expenditure_current_month,
      COALESCE(trade_totals.income_sum - trade_totals.expense_sum, 0) AS profit_Loss_expenditure_current_month
    FROM stored_value_card_list

    LEFT JOIN (
      SELECT stored_value_card_id,
      SUM(CASE WHEN transaction_type = 'expense' THEN trade_amount ELSE 0 END) AS expense_sum,
      SUM(CASE WHEN transaction_type = 'income' THEN trade_amount ELSE 0 END) AS income_sum
      FROM stored_value_card_trade
      WHERE EXTRACT(YEAR FROM trade_datetime) = '${getCurrentYear()}'
      AND EXTRACT(MONTH FROM trade_datetime) = '${getCurrentMonth()}'
      GROUP BY stored_value_card_id
    ) trade_totals ON stored_value_card_list.stored_value_card_id = trade_totals.stored_value_card_id

    WHERE stored_value_card_list.stored_value_card_id = '${storedValueCardId}' AND stored_value_card_list.user_id = '${userId}'`;

  return executeSQLsyntax({ query: query, isReturnArray: false, successMessage: "查詢成功", errorMessage: "查詢失敗" });
}

export async function insertStoredValueCardData(data: IStoredValueCardData) {
  const currentTimestamp = getCurrentTimestamp();
  const timeStampWithZone = getTimeStampWithZone();
  const query = `
    INSERT INTO public.stored_value_card_list(stored_value_card_id, user_id, account_type, stored_value_card_name, currency, starting_amount, present_amount, minimum_value_allowed, maximum_value_allowed, alert_value, open_alert, enable, created_date, note)
    VALUES ('SVC-${currentTimestamp}', '${data.userId}', '${data.accountType}', '${data.storedValueCardName}', '${data.currency}', ${data.startingAmount}, ${data.startingAmount}, ${data.minimumValueAllowed}, ${data.maximumValueAllowed}, ${data.alertValue}, ${data.openAlert}, ${data.enable}, '${timeStampWithZone}', '${data.note}')`;

  return executeSQLsyntax({ query: query, isReturnArray: false, successMessage: "新增成功", errorMessage: "新增失敗" });
}

export async function updateStoredValueCardData(data: IStoredValueCardData) {
  const query = `
    UPDATE public.stored_value_card_list SET stored_value_card_name = '${data.storedValueCardName}', minimum_value_allowed = ${data.minimumValueAllowed}, maximum_value_allowed = ${data.maximumValueAllowed}, alert_value = ${data.alertValue}, open_alert = ${data.openAlert}, note = '${data.note}'
    WHERE stored_value_card_id = '${data.storedValueCardId}' AND user_id = '${data.userId}'`;

  return executeSQLsyntax({ query: query, isReturnArray: false, successMessage: "更新成功", errorMessage: "更新失敗" });
}

export async function enableStoredValueCardStatus(data: IStoredValueCardData) {
  const query = `
    UPDATE public.stored_value_card_list SET enable = ${true} WHERE stored_value_card_id = '${data.storedValueCardId}' AND user_id = '${data.userId}'`;

  return executeSQLsyntax({ query: query, isReturnArray: false, successMessage: "啟用成功", errorMessage: "啟用失敗" });
}

export async function disableStoredValueCardStatus(data: IStoredValueCardData) {
  const query = `
    UPDATE public.stored_value_card_list SET enable = ${false} WHERE stored_value_card_id = '${data.storedValueCardId}' AND user_id = '${data.userId}'`;

  return executeSQLsyntax({ query: query, isReturnArray: false, successMessage: "停用成功", errorMessage: "停用失敗" });
}

export async function removeStoredValueCardData(data: IStoredValueCardData) {
  const storedValueCardData = await getStoredValueCardData(data.storedValueCardId, data.userId);
  const recordData = await searchingStoredValueCardRecordList({
    userId: storedValueCardData.data.userId,
    currencyId: storedValueCardData.data.currency,
    accountId: storedValueCardData.data.storedValueCardId,
    tradeCategory: "",
    startingDate: "1900-01-01 00:00:00",
    endDate: "9999-12-31 23:59:59",
  });

  if (recordData.success && recordData.data.length > 0) {
    // console.log("data:", recordData.data);
    return { success: false, message: "已有收支紀錄" };
  } else if (recordData.success && recordData.data.length === 0) {
    const query = `
      DELETE FROM public.stored_value_card_list WHERE stored_value_card_id = '${data.storedValueCardId}' AND user_id = '${data.userId}'`;

    return executeSQLsyntax({ query: query, successMessage: "刪除成功", errorMessage: "刪除失敗" });
  } else {
    return { success: false, message: "刪除失敗" };
  }
}
