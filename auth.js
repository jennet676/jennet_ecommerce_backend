import express from "express";
import bodyParser from "body-parser";
import authRouter from "./router/authRoutes.js";

let port = 5173;

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.use("/auth/api", authRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
