import { db } from "../config/db.js";

export const filterJobsByAll = async ({
  employer_id,
  title = "",
  description = "",
  is_active,
  company = "",
  location = "",
  category = "",
  salary_range = "",
  employment_type = ""
}) => {
  try {
    let query = "SELECT * FROM jobs WHERE 1=1";
    const values = [];
    let index = 1;

    // 1. Ilki employer_id boýunça filter
    if (employer_id) {
      query += ` AND employer_id = $${index++}`;
      values.push(employer_id);
    }

    // 2. Galan filterler
    if (title) {
      query += ` AND title ILIKE $${index++}`;
      values.push(`${title}%`);
    }
    if (description) {
      query += ` AND description ILIKE $${index++}`;
      values.push(`${description}%`);
    }
    if (typeof is_active === "boolean") {
      query += ` AND is_active = $${index++}`;
      values.push(is_active);
    }
    if (company) {
      query += ` AND company ILIKE $${index++}`;
      values.push(`${company}%`);
    }
    if (location) {
      query += ` AND location ILIKE $${index++}`;
      values.push(`${location}%`);
    }
    if (category) {
      query += ` AND category ILIKE $${index++}`;
      values.push(`${category}%`);
    }
    if (salary_range) {
      query += ` AND salary_range ILIKE $${index++}`;
      values.push(`${salary_range}%`);
    }
    if (employment_type) {
      query += ` AND employment_type ILIKE $${index++}`;
      values.push(`${employment_type}%`);
    }

    return await db.query(query, values);   
  } catch (err) {
    console.error("An error occurred", err);
    throw err;
  }
};
