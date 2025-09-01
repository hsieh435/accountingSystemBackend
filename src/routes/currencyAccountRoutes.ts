import { Router } from "express";
import authenticateToken from "@/utils/authMiddleware";
import * as currencyAccountControllers from "@/controllers/currencyAccount/currencyAccountListControllers";
import * as currencyAccountRecordControllers from "@/controllers/currencyAccount/currencyAccountRecordControllers";

const router = Router();

router.post("/api/currencyAccount/list", authenticateToken, currencyAccountControllers.currencyAccountList);
router.get("/api/currencyAccountData/:accountId", authenticateToken, currencyAccountControllers.searchingCurrencyAccountById);
router.post("/api/currencyAccount/create", authenticateToken, currencyAccountControllers.currencyAccountCreate);
router.put("/api/currencyAccount/update", authenticateToken, currencyAccountControllers.currencyAccountUpdate);
router.get("/api/currencyAccount/enable/:accountId", authenticateToken, currencyAccountControllers.enableCurrencyAccount);
router.get("/api/currencyAccount/disable/:accountId", authenticateToken, currencyAccountControllers.disableCurrencyAccount);
router.get("/api/currencyAccount/delete/:accountId", authenticateToken, currencyAccountControllers.currencyAccountDelete);


router.post("/api/currencyAccountRecord/list", authenticateToken, currencyAccountRecordControllers.currencyAccountRecordList);
router.post("/api/currencyAccountRecordById", authenticateToken, currencyAccountRecordControllers.searchingCurrencyAccountRecordById);
router.post("/api/currencyAccountRecord/create", authenticateToken, currencyAccountRecordControllers.currencyAccountRecordCreate);
router.post("/api/currencyAccountRecord/update", authenticateToken, currencyAccountRecordControllers.currencyAccountRecordUpdate);
router.post("/api/currencyAccountRecord/delete", authenticateToken, currencyAccountRecordControllers.currencyAccountRecordDelete);

export default router;
