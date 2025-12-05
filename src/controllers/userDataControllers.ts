import pool from "@/db";
import { Request, Response } from "express";
import * as userDataServices from "@/services/userData/userDataServices";
import { handleControllersResponse } from "@/controllers/controllersTools";

const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

export async function userDataList(req: Request, res: Response) {
  try {
    const result = await pool.query("SELECT * FROM user_data");
    // console.log("result:", result);
    await handleControllersResponse(res, req, { success: true, data: result.rows });
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}

export async function userLogin(req: Request, res: Response) {
  // console.log("Request:", req.body);

  try {
    const result = await userDataServices.loginTesting(req.body);
    console.log("result:", result);
    if (result.success) {
      const token = jwt.sign(
        {
          userId: result.data.userId,
          userName: result.data.userName,
        },
        JWT_SECRET,
        { expiresIn: "10h" },
      );
      await handleControllersResponse(res, req, { success: true, data: { jwt: token }, message: "登入成功" });
    } else {
      await handleControllersResponse(res, req, { success: false, message: "帳號或密碼錯誤" }, 500);
    }
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}

export async function userCreate(req: Request, res: Response) {
  // console.log("Request:", req.body);

  try {
    const result = await userDataServices.createUser(req.body);

    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}

export async function userDataUpdate(req: Request, res: Response) {
  // console.log("Request:", req.body);

  try {
    const result = await userDataServices.accountDataChange(req.body);
    if (result) {
      const token = jwt.sign(
        {
          userId: req.body.userId,
          userName: req.body.userName,
        },
        JWT_SECRET,
        { expiresIn: "10h" },
      );
      await handleControllersResponse(res, req, { success: true, data: { jwt: token }, message: "修改成功" });
    } else {
      await handleControllersResponse(res, req, { message: "修改失敗"}, 500);
    }
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}
