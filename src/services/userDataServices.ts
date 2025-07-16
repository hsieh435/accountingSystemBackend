import pool from "@/db";
import { keysToCamel } from "@/utils/caseConverter";



export async function accountTesting(data: { userId: string; password: string }) {
  const result =
    await pool.query(`SELECT * FROM user_data WHERE user_id = '${data.userId}' AND user_password = '${data.password}'`);
  // console.log("result:", result.rows);
  if (result.rows.length === 1) {
    return true;
  } else {
    return false;
  }
};



export async function accountCreating(data: { userId: string; password: string }) {
  const result =
    await pool.query(`SELECT * FROM user_data WHERE user_id = '${data.userId}' AND user_password = '${data.password}'`);
  // console.log("result:", result.rows);
  if (result.rows.length === 1) {
    return true;
  } else {
    return false;
  }
};
