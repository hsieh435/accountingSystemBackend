import { Router } from "express";
import authenticateToken from "@/utils/authMiddleware";
import * as userDataControllers from "@/controllers/userDataControllers";



const router = Router();



router.get("/api/userList", userDataControllers.userDataList);
router.post("/public/user/login", userDataControllers.userLogin);
router.post("/api/user/dataUpdate", authenticateToken, userDataControllers.userDataUpdate);
router.post("/api/user/create", userDataControllers.userCreate);



export default router;
