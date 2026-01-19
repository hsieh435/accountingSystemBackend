import pool from "@/db";
import { keysToCamel } from "@/utils/tools";

// Helper function for update / insert operations
export async function executeSQLsyntax({
  query,
  params = [],
  isReturnArray = true,
  successMessage,
  errorMessage,
}: {
  query: string;
  params?: any;
  isReturnArray?: boolean;
  successMessage?: string;
  errorMessage?: string;
}): Promise<{ success: boolean; data?: any; message?: string; statusCode?: number }> {
  // console.log("Query executed:", query);
  console.log("Parameters:", params);
  try {
    const result = await pool.query(query, params);
    console.log("SQL Result:", result.rows);
    return {
      success: true,
      data: isReturnArray ? keysToCamel(result.rows) : keysToCamel(result.rows[0]),
      message: successMessage,
    };
  } catch (error) {
    return { success: false, message: errorMessage, data: [], statusCode: 404 };
  }
}



export async function testSQLsyntax() {

  const result = await pool.query(`
    SELECT trade_datetime AS tradeDatetime FROM cashflow_trade
    WHERE trade_datetime = '2025-12-14 19:30:00+08'
    UNION ALL
    SELECT trade_datetime AS tradeDatetime FROM cashflow_trade
    WHERE trade_datetime > '2025-12-14 19:30:00+08' AND NOT EXISTS (
    SELECT 1 FROM cashflow_trade WHERE trade_datetime = '2025-12-14 19:30:00+08'
    )`
  );

  // console.log("Test SQL Result:", result.rows);
}
