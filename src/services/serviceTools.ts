import pool from "@/db";
import { setTimezone } from "@/utils/tools";



export async function getLatestTradeRecordDateTime(tableName: string, columnName: string): Promise<any> {
  return setTimezone(
    (await pool.query(`SELECT MAX(${columnName}) AS latest_datetime FROM ${tableName}`)).rows[0]
      ?.latest_datetime,
  );
}
