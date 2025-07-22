import { Router } from "express";
import authenticateToken from "@/utils/authMiddleware";
import * as cashFlowControllers from "@/controllers/cashFlowControllers";



const router = Router();



router.post("/api/cashFlow/List", authenticateToken, cashFlowControllers.cashFlowList);
router.post("/api/cashFlow/create", authenticateToken, cashFlowControllers.cashFlowCreate);
router.put("/api/cashFlow/update", authenticateToken, cashFlowControllers.cashFlowUpdate);
router.delete("/api/cashFlow/delete/:cashflowId", authenticateToken, cashFlowControllers.cashFlowDelete);



export default router;
