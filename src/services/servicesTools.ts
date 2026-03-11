import pool from "@/db";
import type { PoolClient } from "pg";
import { keysToCamel } from "@/utils/tools";

// Helper function for update / insert operations
export async function executeSQLsyntax({
  query,
  params = [],
  isReturnArray = true,
  successMessage = "成功",
  errorMessage = "失敗",
  isTesting = false,
  client,
}: {
  query: string;
  params?: any;
  isReturnArray?: boolean;
  successMessage?: string;
  errorMessage?: string;
  isTesting?: boolean;
  client?: PoolClient;
}): Promise<{ success: boolean; data?: any; message?: string; statusCode?: number }> {
  console.log("Query executed:", query);
  // console.log("Parameters:", params);

  if (isTesting === true) {
    return { success: true, data: [], message: "測試成功" };
  }

  try {
    const queryExecutor = client ?? pool;
    const sqlExecuteResult = await queryExecutor.query(query, params);
    // console.log("SQL Result:", sqlExecuteResult);
    console.log("SQL Result:", sqlExecuteResult.rows);
    // console.log("SQL command:", sqlExecuteResult.command);
    // console.log("SQL rowCount:", sqlExecuteResult.rowCount);


    if (sqlExecuteResult.command === "DELETE") {
      return {
        success: (sqlExecuteResult.rowCount ?? 0) > 0,
        data: [],
        message: (sqlExecuteResult.rowCount ?? 0) > 0 ? successMessage : errorMessage,
      };
    } else if (sqlExecuteResult.command === "") {
      return {
        success: (sqlExecuteResult.rowCount ?? 0) > 0,
        data: [],
        message: (sqlExecuteResult.rowCount ?? 0) > 0 ? successMessage : errorMessage,
      };
    } else {
      return {
        success: true,
        data: isReturnArray ? keysToCamel(sqlExecuteResult.rows) : keysToCamel(sqlExecuteResult.rows[0]),
        message: successMessage,
      };
    }

  } catch (error) {
    // console.error("SQL Execution Error:", error);
    return { success: false, message: isTesting ? "測試失敗" : errorMessage, data: [], statusCode: 404 };
  }
}



export async function testSQLsyntax() {

  const sqlExecuteResult = await pool.query(`
    SELECT trade_datetime AS tradeDatetime FROM cashflow_trade
    WHERE trade_datetime = '2025-12-14 19:30:00+08'
    UNION ALL
    SELECT trade_datetime AS tradeDatetime FROM cashflow_trade
    WHERE trade_datetime > '2025-12-14 19:30:00+08' AND NOT EXISTS (
    SELECT 1 FROM cashflow_trade WHERE trade_datetime = '2025-12-14 19:30:00+08'
    )`);

  // console.log("Test SQL:", sqlExecuteResult.rows);
}
