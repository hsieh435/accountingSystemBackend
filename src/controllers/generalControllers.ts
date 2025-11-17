import { Request, Response } from "express";
import { error } from "@/utils/response";
import { handleControllersResponse } from "@/controllers/controllersTools";
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
      handleControllersResponse(res, req, { success: true, data: decoded, message: "驗證成功" });
    });
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}
