import { Router } from "express";
import * as tradeController from "./../controllers/tradeCategoryControllers";



const router = Router();



router.get("/", tradeController.getAll);
router.get("/:code", tradeController.getOne);
router.post("/", tradeController.create);
router.put("/:code", tradeController.update);
router.delete("/:code", tradeController.remove);



export default router;
