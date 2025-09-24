import pool from "@/db";
import { keysToCamel, getCurrentTimestamp, getTimeStampWithZone } from "@/utils/tools";
import * as accountBalanceServices from "@/services/accountBalanceServices";

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
  createDate: string;
  note: string;
}

export interface IAccountSearchingParams {
  currencyId: string;
  userId: string;
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

export async function searchingCashFlowList(data: IAccountSearchingParams) {
  try {
    const result = await pool.query(`
      SELECT cashflow_list.*, currency_list.currency_name
      FROM cashflow_list
      LEFT JOIN currency_list ON cashflow_list.currency = currency_list.currency_code
      WHERE currency LIKE '${data.currencyId}' AND user_id = '${data.userId}'
      ORDER BY created_date`);
    return { success: true, data: keysToCamel(result.rows) };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function getCashFlowById(cashflowId: string, userId: string) {
  try {
    const result = await pool.query(
      `SELECT * FROM cashflow_list WHERE cashflow_id = '${cashflowId}' AND user_id = '${userId}'`);
    if (result.rows.length === 1) {
      return { success: true, data: keysToCamel(result.rows[0]) };
    } else {
      return { success: false, data: [] };
    }
  } catch (error) {
    return handleDbError(error);
  }
}

export async function insertCashflowData(data: ICashFlowData) {
  try {
    const cashflowId = `CF-${getCurrentTimestamp()}`;
    const timestamp = getTimeStampWithZone();

    const insertQuery = `
      INSERT INTO public.cashflow_list(
        cashflow_id, user_id, account_type, cashflow_name, currency,
        starting_amount, present_amount, minimum_value_allowed,
        alert_value, open_alert, created_date, note
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `;

    const insertParams = [
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
      timestamp,
      data.note,
    ];

    const insertResult = await pool.query(insertQuery, insertParams);

    if (insertResult.rowCount === 1) {
      const balanceSuccess = await accountBalanceServices.insertBalance({
        tradeId: `CF-${data.currency}-${getCurrentTimestamp()}`,
        accountId: cashflowId,
        userId: data.userId,
        transactionType: "income",
        tradeCode: "default",
        tradeAmount: data.startingAmount,
        accountBalance: data.startingAmount,
        eventDatetimes: timestamp,
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

export async function updateCashflowData(data: ICashFlowData) {
  const query = `
    UPDATE public.cashflow_list
    SET cashflow_name=$1, minimum_value_allowed=$2, alert_value=$3, open_alert=$4, note=$5
    WHERE cashflow_id=$6 AND user_id=$7
  `;
  const params = [
    data.cashflowName,
    data.minimumValueAllowed,
    data.alertValue,
    data.openAlert,
    data.note,
    data.cashflowId,
    data.userId,
  ];

  return executeUpdate(query, params);
}

export async function enableCashFlowStatus(data: ICashFlowData) {
  const query = "UPDATE public.cashflow_list SET enable=$1 WHERE cashflow_id=$2 AND user_id=$3";
  return executeUpdate(query, [true, data.cashflowId, data.userId]);
}

export async function disableCashFlowStatus(data: ICashFlowData) {
  const query = "UPDATE public.cashflow_list SET enable=$1 WHERE cashflow_id=$2 AND user_id=$3";
  return executeUpdate(query, [false, data.cashflowId, data.userId]);
}

export async function removeCashflowData(data: ICashFlowData) {
  try {
    const deleteMainQuery = "DELETE FROM public.cashflow_list WHERE cashflow_id=$1 AND user_id=$2";
    const deleteResult = await pool.query(deleteMainQuery, [data.cashflowId, data.userId]);

    if (deleteResult.rowCount === 1) {
      const deleteTradeQuery = "DELETE FROM public.cashflow_trade WHERE cashflow_id=$1 AND user_id=$2";
      await pool.query(deleteTradeQuery, [data.cashflowId, data.userId]);
      return { success: true, message: "刪除成功" };
    }

    return { success: false, message: "刪除失敗" };
  } catch (error) {
    console.error("Remove cashflow error:", error);
    return { success: false, message: "刪除失敗" };
  }
}
