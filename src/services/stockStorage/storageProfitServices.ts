import pool from "@/db";
import { keysToCamel, getCurrentTimestamp, getTimeStampWithZone } from "@/utils/tools";




export async function searchingStorageProfitList(stockAccountId: string, userId: string) {
  try {
    const result = await pool.query(
      `SELECT stock_account_id, user_id, stock_no, stock_name, storage_quantity, cost_per_stock, storage_cost
      FROM public.stock_storage_list
      WHERE stock_account_id = '${stockAccountId}' AND user_id = '${userId}'`,
    );
    return { success: true, data: keysToCamel(result.rows) };
  } catch {
    return { success: false, data: [] };
  }
}
