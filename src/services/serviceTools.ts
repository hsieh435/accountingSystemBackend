import pool from "@/db";
import { setTimezone } from "@/utils/tools";



export async function getLatestTradeRecordDateTime(tableName: string, columnName: string): Promise<any> {
  return setTimezone(
    (await pool.query(`SELECT MAX(${columnName}) AS latest_datetime FROM ${tableName}`)).rows[0]
      ?.latest_datetime,
  );
}



export async function updateRemainingAmount(tableName: string, columnName: string, amountDifference: number, tradeId: string, startDateTime: string, endDateTime: string) {

  // remaining_amount
  // trade_datetime
  try {
    const query = `
      UPDATE ${tableName} SET ${columnName} = ${columnName} + ${amountDifference}
      WHERE trade_datetime BETWEEN '${startDateTime}' AND '${endDateTime}'
    `;
    // const result = await pool.query(query, [`%${data.currencyId}%`, data.userId]);
    return { success: true};
  } catch (error) {
    return { success: false};
  }
}
