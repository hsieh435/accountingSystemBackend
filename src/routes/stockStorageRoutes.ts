import { Router } from "express";
import authenticateToken from "@/utils/authMiddleware";
import * as storageProfitControllers from "@/controllers/stockStorage/storageProfitControllers";



const router = Router();
router.post("/api/stockStorageList", authenticateToken, storageProfitControllers.storageProfitDataList);
router.get("/api/stockStorage/profitList/:stockAccountId", authenticateToken, storageProfitControllers.storageProfitList);
router.post("/api/stockStorage/profit/StockNo", authenticateToken, storageProfitControllers.eachStorageProfitData);

export default router;
