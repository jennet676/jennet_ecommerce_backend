import pg from "pg";
import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "../config/db.js";
import jwt from "jsonwebtoken";

export async function signupUser(username, password, role) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const checkUserQueryResult = await db.query(
      "select * from users where username =$1",
      [username]
    );

    if (checkUserQueryResult.rows.length != 0) {
      for (const sameNamedPerson of checkUserQueryResult.rows) {
        const isMatch = await bcrypt.compare(
          password,
          sameNamedPerson.password_hash
        );
        console.log("isMatch", isMatch);
        if (isMatch) {
          return { success: false, message: "Alredy registered user" };
        }
      }
    }
    const sql =
      "INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)";
    await db.query(sql, [username, hashedPassword, role]);
    return { success: true, message: "User created successfully" };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      message: "Registration failed due to an internal error.",
    };
  }
}

export async function loginUser(username, password) {
  try {
    const query = "SELECT * FROM users WHERE username = $1";
    const values = [username];
    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return { success: false, message: "Invalid username or password." };
    }

    const users = result.rows;
    for (const user of users) {
      const isMatch = await bcrypt.compare(password, user.password_hash);

      if (isMatch) {
        const token = jwt.sign(
          { id: user.id, name: user.name, role: user.role },
          process.env.VITE_JWT_SECRET
        );
        return {
          success: true,
          token,
          details: {
            id: user.id,
            name: user.name,
            role: user.role,
          },
        };
      }
    }
    return { success: false, message: "Invalid username or password." };
   
  } catch (error) {
    console.error("Error logging in:", error);
    return { success: false, message: "An error occurred" };
  }
}
