import { Router } from "express";
import authenticateToken from "@/utils/authMiddleware";
import * as tradeController from "@/controllers/tradeCategoryControllers";



const router = Router();



router.get("/api/tradeCategory/list", authenticateToken, tradeController.getAll);
router.get("/api/tradeCategory/:code", authenticateToken, tradeController.getOne);
router.post("/api/tradeCategory/create", authenticateToken, tradeController.create);
router.put("/api/tradeCategory/update", authenticateToken, tradeController.update);
router.delete("/api/tradeCategory/:code", authenticateToken, tradeController.remove);



export default router;
