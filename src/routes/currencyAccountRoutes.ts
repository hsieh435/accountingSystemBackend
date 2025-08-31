import { Router } from "express";
import authenticateToken from "@/utils/authMiddleware";
import * as currencyAccountControllers from "@/controllers/currencyAccount/currencyAccountListControllers";

const router = Router();

router.post("/api/currencyAccount/list", authenticateToken, currencyAccountControllers.currencyAccountList);
router.get("/api/currencyAccountData/:accountId", authenticateToken, currencyAccountControllers.searchingCurrencyAccountById);
router.post("/api/currencyAccount/create", authenticateToken, currencyAccountControllers.currencyAccountCreate);
router.put("/api/currencyAccount/update", authenticateToken, currencyAccountControllers.currencyAccountUpdate);
router.get("/api/currencyAccount/enable/:accountId", authenticateToken, currencyAccountControllers.enableCurrencyAccount);
router.get("/api/currencyAccount/disable/:accountId", authenticateToken, currencyAccountControllers.disableCurrencyAccount);
router.get("/api/currencyAccount/delete/:accountId", authenticateToken, currencyAccountControllers.currencyAccountDelete);

export default router;
