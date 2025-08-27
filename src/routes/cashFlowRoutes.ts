import { Router } from "express";
import authenticateToken from "@/utils/authMiddleware";
import * as cashFlowListControllers from "@/controllers/cashFlow/cashFlowListControllers";
import * as cashFlowRecordControllers from "@/controllers/cashFlow/cashFlowRecordControllers";

const router = Router();

router.post("/api/cashFlow/list", authenticateToken, cashFlowListControllers.cashFlowList);
router.get("/api/cashFlowData/:cashflowId", authenticateToken, cashFlowListControllers.searchingCashFlowById);
router.post("/api/cashFlow/create", authenticateToken, cashFlowListControllers.cashFlowCreate);
router.put("/api/cashFlow/update", authenticateToken, cashFlowListControllers.cashFlowUpdate);
router.get("/api/cashFlow/enable/:cashflowId", authenticateToken, cashFlowListControllers.enableCashFlow);
router.get("/api/cashFlow/disable/:cashflowId", authenticateToken, cashFlowListControllers.disableCashFlow);
router.get("/api/cashFlow/delete/:cashflowId", authenticateToken, cashFlowListControllers.cashFlowDelete);



router.post("/api/cashFlowRecord/list", authenticateToken, cashFlowRecordControllers.cashFlowRecordList);
router.post("/api/cashFlowRecord", authenticateToken, cashFlowRecordControllers.searchingCashFlowRecordById);
router.post("/api/cashFlowRecord/create", authenticateToken, cashFlowRecordControllers.cashFlowRecordCreate);
router.post("/api/cashFlowRecord/update", authenticateToken, cashFlowRecordControllers.cashFlowRecordUpdate);

export default router;
