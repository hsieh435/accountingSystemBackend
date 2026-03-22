import { getCurrentTimestamp, setTimezone } from "@/utils/tools";
import { executeSQLsyntax } from "@/services/servicesTools";
import {
  type IFinanceRecordSearchingParams,
  tradeDateTimeDetect,
  updateRelatedData,
} from "@/services/recordServiceToolsCopy";

export interface ICurrencyAccountRecordList {
  tradeId: string;
  accountId: string;
  userId: string;
  tradeDatetime: string;
  accountUser: string;
  accountType: string;
  transactionType: string;
  tradeCategory: string;
  tradeAmount: number;
  remainingAmount: number;
  currency: string;
  tradeDescription: string;
  tradeNote: string;
  createdDatetime: string;
  editedDatetime: string;
}

export async function searchingCurrencyAccountRecordList(data: IFinanceRecordSearchingParams) {
  return executeSQLsyntax({
    query: `
      SELECT currency_account_trade.*,
        (
        SELECT to_jsonb(currency_account_list.*) FROM currency_account_list
        WHERE currency_account_list.account_id = currency_account_trade.account_id AND currency_account_list.user_id = currency_account_trade.user_id
        ) AS account_data,

        (
        SELECT to_jsonb(currency_list.*) FROM currency_list WHERE currency_list.currency_code = currency_account_trade.currency
        ) AS currency_data,

        (
        SELECT to_jsonb(trade_category.*) FROM trade_category WHERE trade_category.trade_code = currency_account_trade.trade_category
        ) AS trade_category_data,

        (
        SELECT to_jsonb(transaction_category.*) FROM transaction_category WHERE transaction_category.transaction_code = currency_account_trade.transaction_type
        ) AS transaction_category_data

      FROM currency_account_trade
      WHERE currency_account_trade.currency LIKE $1
        AND currency_account_trade.account_id LIKE $2
        AND currency_account_trade.user_id = $3
        AND trade_datetime BETWEEN $4 AND $5
      ORDER BY trade_datetime`,
    params: [`%${data.currencyId}%`, `%${data.accountId}%`, data.userId, data.startingDate, data.endDate],
    successMessage: "查詢成功",
    errorMessage: "查詢失敗",
  });
}

export async function getCurrencyAccountRecordById(data: { tradeId: string; accountId: string; userId: string }) {
  return executeSQLsyntax({
    query: `
      SELECT * FROM currency_account_trade
      WHERE trade_id = '${data.tradeId}' AND account_id = '${data.accountId}'
        AND user_id = '${data.userId}'`,
    isReturnArray: false,
    successMessage: "查詢成功",
    errorMessage: "查詢失敗",
  });
}

export async function insertCurrencyAccountRecord(data: ICurrencyAccountRecordList) {
  // console.log("data:", data);
  data.tradeId = `CA-${data.currency}-${getCurrentTimestamp()}`;
  data.createdDatetime = `${setTimezone()}`;
  data.editedDatetime = `${setTimezone()}`;

  const dateDetectResult = await tradeDateTimeDetect(
    "currency_account_trade",
    "account_id",
    data.accountId,
    data.tradeId,
    data.tradeDatetime,
  );
  // console.log("dateDetectResult:", dateDetectResult);
  if (!dateDetectResult.success) {
    return { success: true, message: dateDetectResult.message, returnCode: -1 };
  }

  const insertResult = await updateRelatedData(
    `INSERT INTO public.currency_account_trade(trade_id, account_id, trade_datetime, user_id, trade_category, transaction_type, trade_amount, remaining_amount, currency, trade_description, trade_note, created_datetime, edited_datetime)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
    [
      data.tradeId,
      data.accountId,
      data.tradeDatetime,
      data.userId,
      data.tradeCategory,
      data.transactionType,
      data.tradeAmount,
      0,
      data.currency,
      data.tradeDescription,
      data.tradeNote,
      data.createdDatetime,
      data.editedDatetime,
    ],
    false,
    "",
    "新增失敗",
    "currency_account_list",
    "account_id",
    data.accountId,
    "currency_account_trade",
    "trade_amount",
  );
  if (insertResult.success === true) {
    return { success: true, message: "新增成功" };
  } else if (insertResult.success === false) {
    return { success: true, message: "新增失敗", returnCode: -1 };
  }
}

export async function updateCurrencyAccountRecord(data: ICurrencyAccountRecordList) {
  data.editedDatetime = `${setTimezone()}`;

  const dateDetectResult = await tradeDateTimeDetect(
    "currency_account_trade",
    "account_id",
    data.accountId,
    data.tradeId,
    data.tradeDatetime,
  );
  // console.log("dateDetectResult:", dateDetectResult);
  if (!dateDetectResult.success) {
    return { success: true, message: dateDetectResult.message, returnCode: -1 };
  }

  const updateResult = await updateRelatedData(
    `UPDATE public.currency_account_trade SET trade_datetime = $1, trade_category = $2, transaction_type = $3, trade_amount = $4, currency = $5, trade_description = $6, trade_note = $7, edited_datetime = $8
    WHERE trade_id = $9 AND account_id = $10 AND user_id = $11`,
    [
      data.tradeDatetime,
      data.tradeCategory,
      data.transactionType,
      data.tradeAmount,
      data.currency,
      data.tradeDescription,
      data.tradeNote,
      data.editedDatetime,
      data.tradeId,
      data.accountId,
      data.userId,
    ],
    false,
    "更新成功",
    "更新失敗",
    "currency_account_list",
    "account_id",
    data.accountId,
    "currency_account_trade",
    "trade_amount",
  );
  if (updateResult.success === true) {
    return { success: true, message: "更新成功" };
  } else if (updateResult.success === false) {
    return { success: true, message: "更新失敗", returnCode: -1 };
  }
}

export async function removeCurrencyAccountRecord(data: ICurrencyAccountRecordList) {
  const deleteResult = await updateRelatedData(
    `DELETE FROM public.currency_account_trade WHERE trade_id = $1 AND account_id = $2 AND user_id = $3`,
    [data.tradeId, data.accountId, data.userId],
    false,
    "刪除成功",
    "刪除失敗",
    "currency_account_list",
    "account_id",
    data.accountId,
    "currency_account_trade",
    "trade_amount",
  );

  if (deleteResult.success === true) {
    return { success: true, message: "刪除成功" };
  } else if (deleteResult.success === false) {
    return { success: true, message: "刪除失敗", returnCode: -1 };
  }
}
