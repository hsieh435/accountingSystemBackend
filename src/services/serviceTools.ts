import pool from "@/db";
import { setTimezone } from "@/utils/tools";

function sanitizeIdentifier(name: string): string {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
    throw new Error(`Invalid identifier: ${name}`);
  }
  return name;
}

export async function getLatestTradeRecordDateTime(
  tableName: string,
  flowColumn: string,
  flowId: string,
): Promise<any> {
  const table = sanitizeIdentifier(tableName);
  const column = sanitizeIdentifier(flowColumn);

  try {
    const result =
      await pool.query(`SELECT MAX(trade_datetime) AS latestTradeDatetime FROM ${table} WHERE ${column} = $1`, [flowId]);
    const latestTradeDatetime = result.rows[0].latesttradedatetime || null;

    return latestTradeDatetime;
  } catch (err) {
    throw err;
  }
}

export async function updateRemainingAmount(
  tableName: string,
  columnName: string,
  amountDifference: number,
  startDateTime: string,
  endDateTime: string,
) {
  const table = sanitizeIdentifier(tableName);
  const col = sanitizeIdentifier(columnName);

  try {
    const sql = `
      UPDATE ${table}
      SET ${col} = ${col} + $1
      WHERE trade_datetime BETWEEN $2 AND $3
    `;
    const result = await pool.query(sql, [amountDifference, startDateTime, endDateTime]);
    return { success: true, rowCount: result.rowCount };
  } catch (error) {
    return { success: false, error };
  }
}
