import pool from "@/db";
import { getCurrentYear, getCurrentMonth, getCurrentTimestamp, setTimezone } from "@/utils/tools";
import { executeSQLsyntax } from "@/services/servicesTools";
import { insertCreditCardLimitation } from "@/services/creditCard/creditCardParamsServices";

export interface ICreditCardData {
  creditcardId: string;
  userId: string;
  accountType: string;
  creditcardName: string;
  creditcardBankCode: string;
  creditcardBankName: string;
  creditcardSchema: string;
  currency: string;
  currencyName?: string;
  limitCredit: number;
  startDate: string;
  expirationDate: string;
  alertValue: number;
  expenditureCurrentMonth: number;
  openAlert: boolean;
  enable: boolean;
  createdDate: string;
  note: string;
}

export async function searchingCreditCardList(data: { currencyId: string; userId: string }) {
  // console.log("data:", data);
  // console.log("getCurrentYear:", `'${getCurrentYear()}-${getCurrentMonth()}-01 00:00:00'`);

  return executeSQLsyntax({
    query: `
      SELECT creditcard_list.*,
        (
        SELECT to_jsonb(currency_list.*) FROM currency_list
        WHERE currency_list.currency_code = creditcard_list.currency
        ) AS currency_data,

        (
        SELECT COUNT(*)::INTEGER FROM creditcard_trade
        WHERE creditcard_trade.credit_card_id = creditcard_list.creditcard_id
        ) AS frequency,

        creditcard_limit.limit_year_month,
        creditcard_limit.limit_credit,
        COALESCE(trade_totals.expenditure_current_month, 0) AS expenditure_current_month
      FROM creditcard_list

      LEFT JOIN creditcard_limit ON creditcard_list.creditcard_id = creditcard_limit.creditcard_id
        AND creditcard_limit.limit_year_month = '${getCurrentYear()}-${getCurrentMonth()}-01 00:00:00'

      LEFT JOIN (
        SELECT credit_card_id, SUM(trade_amount) AS expenditure_current_month FROM creditcard_trade
        WHERE bill_month = '${getCurrentYear()}-${getCurrentMonth()}-01 00:00:00'
        GROUP BY credit_card_id
      ) trade_totals ON creditcard_list.creditcard_id = trade_totals.credit_card_id

      WHERE creditcard_list.currency LIKE '%${data.currencyId}%' AND creditcard_list.user_id = '${data.userId}'
      ORDER BY created_date`,
    successMessage: "查詢成功",
    errorMessage: "查詢失敗",
  });

}

export async function getCreditCardById(creditcardId: string, userId: string) {
  return executeSQLsyntax({
    query: `
      SELECT creditcard_list.*, creditcard_limit.limit_year_month,
      COALESCE(trade_totals.expenditure_current_month, 0) AS expenditure_current_month
      FROM creditcard_list
      LEFT JOIN creditcard_limit ON creditcard_list.creditcard_id = creditcard_limit.creditcard_id AND creditcard_limit.limit_year_month = '${getCurrentYear()}-${getCurrentMonth()}-01 00:00:00'

      LEFT JOIN (
        SELECT credit_card_id, SUM(trade_amount) AS expenditure_current_month FROM creditcard_trade
        WHERE bill_month = '${getCurrentYear()}-${getCurrentMonth()}-01 00:00:00'
        GROUP BY credit_card_id
      ) trade_totals ON creditcard_list.creditcard_id = trade_totals.credit_card_id

      WHERE creditcard_list.creditcard_id = '${creditcardId}' AND creditcard_list.user_id = '${userId}'`,
    isReturnArray: false,
    successMessage: "查詢成功",
    errorMessage: "查詢失敗",
  });
}

export async function insertCreditCardData(data: ICreditCardData) {
  const client = await pool.connect();
  await client.query("BEGIN");
  const currentTimestamp = getCurrentTimestamp();
  const timeStampWithZone = setTimezone();
  const creditcardId = `CC-${currentTimestamp}`;

  const insertResult = await executeSQLsyntax({
    query: `
      INSERT INTO public.creditcard_list(
      creditcard_id, user_id, account_type, creditcard_name, creditcard_bank_code, creditcard_bank_name, creditcard_schema, currency, alert_value, open_alert, enable, start_date, expiration_date, created_date, note)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
    params: [
      creditcardId,
      data.userId,
      data.accountType,
      data.creditcardName,
      data.creditcardBankCode,
      data.creditcardBankName,
      data.creditcardSchema,
      data.currency,
      data.alertValue,
      data.openAlert,
      data.enable,
      data.startDate,
      data.expirationDate,
      timeStampWithZone,
      data.note,
    ],
    isReturnArray: false,
    successMessage: "新增成功",
    errorMessage: "新增失敗",
  });

  if (!insertResult.success) {
    await client.query("ROLLBACK");
    return { success: true, message: insertResult.message, returnCode: -1 };
  }

  const limitInsertResult = await insertCreditCardLimitation({
    creditcardId: creditcardId,
    userId: data.userId,
    startDate: data.startDate,
    expirationDate: data.expirationDate,
    creditPerMonth: data.limitCredit
  });
  if (!limitInsertResult.success) {
    await client.query("ROLLBACK");
    return { success: true, message: limitInsertResult.message, returnCode: -1 };
  }

  await client.query("COMMIT");
  return { success: true, message: "新增信用卡成功" };
}

export async function updateCreditCardData(data: ICreditCardData) {

  return executeSQLsyntax({
    query: `
      UPDATE public.creditcard_list
      SET creditcard_name = $1, creditcard_bank_code = $2, creditcard_bank_name = $3, alert_value = $4, open_alert = $5, enable = $6, note = $7
      WHERE creditcard_id = $8 AND user_id = $9`,
    params: [
      data.creditcardName,
      data.creditcardBankCode,
      data.creditcardBankName,
      data.alertValue,
      data.openAlert,
      data.enable,
      data.note,
      data.creditcardId,
      data.userId,
    ],
    isReturnArray: false,
    successMessage: "更新成功",
    errorMessage: "更新失敗",
  });
}

export async function enableCreditCardStatus(data: ICreditCardData) {
  return executeSQLsyntax({
    query: `
      UPDATE public.creditcard_list SET enable = ${true}
      WHERE creditcard_id = '${data.creditcardId}' AND user_id = '${data.userId}'`,
    isReturnArray: false,
    successMessage: "成功",
    errorMessage: "失敗",
  });
}

export async function disableCreditCardStatus(data: ICreditCardData) {
  return executeSQLsyntax({
    query: `
      UPDATE public.creditcard_list SET enable = ${false}
      WHERE creditcard_id = '${data.creditcardId}' AND user_id = '${data.userId}'`,
    isReturnArray: false,
    successMessage: "成功",
    errorMessage: "失敗",
  });
}

export async function removeCreditCardData(data: ICreditCardData) {
  const client = await pool.connect();

  const searchingResult = await executeSQLsyntax({
    query: `
      SELECT * FROM creditcard_trade
      WHERE credit_card_id = '${data.creditcardId}' AND user_id = '${data.userId}'`,
    successMessage: "",
    errorMessage: "",
  });

  if (searchingResult.success === false) {
    return { success: true, data: [], message: "連線錯誤，無法刪除", returnCode: -1 };
  } else if (searchingResult.success === true && searchingResult.data.length > 0) {
    return { success: true, data: [], message: "已有收支紀錄，無法刪除", returnCode: -1 };
  } else if (searchingResult.success === true && searchingResult.data.length === 0) {

    await client.query("BEGIN");

    const deleteCreditcardDataResult = await executeSQLsyntax({
      query: `
        DELETE FROM public.creditcard_list
        WHERE creditcard_id = '${data.creditcardId}' AND user_id = '${data.userId}'`,
      successMessage: "刪除成功",
      errorMessage: "刪除失敗",
    });

    if (deleteCreditcardDataResult.success === false) {
      await client.query("ROLLBACK");
      return { success: true, data: [], message: deleteCreditcardDataResult.message, returnCode: -1 };
    } else if (deleteCreditcardDataResult.success === true) {

      const deleteParamsResult = await executeSQLsyntax({
        query: `
          DELETE FROM public.creditcard_limit
          WHERE creditcard_id = '${data.creditcardId}' AND user_id = '${data.userId}'`,
        successMessage: "刪除成功",
        errorMessage: "刪除失敗",
      });

      if (deleteParamsResult.success === false) {
        await client.query("ROLLBACK");
        return { success: true, data: [], message: deleteParamsResult.message, returnCode: -1 };
      } else if (deleteParamsResult.success === true) {
        await client.query("COMMIT");
        return { success: true, data: [], message: "刪除成功", returnCode: 1 };
      }

    }

  }
}
