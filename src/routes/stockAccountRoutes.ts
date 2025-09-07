import { Router } from "express";
import authenticateToken from "@/utils/authMiddleware";
import * as stockAccountControllers from "@/controllers/stockAccount/stockAccountListControllers";
import * as stockAccountRecordControllers from "@/controllers/stockAccount/stockAccountRecordControllers";



const router = Router();



router.post("/api/stockAccount/list", authenticateToken, stockAccountControllers.stockAccountList);
router.get("/api/stockAccountData/:accountId", authenticateToken, stockAccountControllers.searchingStockAccountById);
router.post("/api/stockAccount/create", authenticateToken, stockAccountControllers.stockAccountCreate);
router.put("/api/stockAccount/update", authenticateToken, stockAccountControllers.stockAccountUpdate);
router.get("/api/stockAccount/enable/:accountId", authenticateToken, stockAccountControllers.enableStockAccount);
router.get("/api/stockAccount/disable/:accountId", authenticateToken, stockAccountControllers.disableStockAccount);
router.get("/api/stockAccount/delete/:accountId", authenticateToken, stockAccountControllers.stockAccountDelete);



router.post("/api/stockAccountRecord/list", authenticateToken, stockAccountRecordControllers.stockAccountRecordList);
router.post("/api/stockAccountRecordById", authenticateToken, stockAccountRecordControllers.searchingStockAccountRecordById);
router.post("/api/stockAccountRecord/create", authenticateToken, stockAccountRecordControllers.stockAccountRecordCreate);
router.post("/api/stockAccountRecord/update", authenticateToken, stockAccountRecordControllers.stockAccountRecordUpdate);
router.post("/api/stockAccountRecord/delete", authenticateToken, stockAccountRecordControllers.stockAccountRecordDelete);

export default router;
