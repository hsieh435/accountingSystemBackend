import { Router } from "express";
import * as outSideWebApiControllers from "@/controllers/outSideWebApiControllers";



const router = Router();



router.get("/api/outSideWebApi/stockList", outSideWebApiControllers.getAllStockList);
router.get("/api/outSideWebApi/:code", outSideWebApiControllers.getEachStockList);
// router.post("/api/outSideWebApi/create", outSideWebApiControllers.create);
// router.put("/api/outSideWebApi/update", outSideWebApiControllers.update);
// router.delete("/api/outSideWebApi/:code", outSideWebApiControllers.remove);



export default router;
