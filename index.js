import express, { Router } from "express";
import bodyParser from "body-parser";
import router from "./router/userRoutes.js";
import admin_router from "./router/admin/adminRoutes.js";
import { db } from "./config/db.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import authRouter from "./router/authRoutes.js";
import adminAuthRouter from "./router/admin/authRoutes.js";
const app = express();
const PORT = 3000;
// app.use(express.static('images'));

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

console.log("__dirname: " + __dirname);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Or '*' for all origins (use with caution)
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
// app.use(express.static("public"));

//_______________________________________________________________________________________________

//initialize DB
// db.query(
//   "create table IF NOT EXISTS categories (id serial primary key, name VARCHAR ,description VARCHAR ,created_at TIMESTAMP,deleted_at TIMESTAMP);"
// );

// db.query(
//   "create table IF NOT EXISTS sub_categories (id serial primary key,parent_id int references categories(id) , name VARCHAR ,description VARCHAR ,created_at TIMESTAMP,deleted_at TIMESTAMP);"
// );

// db.query(
//   "create table IF NOT EXISTS products(id serial primary key,name VARCHAR ,description VARCHAR,summary VARCHAR, cover VARCHAR , sku  VARCHAR , price  VARCHAR  ,   category_id   references   sub_categories(id))     );"
// );

//_______________________________________________________________________________________________

//......... auth .........//

app.use("/auth/api", authRouter);
app.use("/admin/auth/api", adminAuthRouter);

app.use(
  "/uploads",
  cors(corsOptions),
  express.static(path.join(__dirname, "/uploads"))
);

// app.use(
//   "/images",
//   cors(corsOptions),
//   express.static(path.join(__dirname, "/images"))
// );
// app.use(
//   "/order_item",
//   cors(corsOptions),
//   express.static(path.join(__dirname, "/order_item"))
// );

//Employer actions CRUD & viewing users who applied to jobs
app.use("/user/api", router);
app.use("/admin/api", admin_router);

// error handler middleware
app.use((error, req, res, next) => {
  res.status(error.status || 500).send({
    error: {
      status: error.status || 500,
      message: error.message || "Internal Server Error",
    },
  });
});

// app.get("/api/products", async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = 40;
//     const offset = (page - 1) * limit;

//     // Umumy önümleriň sanyny al
//     const totalResult = await db.query("SELECT COUNT(*) FROM products2");
//     const totalItems = parseInt(totalResult.rows[0].count);
//     const totalPages = Math.ceil(totalItems / limit);

//     // Sahypadaky önümleri al
//     const productsResult = await db.query(
//       "SELECT * FROM products2 LIMIT $1 OFFSET $2",
//       [limit, offset]
//     );

//     // Jogap bilen JSON iber
//     res.json({
//       currentPage: page,
//       totalPages: totalPages,
//       totalItems: totalItems,
//       products: productsResult.rows,
//     });
//   } catch (err) {
//     console.error("Ýalňyşlyk:", err);
//     res.status(500).json({ error: "Serverde ýalňyşlyk ýüze çykdy." });
//   }
// });
app.get("/api/products", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 40;
    const offset = (page - 1) * limit;
    const category = req.query.category;
    const search = req.query.search; // search parametri

    let totalResult;
    let productsResult;

    // Query-leri we parametrleri dinamik düzmek üçin
    let baseQuery = "FROM products2 WHERE 1=1";
    let params = [];
    let paramIndex = 1;

    // Kategoriýa bar bolsa goş
    if (category) {
      baseQuery += ` AND category = $${paramIndex++}`;
      params.push(category);
    }

    // Gözleg bar bolsa goş
    if (search) {
      baseQuery += ` AND title ILIKE $${paramIndex++}`; // "name" sütüni ulanylýar
      params.push(`%${search}%`);
    }

    // Jemi sany önümi al
    totalResult = await db.query(`SELECT COUNT(*) ${baseQuery}`, params);

    // Önümleri al
    const productQuery = `SELECT * ${baseQuery} LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    productsResult = await db.query(productQuery, [...params, limit, offset]);

    const totalItems = parseInt(totalResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      currentPage: page,
      totalPages: totalPages,
      totalItems: totalItems,
      products: productsResult.rows,
    });
  } catch (err) {
    console.error("Ýalňyşlyk:", err);
    res.status(500).json({ error: "Serverde ýalňyşlyk ýüze çykdy." });
  }
});

app.get("/api/product/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const query = `
      SELECT 
        products2.*, 
        brands.image AS brand_img 
      FROM 
        products2, brands
      WHERE 
        products2.brand = brands.name 
        AND products2.id = $1
    `;

    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Önüm tapylmady." });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Ýalňyşlyk:", err);
    res.status(500).json({ error: "Serverde ýalňyşlyk ýüze çykdy." });
  }
});

app.get("/api/products", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 40;
    const offset = (page - 1) * limit;
    const category = req.query.category; // category parametri

    let totalResult;
    let productsResult;

    if (category) {
      // Kategoriýa boýunça süz
      totalResult = await db.query(
        "SELECT COUNT(*) FROM products2 WHERE category = $1",
        [category]
      );

      productsResult = await db.query(
        "SELECT * FROM products2 WHERE category = $1 LIMIT $2 OFFSET $3",
        [category, limit, offset]
      );
    } else {
      // Hemme önümleri görkez
      totalResult = await db.query("SELECT COUNT(*) FROM products2");
      productsResult = await db.query(
        "SELECT * FROM products2 LIMIT $1 OFFSET $2",
        [limit, offset]
      );
    }

    const totalItems = parseInt(totalResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      currentPage: page,
      totalPages: totalPages,
      totalItems: totalItems,
      products: productsResult.rows,
    });
  } catch (err) {
    console.error("Ýalňyşlyk:", err);
    res.status(500).json({ error: "Serverde ýalňyşlyk ýüze çykdy." });
  }
});

app.get("/api/product/images", async (req, res) => {
  const product_images = await db.query("SELECT * FROM product_images"); // DB-den data al
  res.json(product_imagess.rows);
  // ýa-da res.send(products) ORM-e görä
});

// oz yazanym
app.get("/api/product/images/:id", async (req, res) => {
  const productImages = await db.query(
    "SELECT * FROM product_images WHERE product_id = $1",
    [req.params.id]
  );
  res.json(productImages.rows);
});

// GET /get-brands
app.get("/get-brands", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Umumy sanyny al
    const totalResult = await db.query("SELECT COUNT(*) AS total FROM brands");
    const total = parseInt(totalResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    // Brands maglumatlaryny al
    const result = await db.query("SELECT * FROM brands LIMIT $1 OFFSET $2", [
      limit,
      offset,
    ]);

    res.json({
      currentPage: page,
      totalPages: totalPages,
      totalItems: total,
      data: result.rows,
    });
  } catch (error) {
    console.error("Brands API error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /get-categories
app.get("/get-categories", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Umumy sanyny al
    const totalResult = await db.query(
      "SELECT COUNT(*) AS total FROM categories1"
    );
    const total = parseInt(totalResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    // Maglumatlary al
    const result = await db.query(
      "SELECT * FROM categories1 LIMIT $1 OFFSET $2",
      [limit, offset]
    );

    res.json({
      currentPage: page,
      totalPages: totalPages,
      totalItems: total,
      data: result.rows,
    });
  } catch (error) {
    console.error("category almakda ýalňyş -!!!", error);
    res.status(500).json({ message: "Server error:" });
  }
});

app.get("/api/related-products", async (req, res) => {
  try {
    let query = "SELECT * FROM categories1";
    const params = [];

    // Eger soragda kategoriýa süzgüji bar bolsa
    if (req.query.category && req.query.category.includes("in")) {
      const categoryId = req.query.category.split("[in]=")[1];

      query += " WHERE category = $1";
      params.push(categoryId);
    }

    const result = await db.query(query, params);
    res.json({ data: result.rows });
  } catch (err) {
    console.error("Related products fetch error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
