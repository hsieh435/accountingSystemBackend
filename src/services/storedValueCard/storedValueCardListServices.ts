import { getCurrentYear, getCurrentMonth, getCurrentTimestamp, setTimezone } from "@/utils/tools";
import { executeSQLsyntax } from "@/services/servicesTools";

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
  return executeSQLsyntax({
    query: `
      SELECT stored_value_card_list.*,
        (
        SELECT to_jsonb(currency_list.*) FROM currency_list
        WHERE currency_list.currency_code = stored_value_card_list.currency
        ) AS currency_data,

        (
        SELECT COUNT(*)::INTEGER FROM stored_value_card_trade
        WHERE stored_value_card_trade.stored_value_card_id = stored_value_card_list.stored_value_card_id
        ) AS frequency,

        COALESCE(trade_totals.expense_sum, 0) AS expense_sum_current_month,
        COALESCE(trade_totals.income_sum, 0) AS income_sum_current_month,
        COALESCE(trade_totals.income_sum - trade_totals.expense_sum, 0) AS profit_loss_sum_current_month
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
      ORDER BY created_date`,
    successMessage: "查詢成功",
    errorMessage: "查詢失敗",
  });
}

export async function getStoredValueCardData(storedValueCardId: string, userId: string) {
  return executeSQLsyntax({
    query: `
      SELECT stored_value_card_list.*,
        COALESCE(trade_totals.expense_sum, 0) AS expense_sum_current_month,
        COALESCE(trade_totals.income_sum, 0) AS income_sum_current_month,
        COALESCE(trade_totals.income_sum - trade_totals.expense_sum, 0) AS profit_loss_sum_current_month
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

      WHERE stored_value_card_list.stored_value_card_id = '${storedValueCardId}' AND stored_value_card_list.user_id = '${userId}'`,
    isReturnArray: false,
    successMessage: "查詢成功",
    errorMessage: "查詢失敗",
  });
}

export async function insertStoredValueCardData(data: IStoredValueCardData) {
  const currentTimestamp = getCurrentTimestamp();
  const timeStampWithZone = setTimezone();

  return executeSQLsyntax({
    query: `
      INSERT INTO public.stored_value_card_list(stored_value_card_id, user_id, account_type, stored_value_card_name, currency, starting_amount, present_amount, minimum_value_allowed, maximum_value_allowed, alert_value, open_alert, enable, created_date, note)
      VALUES ('SVC-${currentTimestamp}', '${data.userId}', '${data.accountType}', '${data.storedValueCardName}', '${data.currency}', ${data.startingAmount}, ${data.startingAmount}, ${data.minimumValueAllowed}, ${data.maximumValueAllowed}, ${data.alertValue}, ${data.openAlert}, ${data.enable}, '${timeStampWithZone}', '${data.note}')`,
    isReturnArray: false,
    successMessage: "新增成功",
    errorMessage: "新增失敗",
  });
}

export async function updateStoredValueCardData(data: IStoredValueCardData) {
  return executeSQLsyntax({
    query: `
      UPDATE public.stored_value_card_list SET stored_value_card_name = '${data.storedValueCardName}', minimum_value_allowed = ${data.minimumValueAllowed}, maximum_value_allowed = ${data.maximumValueAllowed}, alert_value = ${data.alertValue}, open_alert = ${data.openAlert}, note = '${data.note}'
      WHERE stored_value_card_id = '${data.storedValueCardId}' AND user_id = '${data.userId}'`,
    isReturnArray: false,
    successMessage: "更新成功",
    errorMessage: "更新失敗",
  });
}

export async function enableStoredValueCardStatus(data: IStoredValueCardData) {
  return executeSQLsyntax({
    query: `
      UPDATE public.stored_value_card_list SET enable = ${true}
      WHERE stored_value_card_id = '${data.storedValueCardId}' AND user_id = '${data.userId}'`,
    isReturnArray: false,
    successMessage: "啟用成功",
    errorMessage: "啟用失敗",
  });
}

export async function disableStoredValueCardStatus(data: IStoredValueCardData) {
  return executeSQLsyntax({
    query: `
      UPDATE public.stored_value_card_list SET enable = ${false}
      WHERE stored_value_card_id = '${data.storedValueCardId}' AND user_id = '${data.userId}'`,
    isReturnArray: false,
    successMessage: "停用成功",
    errorMessage: "停用失敗",
  });
}

export async function removeStoredValueCardData(data: IStoredValueCardData) {
  const recordDetectResult = await executeSQLsyntax({
    query: `
      SELECT 1 FROM public.stored_value_card_list
      WHERE stored_value_card_id = '${data.storedValueCardId}XXXXX' AND user_id = '${data.userId}' AND currency = '${data.currency}'
      `,
  });

  console.log("recordDetectResult:", recordDetectResult);
  if (recordDetectResult.success && recordDetectResult.data.length > 0) {
    return { success: true, message: "已有收支紀錄", returnCode: -1 };
  } else if (recordDetectResult.success && recordDetectResult.data.length === 0) {
    return executeSQLsyntax({
      query: `
        DELETE FROM public.stored_value_card_list
        WHERE stored_value_card_id = '${data.storedValueCardId}' AND user_id = '${data.userId}'`,
      successMessage: "刪除成功",
      errorMessage: "刪除失敗",
    });
  } else {
    return { success: false, message: "刪除失敗", returnCode: -1 };
  }
}
