import express from "express";
import bodyParser from "body-parser";
import authRouter from "./router/authRoutes.js";

let port = 5174;

const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173'); // Or '*' for all origins (use with caution)
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});
// Middleware

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.use("/auth/api", authRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
