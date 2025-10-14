import pool from "@/db";
import { keysToCamel, getCurrentTimestamp } from "@/utils/tools";

export interface ICashFlowRecordList {
  tradeId: string;
  cashflowId: string;
  userId: string;
  tradeDatetime: string;
  transactionType: string;
  tradeCategory: string;
  tradeAmount: number;
  remainingAmount: number;
  currency: string;
  tradeDescription: string;
  tradeNote: string;
}

export interface IFinanceRecordSearchingParams {
  accountId: string;
  currencyId: string;
  tradeCategory: string;
  startingDate: string;
  endDate: string;
  userId: string;
}

// Helper function for consistent error handling
const handleDbError = (error: any, defaultData: any = []) => {
  return { success: false, data: defaultData };
};

// Helper function for update/insert operations
const executeOperation = async (query: string, params: any[], successData?: any) => {
  try {
    const result = await pool.query(query, params);
    if (result.rowCount === 1) {
      return {
        success: true,
        userData: successData ? keysToCamel(successData) : keysToCamel(result.rows[0]),
      };
    }
    return { success: false, userData: [] };
  } catch (error) {
    return { success: false, userData: [] };
  }
};

export async function searchingCashFlowRecordList(data: IFinanceRecordSearchingParams) {
  try {
    const query = `
      SELECT cashflow_trade.*,
        currency_list.currency_name,
        cashflow_list.cashflow_name,
        cashflow_list.present_amount,
        trade_category.trade_name,
        transaction_category.transaction_name
      FROM cashflow_trade
      LEFT JOIN currency_list ON cashflow_trade.currency = currency_list.currency_code
      LEFT JOIN cashflow_list ON cashflow_trade.cashflow_id = cashflow_list.cashflow_id
      LEFT JOIN trade_category ON cashflow_trade.trade_category = trade_category.trade_code
      LEFT JOIN transaction_category ON cashflow_trade.transaction_type = transaction_category.transaction_code
      WHERE cashflow_trade.user_id = $1
        AND cashflow_trade.cashflow_id LIKE $2
        AND cashflow_trade.currency LIKE $3
        AND trade_datetime BETWEEN $4 AND $5
      ORDER BY trade_datetime
    `;

    const params = [data.userId, `%${data.accountId}%`, `%${data.currencyId}%`, data.startingDate, data.endDate];

    const result = await pool.query(query, params);
    return { success: true, data: keysToCamel(result.rows) };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function searchingCashFlowRecordById(data: { cashflowId: string; tradeId: string; userId: string }) {
  try {
    const query = `SELECT * FROM public.cashflow_trade
    WHERE cashflow_id = $1 AND trade_id = $2 AND user_id = $3`;
    const result = await pool.query(query, [data.cashflowId, data.tradeId, data.userId]);

    return result.rows.length === 1 ? { success: true, data: result.rows[0] } : { success: false, data: [] };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function insertCashFlowRecordData(data: ICashFlowRecordList) {
  data.tradeId = `CF-${data.currency}-${getCurrentTimestamp()}`;

  try {
    const query = `
    INSERT INTO public.cashflow_trade(trade_id, cashflow_id, user_id, trade_datetime, trade_category, transaction_type, trade_amount, remaining_amount, currency, trade_description, trade_note)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`;

    const params = [
      data.tradeId,
      data.cashflowId,
      data.userId,
      data.tradeDatetime,
      data.tradeCategory,
      data.transactionType,
      data.tradeAmount,
      data.remainingAmount,
      data.currency,
      data.tradeDescription,
      data.tradeNote,
    ];

    return executeOperation(query, params);
  } catch (error) {
    return { success: false, message: "新增失敗" };
  }
}

export async function updateCashFlowRecordData(data: ICashFlowRecordList) {
  const query = `
    UPDATE public.cashflow_trade SET trade_datetime=$1, trade_category=$2, transaction_type=$3, trade_amount=$4, remaining_amount=$5, trade_description=$6, trade_note=$7
    WHERE trade_id=$8 AND cashflow_id=$9 AND user_id=$10
  `;

  const params = [
    data.tradeDatetime,
    data.tradeCategory,
    data.transactionType,
    data.tradeAmount,
    data.remainingAmount,
    data.tradeDescription,
    data.tradeNote,
    data.tradeId,
    data.cashflowId,
    data.userId,
  ];

  return executeOperation(query, params);
}

export async function deleteCashFlowRecordData(data: ICashFlowRecordList) {
  try {
    const query = `DELETE FROM public.cashflow_trade
    WHERE trade_id = $1 AND cashflow_id = $2 AND user_id = $3`;
    const result = await pool.query(query, [data.tradeId, data.cashflowId, data.userId]);

    return result.rowCount === 1 ? { success: true, message: "刪除成功" } : { success: false, message: "刪除失敗" };
  } catch (error) {
    return { success: false, message: "刪除失敗" };
  }
}
