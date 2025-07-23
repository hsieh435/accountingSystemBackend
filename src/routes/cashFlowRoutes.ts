import { Router } from "express";
import authenticateToken from "@/utils/authMiddleware";
import * as cashFlowControllers from "@/controllers/cashFlowControllers";



const router = Router();



router.post("/api/cashFlow/List", authenticateToken, cashFlowControllers.cashFlowList);
router.get("/api/cashFlowData/:cashflowId", authenticateToken, cashFlowControllers.searchingCashFlowById);
router.post("/api/cashFlow/create", authenticateToken, cashFlowControllers.cashFlowCreate);
router.put("/api/cashFlow/update", authenticateToken, cashFlowControllers.cashFlowUpdate);
router.get("/api/cashFlow/delete/:cashflowId", authenticateToken, cashFlowControllers.cashFlowDelete);



export default router;
