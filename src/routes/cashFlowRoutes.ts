import { Router } from "express";
import authenticateToken from "@/utils/authMiddleware";
import * as cashFlowListControllers from "@/controllers/cashFlow/cashFlowListControllers";
import * as cashFlowRecordControllers from "@/controllers/cashFlow/cashFlowRecordControllers";



const router = Router();



router.post("/api/cashFlow/List", authenticateToken, cashFlowListControllers.cashFlowList);
router.get("/api/cashFlowData/:cashflowId", authenticateToken, cashFlowListControllers.searchingCashFlowById);
router.post("/api/cashFlow/create", authenticateToken, cashFlowListControllers.cashFlowCreate);
router.put("/api/cashFlow/update", authenticateToken, cashFlowListControllers.cashFlowUpdate);
router.get("/api/cashFlow/delete/:cashflowId", authenticateToken, cashFlowListControllers.cashFlowDelete);



export default router;
