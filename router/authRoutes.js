import express from "express";
// const authController = require('../controllers/authController');
import { login, signup } from "../controllers/authController.js";
const router = express.Router();
router.post("/api", login);
router.post("/api", signup);

export default router;
