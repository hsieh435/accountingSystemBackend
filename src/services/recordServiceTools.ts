import pool from "@/db";
import { setTimezone } from "@/utils/tools";

export interface IOriData {
  oriTradeDatetime: string;
  oriTradeAmount: number;
  oriRemainingAmount: number;
  oriTransactionType: string;
}

function sanitizeIdentifier(name: string): string {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
    throw new Error(`Invalid identifier: ${name}`);
  }
  return name;
}

export async function latestTradeDateTimeDetect(
  tableName: string,
  flowColumn: string,
  flowId: string,
  recordTradeDatetime: string,
  amountDifference: number,
): Promise<any> {
  const table = sanitizeIdentifier(tableName);
  const column = sanitizeIdentifier(flowColumn);

  try {
    const result = await pool.query(
      `SELECT MAX(trade_datetime) AS latestTradeDatetime FROM ${table} WHERE ${column} = '${flowId}'`,
    );
    const latestTradeDatetime = setTimezone(result.rows[0].latesttradedatetime || null);
    const dataTradeDatetime = setTimezone(recordTradeDatetime);
    // console.log("latestTradeDatetime:", latestTradeDatetime);
    // console.log("dataTradeDatetime:", dataTradeDatetime);

    if (latestTradeDatetime > dataTradeDatetime) {
      // console.log("table:", table);
      // console.log("recordTradeDatetime:", recordTradeDatetime);
      // console.log("column:", column);
      // console.log("flowId:", flowId);

      try {
        const result = await pool.query(
          `SELECT * FROM ${table} WHERE trade_datetime = '${recordTradeDatetime}' AND ${column} = '${flowId}'`
        );
        if (result.rows.length === 1) {
          return { success: false, message: "時間點重複" };
        } else if ((result.rows = [])) {
          // console.log(100);
          // return { success: true };
          // await updateRemainingAmount(
          //   tableName,
          //   "remaining_amount",
          //   100,
          //   dataTradeDatetime,
          //   latestTradeDatetime,
          // )

          try {
            const result = await pool.query(`UPDATE ${table}
              SET remaining_amount = remaining_amount + ${amountDifference}
              WHERE trade_datetime BETWEEN ${dataTradeDatetime} AND ${latestTradeDatetime}
            `);
            return { success: true, rowCount: result.rowCount };
          } catch (error) {
            return { success: false, error };
          }
        }
      } catch (error) {
        return { success: false, error };
      }
    } else if (latestTradeDatetime === dataTradeDatetime) {
      console.log("dataTradeDatetime:", dataTradeDatetime);
      return { success: false, message: "時間點重複" };
    } else if (!latestTradeDatetime || latestTradeDatetime < dataTradeDatetime) {
      // console.log(300);
      return { success: true };
    }
  } catch (err) {
    throw err;
  }
}

export async function updateRemainingAmount(
  tableName: string,
  remainingAmountColumnName: string,
  amountDifference: number,
  startDateTime: string,
  endDateTime: string,
) {
  const table = sanitizeIdentifier(tableName);
  const remainingAmountColumn = sanitizeIdentifier(remainingAmountColumnName);

  try {
    const sql = `
      UPDATE ${table}
      SET ${remainingAmountColumn} = ${remainingAmountColumn} + $1
      WHERE trade_datetime BETWEEN $2 AND $3
    `;
    const result = await pool.query(sql, [amountDifference, startDateTime, endDateTime]);
    return { success: true, rowCount: result.rowCount };
  } catch (error) {
    return { success: false, error };
  }
}
