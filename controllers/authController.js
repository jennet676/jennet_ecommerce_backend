import jwt from "jsonwebtoken";
import { loginUser, signupUser } from "../services/authService.js";

export const login = (req, res) => {
  const { username, password } = req.body;
  loginUser(username, password).then((result) => {
    if (result.success) {
      return res.status(200).json({
        message: "Login successful",
        token: result.token,
        userDetails: result.details,
      });
    } else {
      return res.status(401).json({ message: result.message });
    }
  });
};
export const signup = (req, res) => {
  // registrasiýa etýän service bar
  const { username, password, role } = req.body;
  console.log("req body:", req.body);

   signupUser(username, password, role).then((result) => {
    console.log("result from signupUser:", result);
    if (result.success) {
      res.status(201).json({ message: result.message });
    } else {
      res.status(400).json({ message: result.message });
    }
  });
  // console.log('result:', result);

  // service-niň jogybyndaky result-yň success-i true bolsa 201 bolmasada 400
};
