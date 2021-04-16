import { Router } from "express";
const router = Router();
import {
  register,
  login,
  refreshToken,
  logout,
} from "../controllers/authController";

router.post("/login", login);
router.post("/register", register);
router.post("/refresh-token", refreshToken);
router.delete("/logout", logout);

export default router;
