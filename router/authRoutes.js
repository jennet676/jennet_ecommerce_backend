import express from "express";
import { login, signup } from "../controllers/authController.js";

import {
  userLoginSchema,
  userSignupSchema,
} from "../validation/authValidation.js";
const router = express.Router();
router.post(
  "/login",
  (req, res, next) => {
    const { error } = userLoginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    next();
  },
  login
);
router.post(
  "/signup",
  (req, res, next) => {
    const { error } = userSignupSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    next();
  },
  signup
);

export default router;
