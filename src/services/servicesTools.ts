import pool from "@/db";
import { keysToCamel } from "@/utils/tools";



// Helper function for update/insert operations
export async function executeOperation(query: string, params: any[], successData?: any) {
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



export function handleDbError(error: any, message: string = "Database error", defaultData: any = []) {
  return { success: false, message: message, data: defaultData };
};
