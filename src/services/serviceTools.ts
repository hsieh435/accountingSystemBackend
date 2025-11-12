import pool from "@/db";
import { setTimezone } from "@/utils/tools";



export async function getLatestTradeRecordDateTime(tableName: string, columnName: string, flowId: string) {
  console.log(tableName, columnName);
  const result = await pool.query(`SELECT MAX(${columnName}) AS latest_datetime FROM ${tableName} WHERE cashflow_id = '${flowId}'`);
  console.log("result:", result);
  const latestTradeDateTime = setTimezone(result.rows[0]?.latest_datetime);
  // console.log("latestTradeDateTime:", latestTradeDateTime);
  return latestTradeDateTime;
}



type updateRemainingAmountParams = {
  tableName: string;
  columnName: string;
  amountDifference: number;
  startDateTime: string;
  endDateTime: string;
};

export async function updateRemainingAmount({
  tableName,
  columnName,
  amountDifference,
  startDateTime,
  endDateTime,
}: updateRemainingAmountParams) {

  // remaining_amount
  // trade_datetime
  try {
    const updateResult = await pool.query(`
      UPDATE ${tableName} SET ${columnName} = ${columnName} + ${amountDifference}
      WHERE trade_datetime BETWEEN '${startDateTime}' AND '${endDateTime}'
    `);

    console.log("updateResult:", updateResult);
    return { success: true};
  } catch (error) {
    return { success: false};
  }
}
