import { Request, Response } from "express";
const jwt = require("jsonwebtoken");



// Extend Express Request interface to include "user"
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}



// middleware 函式；參考網站：https://ithelp.ithome.com.tw/articles/10334612
export async function authenticateToken(req: Request, res: Response, next: Function) {
  // console.log("userTimezone:", Intl.DateTimeFormat().resolvedOptions().timeZone);

  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }


  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer token_value

  if (!token) return res.sendStatus(401); // 沒帶 token

  jwt.verify(token, JWT_SECRET, (err: any, user: string) => {

    if (err) return res.sendStatus(403); // token 無效或過期

    req.user = user; // 通過驗證，將解開的 user 設到 req
    req.body.userId = req.user.userId;
    // console.log("req.user:", req.user);
  });

  next();
}


export default authenticateToken;
