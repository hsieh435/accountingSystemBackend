import pool from "@/db";
import { keysToCamel } from "@/utils/tools";

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
