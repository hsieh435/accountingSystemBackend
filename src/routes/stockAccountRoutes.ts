import { Router } from "express";
import authenticateToken from "@/utils/authMiddleware";
import * as stockAccountControllers from "@/controllers/stockAccountControllers";



const router = Router();



router.post("/api/stockAccount/List", authenticateToken, stockAccountControllers.stockAccountList);
router.get("/api/stockAccountData/:stockAccountId", authenticateToken, stockAccountControllers.searchingStockAccountById);
router.post("/api/stockAccount/create", authenticateToken, stockAccountControllers.stockAccountCreate);
router.put("/api/stockAccount/update", authenticateToken, stockAccountControllers.stockAccountUpdate);
router.get("/api/stockAccount/delete/:stockAccountId", authenticateToken, stockAccountControllers.stockAccountDelete);



export default router;
