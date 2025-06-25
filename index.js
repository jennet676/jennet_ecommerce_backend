import express, { Router } from "express";
import bodyParser from "body-parser";
import router from "./router/jobRoutes.js";

const app = express();
const PORT = 3000;

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
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

//Employer actions CRUD & viewing users who applied to jobs
app.use("/jobs/api", router);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
