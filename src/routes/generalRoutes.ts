import { Router } from "express";
import authenticateToken from "@/utils/authMiddleware";
import * as generalControllers from "@/controllers/generalControllers";



const router = Router();



router.post("/api/jwt/verification", authenticateToken, generalControllers.jwtVerify);



export default router;
