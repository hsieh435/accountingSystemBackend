import { Request, Response } from "express";
import { success, error } from "@/utils/response";
import { keysToCamel } from "@/utils/tools";

// Helper function for consistent response handling
export async function handleControllersResponse(res: Response, req: Request, result: any, statusCode: number = 404) {
  console.log("Controller result:", result);
  if (result.success) {
    return res.status(200).json(
      success({
        returnCode: result.returnCode || 0,
        data: keysToCamel(result.data) || keysToCamel(result),
        message: result.message || "操作成功",
        req,
        res,
      }),
    );
  } else {
    return res.status(statusCode).json(
      error({
        returnCode: result.returnCode || -1,
        data: [],
        message: result.message || "操作失敗",
        req,
        res,
        statusCode: statusCode,
      }),
    );
  }
}


// 狀態碼設定參考
// https://www.explainthis.io/zh-hant/swe/http-status-code

// 2 開頭的狀態碼，表示請求已成功處理
// 200 OK：請求成功。
// 201 Created：請求成功且伺服器已創建了新的資源，通常在 POST 或 PUT 請求後返回，表示新資源已成功創建。
// 204 No Content：請求成功但伺服器未返回任何內容，通常在處理不需要返回數據的請求（如刪除操作）後使用。

// 3 開頭的狀態碼，表示請求需要重新轉導
// 301 Moved Permanently：請求的資源已永久移至新位置。客戶端應該使用新的 URL 來訪問資源。
// 302 Found：請求的資源已臨時移至新位置，客戶端應該使用當前的 URL 進行後續請求，但伺服器可能會在未來改變此位置。
// 304 Not Modified：用於緩存(HTTP caching)，告訴客戶端回應未被修改，因此客戶端可以繼續使用回應的相同緩存版本。

// 4 開頭的狀態碼，表示請求的錯誤源自於客戶端
// 400 Bad Request：請求無效，服務器無法理解請求的語法。
// 401 Unauthorized：請求未被授權。客戶端必須進行身份驗證以獲得請求資源的許可。
// 403 Forbidden：伺服器理解請求但拒絕執行。這通常表示客戶端無權訪問請求的資源。
// 404 Not Found：表示伺服器找不到客戶端請求的資源。

// 5 開頭的狀態碼，表示伺服器發生錯誤
// 500 Internal Server Error：伺服器內部錯誤。這是通用錯誤，表示伺服器遇到意外情況，無法完成請求。
// 501 Not Implemented：伺服器不支持請求的功能。
// 503 Service Unavailable：伺服器暫時無法處理請求。
