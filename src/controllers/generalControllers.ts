import { Request, Response } from "express";
import { success, error } from "@/utils/response";
const jwt = require("jsonwebtoken");



export async function jwtVerify(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json(error({ message: "No token provided", req, res }));
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET as string;

    jwt.verify(token, secret, (err: Error | null, decoded: object | undefined) => {
      // decoded 是指 成功解碼（驗證）後的 JWT 內容
      // iat：token 建立的時間（UNIX timestamp）
      // exp：token過期時間（UNIX timestamp）
      // console.log("decoded:", decoded);

      if (err) {
        return res.status(403).json(error({ message: "Invalid token", req, res }));
      }
      res.json(success({ data: decoded, req, res }));
    });
  } catch (err) {
    res.status(500).json(error({ message: "Server error", req, res }));
  }
};
