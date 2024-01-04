import express from "express";
import {
  createUser,
  loginUser,
  logoutUser,
  getAllUsers,
  getCurrentUserProfile,
  updateCurrentUserProfile,
  deleteUserById,
  getUserById,
  updateUserById,
  verifyEmail,
} from "../controllers/userController.js";
import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.post("/create", createUser);
router.post("/auth", loginUser);
router.post("/logout", logoutUser);
router.get("/", authenticate, authorizeAdmin, getAllUsers);
router.get("/profile", authenticate, getCurrentUserProfile);
router.get("/:id", authenticate, authorizeAdmin, getUserById);
router.get("/verify/:token", verifyEmail);
router.put("/profile", authenticate, updateCurrentUserProfile);
router.put("/update/:id", authenticate, authorizeAdmin, updateUserById);
router.delete("/delete/:id", authenticate, authorizeAdmin, deleteUserById);

export default router;
