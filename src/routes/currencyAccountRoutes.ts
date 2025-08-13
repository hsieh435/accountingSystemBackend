import { Router } from "express";
import authenticateToken from "@/utils/authMiddleware";
import * as currencyAccountControllers from "@/controllers/currencyAccountControllers";



const router = Router();



router.post("/api/currencyAccount/List", authenticateToken, currencyAccountControllers.currencyAccountList);
router.get("/api/currencyAccountData/:currencyAccountId", authenticateToken, currencyAccountControllers.searchingCurrencyAccountById);
router.post("/api/currencyAccount/create", authenticateToken, currencyAccountControllers.currencyAccountCreate);
router.put("/api/currencyAccount/update", authenticateToken, currencyAccountControllers.currencyAccountUpdate);
router.get("/api/currencyAccount/delete/:currencyAccountId", authenticateToken, currencyAccountControllers.currencyAccountDelete);
router.get("/api/currencyAccount/enable/:currencyAccountId", authenticateToken, currencyAccountControllers.enableCurrencyAccount);
router.get("/api/currencyAccount/disable/:currencyAccountId", authenticateToken, currencyAccountControllers.disableCurrencyAccount);



export default router;
