import { getCurrentTimestamp, setTimezone } from "@/utils/tools";
import { executeSQLsyntax } from "@/services/servicesTools";
import { IFinanceRecordParams, tradeDateTimeDetect } from "@/services/recordServiceTools";

export interface ICreditCardRecordList {
  tradeId: string;
  userId: string;
  creditCardId: string;
  tradeDatetime: string;
  accountType: string;
  tradeCategory: string;
  tradeAmount: number;
  currency: string;
  remainingAmount: number;
  billMonth: string;
  tradeDescription: string;
  tradeNote: string;
  createdDatetime: string;
  editedDatetime: string;
}

export async function searchingCreditCardRecordList(data: IFinanceRecordParams) {
  return executeSQLsyntax({
    query: `
      SELECT creditcard_trade.*,
        (
        SELECT to_jsonb(creditcard_list.*) FROM creditcard_list
        WHERE creditcard_list.creditcard_id = creditcard_trade.credit_card_id AND creditcard_list.user_id = creditcard_trade.user_id
        ) AS creditcard_data,

        (
        SELECT to_jsonb(currency_list.*) FROM currency_list WHERE currency_list.currency_code = creditcard_trade.currency
        ) AS currency_data,

        (
        SELECT to_jsonb(trade_category.*) FROM trade_category WHERE trade_category.trade_code = creditcard_trade.trade_category
        ) AS trade_category_data

      FROM creditcard_trade
      WHERE creditcard_trade.credit_card_id LIKE '%${data.accountId}%'
        AND creditcard_trade.currency LIKE '%${data.currencyId}%'
        AND creditcard_trade.user_id = '${data.userId}'
        AND creditcard_trade.trade_datetime BETWEEN '${data.startingDate}' AND '${data.endDate}'
      ORDER BY trade_datetime`,
    successMessage: "查詢成功",
    errorMessage: "查詢失敗",
  });
}

export async function getCreditCardRecordById(tradeId: string, creditCardId: string, userId: string) {
  return executeSQLsyntax({
    query: `
      SELECT * FROM creditcard_trade
      WHERE trade_id = '${tradeId}' AND credit_card_id = '${creditCardId}' AND user_id = '${userId}'`,
    isReturnArray: false,
    successMessage: "查詢成功",
    errorMessage: "查詢失敗",
  });
}

export async function insertCreditCardRecordData(data: ICreditCardRecordList) {
  data.tradeId = `CC-${data.currency}-${getCurrentTimestamp()}`;
  data.createdDatetime = `${setTimezone()}`;
  data.editedDatetime = `${setTimezone()}`;

  const dateDetectResult = await tradeDateTimeDetect(
    "creditcard_trade",
    "credit_card_id",
    data.creditCardId,
    data.tradeId,
    data.tradeDatetime,
  );
  // console.log("dateDetectResult:", dateDetectResult);
  if (!dateDetectResult.success) {
    return { success: true, message: dateDetectResult.message, returnCode: -1 };
  }

  return executeSQLsyntax({
    query: `
      INSERT INTO public.creditcard_trade(trade_id, credit_card_id, user_id, trade_datetime, trade_category, transaction_type, trade_amount, remaining_amount, currency, trade_description, trade_note, created_datetime, edited_datetime)
      VALUES ('${data.tradeId}', '${data.creditCardId}', '${data.userId}', '${data.tradeDatetime}', '${data.tradeCategory}', ${data.tradeAmount}, ${data.remainingAmount}, '${data.currency}', '${data.billMonth}', '${data.tradeDescription}', '${data.tradeNote}', '${data.createdDatetime}', '${data.editedDatetime}')`,
    successMessage: "新增成功",
    errorMessage: "新增失敗",
  });
}

export async function updateCreditCardData(data: ICreditCardRecordList) {
  // console.log("data:", data);
  data.editedDatetime = `${setTimezone()}`;

  const dateDetectResult = await tradeDateTimeDetect(
    "creditcard_trade",
    "credit_card_id",
    data.creditCardId,
    data.tradeId,
    data.tradeDatetime,
  );
  // console.log("dateDetectResult:", dateDetectResult);
  if (!dateDetectResult.success) {
    return { success: true, message: dateDetectResult.message, returnCode: -1 };
  }

  return executeSQLsyntax({
    query: `
      UPDATE public.creditcard_trade SET trade_datetime = '${data.tradeDatetime}', trade_category = '${data.tradeCategory}', trade_amount = ${data.tradeAmount}, currency = '${data.currency}', bill_month = '${data.billMonth}', trade_description = '${data.tradeDescription}', trade_note = '${data.tradeNote}', edited_datetime = '${data.editedDatetime}'
      WHERE trade_id = '${data.tradeId}' AND credit_card_id = '${data.creditCardId}' AND user_id = '${data.userId}'`,
    successMessage: "更新成功",
    errorMessage: "更新失敗",
  });
}

export async function removeCreditCardRecordData(data: { tradeId: string; creditCardId: string; userId: string }) {

  return executeSQLsyntax({
    query: `
      DELETE FROM public.creditcard_trade
      WHERE trade_id = '${data.tradeId}' AND credit_card_id = '${data.creditCardId}' AND user_id = '${data.userId}'`,
    successMessage: "刪除成功",
    errorMessage: "刪除失敗",
  });
}
