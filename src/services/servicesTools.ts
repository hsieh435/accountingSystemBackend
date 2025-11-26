import pool from "@/db";
import { keysToCamel } from "@/utils/tools";
import { asyncWrapProviders } from "async_hooks";

// Helper function for update / insert operations
export async function executeSQLsyntax({
  query,
  params = [],
  successData,
  successMessage,
  errorMessage,
}: {
  query: string;
  params?: any;
  successData?: any;
  successMessage?: string;
  errorMessage?: string;
}): Promise<{ success: boolean; data?: any; message?: string; statusCode?: number }> {
  try {
    const result = await pool.query(query, params);
    // console.log("Query executed:", query);
    // console.log("Parameters:", params);
    // console.log("SQL Result:", result);
    return {
      success: true,
      data: successData ? keysToCamel(successData) : keysToCamel(result.rows),
      message: successMessage,
    };
  } catch (error) {
    return handleDbError(errorMessage);
  }
}

export function handleDbError(message: string = "Database error") {
  return { success: false, message: message, data: [], statusCode: 404 };
}


export async function testSQLsyntax() {

  const result = await pool.query(`SELECT trade_datetime AS tradeDatetime FROM cashflow_trade
    WHERE trade_datetime = '2025-12-14 19:30:00+08'
    UNION ALL
    SELECT trade_datetime AS tradeDatetime FROM cashflow_trade
    WHERE trade_datetime > '2025-12-14 19:30:00+08' AND NOT EXISTS (
    SELECT 1 FROM cashflow_trade WHERE trade_datetime = '2025-12-14 19:30:00+08'
    )`
  );

  // console.log("Test SQL Result:", result.rows);
}
