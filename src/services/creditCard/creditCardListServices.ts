import pool from "@/db";
import { keysToCamel, getCurrentTimestamp, getTimeStampWithZone } from "@/utils/tools";
import * as accountBalanceServices from "@/services/accountBalanceServices";

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
  creditPerMonth: number;
  expirationDate: string;
  alertValue: number;
  openAlert: boolean;
  enable: boolean;
  createdDate: string;
  note: string;
}

// Helper function for consistent error handling
const handleDbError = (error: any, defaultData: any = []) => {
  return { success: false, data: defaultData };
};

// Helper function for update operations
const executeUpdate = async (query: string, params: any[]): Promise<boolean> => {
  try {
    const result = await pool.query(query, params);
    return result.rowCount === 1;
  } catch (error) {
    return false;
  }
};

export async function searchingCreditCardList(data: { currencyId: string; userId: string }) {
  try {
    const query = `
      SELECT creditcard_list.*, currency_list.currency_name
      FROM creditcard_list
      LEFT JOIN currency_list ON creditcard_list.currency = currency_list.currency_code
      WHERE currency LIKE $1 AND user_id = $2
      ORDER BY created_date
    `;
    const result = await pool.query(query, [`%${data.currencyId}%`, data.userId]);
    return { success: true, data: keysToCamel(result.rows) };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function getCreditCardById(creditcardId: string, userId: string) {
  try {
    const query = "SELECT * FROM creditcard_list WHERE creditcard_id = $1 AND user_id = $2";
    const result = await pool.query(query, [creditcardId, userId]);

    if (result.rows.length === 0) {
      return { success: false, data: null };
    }

    return { success: true, data: keysToCamel(result.rows[0]) };
  } catch (error) {
    return handleDbError(error, null);
  }
}

export async function insertCreditCardData(data: ICreditCardData) {
  try {
    const currentTimestamp = getCurrentTimestamp();
    const timeStampWithZone = getTimeStampWithZone();
    const creditcardId = `CC-${currentTimestamp}`;

    const insertQuery = `
      INSERT INTO public.creditcard_list(
        creditcard_id, user_id, account_type, creditcard_name, creditcard_bank_code,
        creditcard_bank_name, creditcard_schema, currency, credit_per_month,
        expiration_date, alert_value, open_alert, enable, created_date, note
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    `;

    const insertParams = [
      creditcardId,
      data.userId,
      data.accountType,
      data.creditcardName,
      data.creditcardBankCode,
      data.creditcardBankName,
      data.creditcardSchema,
      data.currency,
      data.creditPerMonth,
      data.expirationDate,
      data.alertValue,
      data.openAlert,
      data.enable,
      timeStampWithZone,
      data.note,
    ];

    const insertResult = await pool.query(insertQuery, insertParams);

    if (insertResult.rowCount === 1) {
      const balanceSuccess = await accountBalanceServices.insertBalance({
        tradeId: `CC-${data.currency}-${currentTimestamp}`,
        accountId: creditcardId,
        userId: data.userId,
        transactionType: "expense",
        tradeCode: "default",
        tradeAmount: 0,
        accountBalance: 0,
        eventDatetimes: timeStampWithZone,
      });

      return {
        success: balanceSuccess,
        userData: balanceSuccess ? keysToCamel(insertResult.rows[0]) : [],
      };
    }

    return { success: false, userData: [] };
  } catch (error) {
    return { success: false, userData: [] };
  }
}

export async function updateCreditCardData(data: ICreditCardData) {
  const query = `
    UPDATE public.creditcard_list
    SET creditcard_name=$1, creditcard_bank_code=$2, creditcard_bank_name=$3,
        credit_per_month=$4, alert_value=$5, open_alert=$6, note=$7
    WHERE creditcard_id=$8 AND user_id=$9
  `;
  const params = [
    data.creditcardName,
    data.creditcardBankCode,
    data.creditcardBankName,
    data.creditPerMonth,
    data.alertValue,
    data.openAlert,
    data.note,
    data.creditcardId,
    data.userId,
  ];

  return executeUpdate(query, params);
}

export async function enableCreditCardStatus(data: ICreditCardData) {
  const query = "UPDATE public.creditcard_list SET enable=$1 WHERE creditcard_id=$2 AND user_id=$3";
  return executeUpdate(query, [true, data.creditcardId, data.userId]);
}

export async function disableCreditCardStatus(data: ICreditCardData) {
  const query = "UPDATE public.creditcard_list SET enable=$1 WHERE creditcard_id=$2 AND user_id=$3";
  return executeUpdate(query, [false, data.creditcardId, data.userId]);
}

export async function removeCreditCardData(data: ICreditCardData) {
  try {
    // Check if there are existing records
    const checkQuery = "SELECT * FROM creditcard_trade WHERE credit_card_id = $1 AND user_id = $2";
    const searchingResult = await pool.query(checkQuery, [data.creditcardId, data.userId]);

    if (searchingResult.rows.length > 0) {
      return { success: false, message: "已有收支紀錄，無法刪除" };
    }

    // Delete the credit card
    const deleteQuery = "DELETE FROM public.creditcard_list WHERE creditcard_id = $1 AND user_id = $2";
    const deleteResult = await pool.query(deleteQuery, [data.creditcardId, data.userId]);

    return deleteResult.rowCount === 1
      ? { success: true, message: "刪除成功" }
      : { success: false, message: "刪除失敗" };
  } catch (error) {
    return { success: false, message: "刪除失敗" };
  }
}
