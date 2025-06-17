// import jwt from "jsonwebtoken";
import { loginUser, signupUser } from "../services/authService.js";

export const login =  (req, res) => {
  const { username, password } = req.body;
  // indi bolsa ulanyjyny barlamaly :şu ýerde username we password bilen ulanyjy bar bolsa, result true bolýar bolmasa false bolýar şeýlede ol : serwis ulanmaly(ýada serwisiňiňem loginUser diýen funksiýasyny ulanýas)
  const result =  loginUser(username, password);
  // loginUser funksiýasyny import etmeli

  // result.success true bolsa, token we user details berip bolýa, bolmasa bolsa res.status(401).json({ message: 'Invalid credentials' }) diýmeli
  if (result.success) {
    return res.status(200).json({
      message: "Login successful",
      token: result.token,
      userDetails: result.details,
    });
  } else {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Eger-de ulanyjy bar bolsa, result.success true bolýar, şeýlede token we user details berip bolýa
  // soňra diňeje result.success true bolsa res.status(200).json({ message: 'Login successful' }) diýmeli, bolmasa res.status(401).json({ message: 'Invalid credentials' }) diýmeli
};
export const signup =  (req, res) => {
  // registrasiýa etýän service bar
  const result =  signupUser(username, password, role);
  if (result.success) {
    res.status(201).json({ message: "Registration successful!" });
  } else {
    res.status(400).json({ message: result.message });
  }
  // service-niň jogybyndaky result-yň success-i true bolsa 201 bolmasada 400
};
