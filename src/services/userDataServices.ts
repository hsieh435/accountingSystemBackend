import pool from "@/db";
import { keysToCamel } from "@/utils/caseConverter";



export async function loginTesting(data: { userId: string; password: string }) {
  const searchingUserResult =
    await pool.query(`SELECT * FROM user_data WHERE user_id = "${data.userId}" AND user_password = "${data.password}"`);
  // console.log("searchingUserResult:", searchingUserResult.rows);
  if (searchingUserResult.rows.length === 1) {
    return { success: true, userData: keysToCamel(searchingUserResult.rows[0]) };
  } else {
    return { success: false, userData: [] };
  }
};



export async function accountDataChange(data: { userId: string; userName: string; userOldPassword: string; userNewPassword: string }) {
  // console.log("data:", data);

  const userDataUpdateResult =
    await pool.query(`UPDATE user_data SET user_name="${data.userName}", user_password="${data.userNewPassword}" WHERE user_id="${data.userId}"`);
  // console.log("userDataUpdateResult:", userDataUpdateResult);
  if (userDataUpdateResult.rowCount === 1) {
    return true;
  } else {
    return false;
  }
};
