import { Router } from "express";
import * as tradeController from "@/controllers/tradeCategoryControllers";



const router = Router();



router.get("/list", tradeController.getAll);
router.get("/:code", tradeController.getOne);
router.post("/create", tradeController.create);
router.post("/update", tradeController.update);
router.delete("/:code", tradeController.remove);



export default router;
