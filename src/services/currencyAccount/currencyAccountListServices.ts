import pool from "@/db";
import { keysToCamel, getTimeStampWithZone, getCurrentTimestamp } from "@/utils/tools";
import * as accountBalanceServices from "@/services/accountBalance/cashflowBalanceServices";

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

// Helper function for consistent error handling
const handleDbError = (error: any, defaultData: any = []) => {
  console.error("Database error:", error);
  return { success: false, data: defaultData };
};

// Helper function for update operations
const executeUpdate = async (query: string, params: any[]): Promise<boolean> => {
  try {
    const result = await pool.query(query, params);
    return result.rowCount === 1;
  } catch (error) {
    console.error("Update error:", error);
    return false;
  }
};

export async function searchingCurrencyAccountList(data: { currencyId: string; userId: string }) {
  try {
    const query = `
      SELECT currency_account_list.*, currency_list.currency_name
      FROM currency_account_list
      LEFT JOIN currency_list ON currency_account_list.currency = currency_list.currency_code
      WHERE currency LIKE $1 AND user_id = $2
      ORDER BY created_date
    `;
    const result = await pool.query(query, [`%${data.currencyId}%`, data.userId]);
    return { success: true, data: keysToCamel(result.rows) };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function getCurrencyAccountById(accountId: string, userId: string) {
  try {
    const query = "SELECT * FROM currency_account_list WHERE account_id = $1 AND user_id = $2";
    const result = await pool.query(query, [accountId, userId]);

    if (result.rows.length === 0) {
      return { success: false, data: null };
    }

    return { success: true, data: keysToCamel(result.rows[0]) };
  } catch (error) {
    return handleDbError(error, null);
  }
}

export async function insertCurrencyAccountData(data: ICurrencyAccountData) {
  try {
    const currentTimestamp = getCurrentTimestamp();
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

    const insertResult = await pool.query(insertQuery, insertParams);

    if (insertResult.rowCount === 1) {
      const balanceSuccess = await accountBalanceServices.insertBalance({
        tradeId: `CA-${data.currency}-${currentTimestamp}`,
        accountId: `CA-${data.accountId}`,
        userId: data.userId,
        transactionType: "income",
        tradeCode: "default",
        tradeAmount: data.startingAmount,
        accountBalance: data.startingAmount,
        eventDatetimes: timeStampWithZone,
      });

      return {
        success: balanceSuccess,
        userData: balanceSuccess ? keysToCamel(insertResult.rows[0]) : [],
      };
    }

    return { success: false, userData: [] };
  } catch (error) {
    console.error("Insert currency account error:", error);
    return { success: false, userData: [] };
  }
}

export async function updateCurrencyAccountData(data: ICurrencyAccountData) {
  const query = `
    UPDATE public.currency_account_list
    SET account_name=$1, account_bank_code=$2, account_bank_name=$3,
        minimum_value_allowed=$4, alert_value=$5, open_alert=$6,
        is_salary_account=$7, note=$8
    WHERE account_id=$9 AND user_id=$10
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

  return executeUpdate(query, params);
}

export async function enableCurrencyAccountStatus(data: ICurrencyAccountData) {
  const query = "UPDATE public.currency_account_list SET enable=$1 WHERE account_id=$2 AND user_id=$3";
  return executeUpdate(query, [true, data.accountId, data.userId]);
}

export async function disableCurrencyAccountStatus(data: ICurrencyAccountData) {
  const query = "UPDATE public.currency_account_list SET enable=$1 WHERE account_id=$2 AND user_id=$3";
  return executeUpdate(query, [false, data.accountId, data.userId]);
}

export async function removeCurrencyAccountData(data: ICurrencyAccountData) {
  try {
    // Check if there are existing records
    const checkQuery = "SELECT * FROM currency_account_trade WHERE account_id = $1 AND user_id = $2";
    const searchingResult = await pool.query(checkQuery, [data.accountId, data.userId]);

    if (searchingResult.rows.length > 0) {
      return { success: false, message: "已有收支紀錄，無法刪除" };
    }

    // Delete the account
    const deleteQuery = "DELETE FROM public.currency_account_list WHERE account_id = $1 AND user_id = $2";
    const deleteResult = await pool.query(deleteQuery, [data.accountId, data.userId]);

    return deleteResult.rowCount === 1
      ? { success: true, message: "刪除成功" }
      : { success: false, message: "刪除失敗" };
  } catch (error) {
    console.error("Remove currency account error:", error);
    return { success: false, message: "刪除失敗" };
  }
}
