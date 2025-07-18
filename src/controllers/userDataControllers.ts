import { Request, Response } from "express";
import { success, error } from "@/utils/response";
import * as userDataServices from "@/services/userDataServices";



const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;



export async function userLogin(req: Request, res: Response) {
  // console.log("Request:", req.body);

  try {
    const { success: testingResult, userData: dataGot } = await userDataServices.loginTesting(req.body);
    // console.log("result:", testingResult);
    // console.log("dataGot:", dataGot);
    if (testingResult) {
      const token = jwt.sign({
        userId: dataGot.userId,
        userName: dataGot.userName
      },
        JWT_SECRET,
        { expiresIn: "10h" }
      );
      res.json(success({ data: { jwt: token }, message: "登入成功", req, res }));
    } else {
      res.json(error({ message: "帳號或密碼錯誤", req, res }));
    }
  } catch (err) {
    // console.error(err);
    res.json(error({ message: "Server error", req, res }));
  }
}



export async function userDataUpdate(req: Request, res: Response) {
  console.log("Request:", req.body);

  try {
    const result = await userDataServices.accountDataChange(req.body);
    if (result) {
      const token = jwt.sign({
        userId: req.body.userId,
        userName: req.body.userName
      },
        JWT_SECRET,
        { expiresIn: "10h" }
      );
      res.json(success({ data: { jwt: token }, message: "修改成功", req, res }));
    } else {
      res.json(error({ message: "修改失敗", req, res }));
    }
  } catch (err) {
    res.status(500).json(error({ message: "Server error", req, res }));
  }
}
