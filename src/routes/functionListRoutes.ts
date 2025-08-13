import { Router } from "express";
import authenticateToken from "@/utils/authMiddleware";
import * as functionListControllers from "@/controllers/functionListControllers";



const router = Router();



router.get("/api/functionList", authenticateToken, functionListControllers.functionListSearching);



export default router;
