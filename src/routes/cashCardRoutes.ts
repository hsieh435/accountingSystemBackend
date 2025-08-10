import { Router } from "express";
import authenticateToken from "@/utils/authMiddleware";
import * as cashDataControllers from "@/controllers/cashCardControllers";



const router = Router();



router.post("/api/cashCard/List", authenticateToken, cashDataControllers.cashDataList);
router.get("/api/cashCardData/:cashCardId", authenticateToken, cashDataControllers.searchingCashCardById);
router.post("/api/cashCard/create", authenticateToken, cashDataControllers.cashDataCreate);
router.put("/api/cashCard/update", authenticateToken, cashDataControllers.cashDataUpdate);
router.get("/api/cashCard/delete/:cashCardId", authenticateToken, cashDataControllers.cashDataDelete);



export default router;
