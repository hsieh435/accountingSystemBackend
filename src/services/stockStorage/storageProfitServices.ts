import pool from "@/db";
import { keysToCamel } from "@/utils/tools";



export async function getStockStorageList(data: { stockAccountId: string, userId: string }) {
  try {
  const result = await pool.query(
    `SELECT * FROM public.stock_storage_list
    WHERE stock_account_id LIKE '%${data.stockAccountId}%' AND user_id = '${data.userId}'`,
  );
  return { success: true, data: keysToCamel(result.rows) }

  } catch {
    return { success: false, data: [] };
  }
}



export async function searchingStorageProfitList(stockAccountId: string, userId: string) {
  // console.log("params:", stockAccountId, userId);

  try {
    const result = await pool.query(
      `SELECT
      ssl.stock_account_id,
      ssl.user_id,
      ssl.stock_no,
      ssl.stock_name,
      ssl.storage_quantity,
      json_agg(
        json_build_object(
          'stock_no', ssd.stock_no,
          'stock_name', ssd.stock_name,
          'trade_datetime', ssd.trade_datetime,
          'price_per_share', ssd.price_per_share,
          'quantity', ssd.quantity,
          'stock_total_price', ssd.stock_total_price,
          'handling_fee', ssd.handling_fee,
          'transaction_tax', ssd.transaction_tax,
          'trade_total_price', ssd.trade_total_price,
          'currency', ssd.currency
        )
      ) FILTER (WHERE ssd.stock_no IS NOT NULL) AS stock_storage_detail
      FROM public.stock_storage_list AS ssl
      LEFT JOIN stock_storage_detail AS ssd ON ssl.stock_account_id = ssd.account_id AND ssl.stock_no = ssd.stock_no
      WHERE ssl.stock_account_id = '${stockAccountId}' AND ssl.user_id = '${userId}'
      GROUP BY ssl.stock_account_id, ssl.user_id, ssl.stock_no`
    );

    return { success: true, data: keysToCamel(result.rows) };
  } catch {
    return { success: false, data: [] };
  }
}



export async function searchingStockSProfitDetail(data: { stockAccountId: string; userId: string; stockNo: string }) {

  try {
    const result = await pool.query(
      `SELECT * FROM public.stock_storage_detail
      WHERE account_id LIKE '%${data.stockAccountId}%' AND user_id = '${data.userId}' AND stock_no = '${data.stockNo}'
      ORDER BY trade_datetime`,
    );

    // console.log("data:", keysToCamel(result.rows));
    return { success: true, data: keysToCamel(result.rows) };
  } catch {
    return { success: false, data: [] };
  }
}
