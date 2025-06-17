import jwt from "jsonwebtoken";
import express from "express";
import bodyParser from "body-parser";
import "dotenv/config";
import bcrypt from "bcryptjs";
import pg from "pg";
import authRouter from "./router/authRoutes.js";
 


let port = 5173;

const app = express();
const db = new pg.Client({
  user: "postgres",

  host: "localhost",

  database: "job board project",

  password: "serdar090704",

  port: 5432,
});

// bcrypt.hash("serdar090704", 10, (err, hash) => {
//   if (err) {
//     console.error("Error hashing password:", err);
//   } else {
//     console.log("Hashed password:", hash);
//     bcrypt.compare("serdar090704", hash, (err, result) => {
//       if (err) {
//         console.error("Error comparing password:", err);
//       } else {
//         console.log("Password match:", result);
//       }
//     });
//   }
// });

db.connect();
// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

let users = {};

///////////////////////////////////////////////////
/////////////// MY SIGNUP API START ///////////////
///////////////////////////////////////////////////


/*
app.post("/api/signup", async (req, res) => {
  const { username, password, role } = req.body;
  // console.log("Request body:", req.body);

  if (!username || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }
  if (typeof username !== "string" || typeof password !== "string") {
    return res.status(400).json({
      message: "Username and password must be strings",
    });
  }
  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters long" });
  }

  if (role !== "job_seeker" && role !== "employer") {
    return res
      .status(400)
      .json({ message: "Role must be job_seeker or empleyer" });
  }
  if (username.length < 3 || username.length > 20) {
    return res
      .status(400)
      .json({ message: "Username must be between 3 and 20 characters long" });
  }

  //filter users to check if the user already exists

  const result = await db.query(
    `SELECT * FROM public.users WHERE name = $1  AND role = $2`,
    [username, role]
  );
  const users = result.rows;
  // Check if the user already exists

  for (const user of users) {
    let bcryptPassComparingResult = await bcrypt.compare(
      password,
      user.passhash
    );
    if (bcryptPassComparingResult) {
      return res.status(400).json({ message: "User already exists" });
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Hash the password

  let token = jwt.sign({ username, role }, process.env.VITE_JWT_SECRET);
  db.query(
    `INSERT INTO public.users (name, role, passhash,token) VALUES ($1, $2, $3,$4)`,
    [username, role, hashedPassword, token]
  );
  res.json({ success: true, message: "User created successfully", token });
});
*/


///////////////////////////////////////////////////
//////////////// MY SIGNUP API END ////////////////
///////////////////////////////////////////////////






// app.signin("/api/signin", (req, res) => {
//   const { username, phonenumber } = req.body;

//   let token = jwt.sign({ username, phonenumber }, process.env.VITE_JWT_SECRET, {
//     expiresIn: "1h",
//   });
//   res.json({ token });
// });



app.use("/login", authRouter);
app.use("/signup", authRouter);
////////////////////////////////////////////////////
//////////////// MY LOGIN API Start ////////////////
////////////////////////////////////////////////////

/*
app.post("/api/login", async (req, res) => {
    try {
        const { password } = req.body; // username gerek däl
        const userToken = req.headers.authorization?.split(" ")[1];
        
        if (!userToken) {
            return res.status(401).json({ message: "Token required" });
        }

        // Tokeni barlamak we dekod etmek
        const decoded = jwt.verify(userToken, process.env.VITE_JWT_SECRET);
        const username = decoded.username;

        // Ulanyjyny token däl-de, aslynda username we password bilen tapmaly
        const result = await db.query(
            `SELECT * FROM public.users WHERE name = $1 LIMIT 1`,
            [username]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = result.rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.passhash);
        
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password" });
        }

        res.json({
            message: "Login successful",
            user_id: user.id,
            username: user.name,
            role: user.role
        });
        
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});
 */

////////////////////////////////////////////////////
///////////////// MY LOGIN API End /////////////////
////////////////////////////////////////////////////

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
