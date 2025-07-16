import { Router } from "express";
import * as tradeController from "@/controllers/tradeCategoryControllers";



const router = Router();



router.get("/api/tradeCategory/list", tradeController.getAll);
router.get("/api/tradeCategory/:code", tradeController.getOne);
router.post("/api/tradeCategory/create", tradeController.create);
router.put("/api/tradeCategory/update", tradeController.update);
router.delete("/api/tradeCategory/:code", tradeController.remove);



export default router;
