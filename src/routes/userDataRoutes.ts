import { Router } from "express";
import authenticateToken from "@/utils/authMiddleware";
import * as userDataControllers from "@/controllers/userDataControllers";



const router = Router();



router.post("/public/user/login", userDataControllers.userLogin);
router.post("/api/user/dataUpdate", authenticateToken, userDataControllers.userDataUpdate);
// router.post("/create", userDataControllers.create);
// router.put("/update", userDataControllers.update);
// router.delete("/:code", userDataControllers.remove);



export default router;
