import express, { Router } from "express";
import axios from "axios";
import bodyParser from "body-parser";

import birds from "./birds.js";

import pg from "pg";

const app = express();
app.use("/birds", birds);

const db = new pg.Client({
  user: "postgres",

  host: "localhost",

  database: "expanses",

  password: "serdar090704",

  port: 5432,
});


db.connect();

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

app.post("/api/addexpense", async (req, res) => {
  const data = req.body;

  console.log("Received data:", data.description);
  db.query(
    "INSERT INTO public.expenses (description, amount, expense_date,category) VALUES ($1, $2, $3,$4)",
    [data.description, data.amount, data.date, data.category]
  );
  res.status(200).send("Data received successfully!");
});

app.post("/api/example", async (req, res) => {
  res.status(200).send("Data received successfully!");
});
// app.get("/", (req, res) => {
//   res.send(
//     "<form action='/api/expenses/1' method='DELETE'> <input type='submit' value='Delete'/></form>"
//   );
// });

app.get("/api/expenses", async (req, res) => {
  if (req.query.start && req.query.end) {
    const start = req.query.start;
    const end = req.query.end;
    const result = await db.query(
      `SELECT * FROM public.expenses WHERE expense_date BETWEEN '${start}' AND '${end}'`
    );
    return res.send(result.rows);
  } else if (req.query.start) {
    const start = req.query.start;
    const result = await db.query(
      `SELECT * FROM public.expenses WHERE expense_date >= '${start}'`
    );
    return res.send(result.rows);
  } else if (req.query.end) {
    const end = req.query.end;
    const result = await db.query(
      `SELECT * FROM public.expenses WHERE expense_date <= '${end}'`
    );
    return res.send(result.rows);
  } else if (req.query.category) {
    const category = req.query.category;
    const result = await db.query(
      `SELECT * FROM public.expenses WHERE category = '${category}'`
    );
    return res.send(result.rows);
  } else if (req.query.description) {
    const description = req.query.description;
    const result = await db.query(
      `SELECT * FROM public.expenses WHERE description ILIKE '%${description}%'`
    );
    return res.send(result.rows);
  } else if (req.query.amount) {
    const amount = req.query.amount;
    const result = await db.query(
      `SELECT * FROM public.expenses WHERE amount = ${amount}`
    );
    return res.send(result.rows);
  } else if (req.query.id) {
    const id = req.query.id;
    const result = await db.query(
      `SELECT * FROM public.expenses WHERE ID = ${id}`
    );
    return res.send(result.rows);
  } else if (req.query.sort) {
    const sort = req.query.sort;
    const order = req.query.order.toUpperCase() === "DESC" ? "DESC" : "ASC";

    const result = await db.query(
      `SELECT * FROM public.expenses ORDER BY ${sort} ${order}`
    );
    return res.send(result.rows);
  } else if (req.query.min && req.query.max) {
    const min = req.query.min;
    const max = req.query.max;
    const result = await db.query(
      `SELECT * FROM public.expenses WHERE amount BETWEEN ${min} AND ${max}`
    );
    return res.send(result.rows);
  } else if (req.query.min) {
    const min = req.query.min;
    const result = await db.query(
      `SELECT * FROM public.expenses WHERE amount >= ${min}`
    );
    return res.send(result.rows);
  } else if (req.query.max) {
    const max = req.query.max;
    const result = await db.query(
      `SELECT * FROM public.expenses WHERE amount <= ${max}`
    );
    return res.send(result.rows);
  }
  const result = await db.query("SELECT * FROM public.expenses");
  res.send(result.rows);
});

app.delete("/api/expenses/:id", async (req, res) => {
  try {
    await db.query(`DELETE FROM public.expenses WHERE ID=${req.params.id}`);
    res.send("Resource deleted successfully");
  } catch (error) {
    res.send("Error deleting resource:", error);
  }
});

app.put("/api/expenses/:id", async (req, res) => {
  try {
    const data = req.body;
    await db.query(
      `UPDATE public.expenses SET (description, amount, expense_date,category) = ($1, $2, $3,$4) WHERE ID=${req.params.id}`,
      [data.description, data.amount, data.data || "2025-06-13", data.category]
    );
    res.status(200);
    res.send("Resource updated successfully");
  } catch (error) {
    res.status(500);
    res.send("Error updateing resource:", error);
  }
});
// /api/reports/summary
app.get("/api/reports/summary", async (req, res) => {
  try {
    req.query.order;
    const result = await db.query(
      `SELECT SUM(amount), category FROM expenses GROUP BY category order by sum ${
        req.query.order || "DESC"
      }`
    );
    res.send(result.rows);
  } catch (error) {
    res.status(500).send("Error fetching summary report:", error);
  }
});

// /api/reports/monthly
app.get("/api/reports/monthly", async (req, res) => {
  const year = parseInt(req.query.year) || new Date().getFullYear();
  const month = parseInt(req.query.month) || new Date().getMonth() + 1;

  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate = new Date(year, month, 1) // next month 1st day
    .toISOString()
    .split("T")[0];

  try {
    const result = await db.query(
      `SELECT SUM(amount) as total FROM expenses WHERE expense_date >= $1 AND expense_date < $2`,
      [startDate, endDate]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching monthly report:", error);
    res.status(500).send("Error fetching monthly report");
  }
});

app.get("/api/reports/top", async (req, res) => {
  try {
    const result = await db.query(
      `SELECT SUM(amount), category FROM expenses GROUP BY category order by sum desc limit 3`
    );
    res.send(result.rows);
  } catch (error) {
    res.status(500).send("Error fetching expenses report:", error);
  }
});
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
