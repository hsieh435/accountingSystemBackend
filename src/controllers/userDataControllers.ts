import { Request, Response } from "express";
import { success, error } from "@/utils/response";
import * as userDataServices from "@/services/userDataServices";



const jwt = require("jsonwebtoken");
const SECRET_KEY = 'your-secret-key';



export async function userLogin(req: Request, res: Response) {
  // console.log("Request:", req.body);

  try {
    const result = await userDataServices.accountTesting(req.body);
    // console.log("result:", result);
    if (result) {
      const token = jwt.sign({ id: req.body.id, username: req.body.username }, SECRET_KEY, { expiresIn: "10h" });
      res.json(success({ data: { jwt: token }, message: "登入成功" }));
    } else {
      res.json(error({ message: "帳號或密碼錯誤" }));
    }
  } catch (err) {
    // console.error(err);
    res.json(error({ message: "Server error" }));
  }
}

