import { Router } from "express";
import * as userDataControllers from "@/controllers/userDataControllers";



const router = Router();



router.post("/public/user/login", userDataControllers.userLogin);
// router.get("/:code", userDataControllers.getOne);
// router.post("/create", userDataControllers.create);
// router.put("/update", userDataControllers.update);
// router.delete("/:code", userDataControllers.remove);



export default router;
