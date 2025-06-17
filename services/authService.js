import pg from "pg";
import "dotenv/config";
import bcrypt from "bcryptjs";
const db = new pg.Client({
  user: "postgres",

  host: "localhost",

  database: "job board project",

  password: "serdar090704",

  port: 5432,
});

db.connect();

export async function signupUser(username, password, role) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = "INSERT INTO users (name, password, role) VALUES ($1, $2, $3)";
    await db.query(sql, [username, hashedPassword, role]);

    return { success: true };
  } catch (error) {
    console.error("Registration error:", err);
    return {
      success: false,
      message: "Registration failed due to an internal error.",
    };
  }
}

export async function loginUser(username, password) {
  try {
    const query = "SELECT * FROM users WHERE name = $1";
    const values = [username];
    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return { success: false, message: "Invalid email or password." };
    }

    const users = result.rows;

    for (const user of users) {
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return { success: false, message: "Invalid email or password." };
      }

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
  } catch (error) {
    console.error("Error logging in:", error);
    return { success: false, message: "An error occurred" };
  }
}
