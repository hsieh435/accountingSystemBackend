import { Router } from "express";
import authenticateToken from "@/utils/authMiddleware";
import * as userDataControllers from "@/controllers/userDataControllers";



const router = Router();



router.get("/public/api/userList", userDataControllers.userDataList);
router.post("/public/user/login", userDataControllers.userLogin);
router.post("/api/user/create", userDataControllers.userCreate);
router.post("/api/user/dataUpdate", authenticateToken, userDataControllers.userDataUpdate);



export default router;
