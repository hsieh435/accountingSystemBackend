import { Router } from "express";
import authenticateToken from "@/utils/authMiddleware";
import * as storageProfitControllers from "@/controllers/stockStorage/storageProfitControllers";



const router = Router();
router.get("/api/stockStorage/profit/list/:stockAccountId", authenticateToken, storageProfitControllers.storageProfitList);

export default router;
