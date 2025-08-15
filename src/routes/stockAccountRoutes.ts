import { Router } from "express";
import authenticateToken from "@/utils/authMiddleware";
import * as stockAccountControllers from "@/controllers/stockAccount/stockAccountListControllers";



const router = Router();



router.post("/api/stockAccount/list", authenticateToken, stockAccountControllers.stockAccountList);
router.get("/api/stockAccountData/:stockAccountId", authenticateToken, stockAccountControllers.searchingStockAccountById);
router.post("/api/stockAccount/create", authenticateToken, stockAccountControllers.stockAccountCreate);
router.put("/api/stockAccount/update", authenticateToken, stockAccountControllers.stockAccountUpdate);
router.get("/api/stockAccount/enable/:stockAccountId", authenticateToken, stockAccountControllers.enableStockAccount);
router.get("/api/stockAccount/disable/:stockAccountId", authenticateToken, stockAccountControllers.disableStockAccount);
router.get("/api/stockAccount/delete/:stockAccountId", authenticateToken, stockAccountControllers.stockAccountDelete);



export default router;
