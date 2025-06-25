import "dotenv/config";
import { db } from "../config/db.js";
import { filterJobsByAll } from "../helper/filterJobs.js";

export async function createJob(
  title,
  description,
  company,
  location,
  category,
  salary_range,
  employment_type,
  is_active,
  employer_id // IMPORTANT: Added employer_id here as it's a foreign key and required.
) {
  try {
    const checkedResult = await db.query(
      `SELECT * FROM jobs WHERE employer_id = $1 AND title = $2 AND description = $3`,
      [employer_id, title, description]
    );

    if (checkedResult.rows.length > 0) {
      return {
        success: false,
        message: "Job with the same title and description already exists.",
      };
    }
    const queryText = `
      INSERT INTO jobs (
        employer_id,
        title,
        description,
        company,
        location,
        category,
        salary_range,
        employment_type,
        is_active
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id; -- RETURNING id allows you to get the ID of the newly created job
        `;

    // The values array must match the order of the parameters ($1, $2, ...)
    const values = [
      employer_id,
      title,
      description,
      company,
      location,
      category,
      salary_range,
      employment_type,
      is_active,
    ];

    const result = await db.query(queryText, values);
    return {
      success: true,
      message: "Job created successfully.",
      jobId: result.rows[0].id,
    };
  } catch (error) {
    // Log the error for debugging purposes
    console.error("Error creating job:", error);

    // Return a generic error message to the client for security

    return {
      success: false,
      message: "An error occurred while creating the job.",
    };
  }
}

export async function getEmployerJobs(
  employer_id,
  page = 1,
  title = "",
  description = "",
  active = true,
  company = "",
  location = "",
  category = "",
  salary_range = "",
  employment_type = ""
) {
  try {
    let query = "SELECT * FROM jobs WHERE 1=1";
    let values = [];
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
    if (typeof active === "boolean") {
      query += ` AND is_active = $${index++}`;
      values.push(active);
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
    query += ` LIMIT 40 OFFSET 40 * (${page} - 1)`;
    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return {
        success: true,
        message: "No jobs found for this page.",
      };
    }

    const date = {
      page: page,
      results: result.rows,
      total_pages: Math.ceil(
        (
          await db.query(
            `SELECT COUNT(*) FROM jobs where employer_id = ${employer_id} `
          )
        ).rows[0].count / 40
      ),
      total_results: (
        await db.query(
          `SELECT COUNT(*) FROM jobs where employer_id = ${employer_id}`
        )
      ).rows[0].count,
    };
    // res.send(date);
    return {
      success: true,
      message: "Job selected by page successfully.",
      date: date,
    };
  } catch (error) {
    // Log the error for debugging purposes
    console.error("Error selecting job:", error);

    // Return a generic error message to the client for security

    return {
      success: false,
      message: "An error occurred while selecting the job.",
    };
  }
}

export async function updateJob(
  jobId,
  title,
  description,
  company,
  location,
  category,
  salary_range,
  employment_type,
  is_active
) {
  try {
    const result = await db.query(
      `UPDATE jobs SET title = $1, description = $2, company = $3, location = $4, category = $5, salary_range = $6, employment_type = $7, is_active = $8 WHERE id = $9 RETURNING *`,
      [
        title,
        description,
        company,
        location,
        category,
        salary_range,
        employment_type,
        is_active,
        jobId,
      ]
    );
    if (result.rows.length > 0) {
      return {
        success: true,
        message: "Job updated successfully.",
        job: result.rows[0],
      };
    } else {
      return { success: false, message: "Job not found." };
    }
  } catch (error) {
    // Log the error for debugging purposes
    console.error("Error updating job:", error);

    // Return a generic error message to the client for security

    return {
      success: false,
      message: "An error occurred while updating the job.",
    };
  }
}

export async function deleteJob(jobId, employer_id) {
  try {
    const result = await db.query(
      `UPDATE jobs 
       SET is_active = false 
       WHERE id = $1 AND employer_id = $2 AND is_active = true
       RETURNING *`,
      [jobId, employer_id]
    );

    if (result.rows.length > 0) {
      return {
        success: true,
        message: "Job deactivated (soft delete) successfully.",
        job: result.rows[0],
      };
    } else {
      return {
        success: false,
        message: "Job not found or already inactive.",
      };
    }
  } catch (error) {
    console.error("Error deleting job:", error);
    return {
      success: false,
      message: "An error occurred while deleting the job.",
    };
  }
}

export async function getApplyedUsers(jobId, employer_id, page = 1) {
  try {
    // Ilki iş barlanýar
    const jobResult = await db.query(
      "SELECT employer_id FROM jobs WHERE id = $1",
      [jobId]
    );

    if (jobResult.rows.length === 0) {
      return {
        success: false,
        message: "Job not found.",
      };
    }

    const resultEmployerId = jobResult.rows[0].employer_id;

    if (resultEmployerId !== employer_id) {
      return {
        success: false,
        message: "Diňe öz işiňe apply edenleri görüp bilýärsiň.",
      };
    }

    const limit = 40;
    const offset = (page - 1) * limit;

    // Apply edenleri al
    const applyResult = await db.query(
      `SELECT users.username, favorite.applied_at 
       FROM favorite 
       INNER JOIN users ON favorite.user_id = users.id 
       WHERE favorite.job_id = $1 
       ORDER BY favorite.applied_at DESC 
       LIMIT $2 OFFSET $3`,
      [jobId, limit, offset]
    );

    // Jemi sanawy al
    const countResult = await db.query(
      `SELECT COUNT(*) FROM favorite WHERE job_id = $1`,
      [jobId]
    );

    const totalCount = parseInt(countResult.rows[0].count);

    const data = {
      page,
      results: applyResult.rows,
      total_pages: Math.ceil(totalCount / limit),
      total_results: totalCount,
    };

    return {
      success: true,
      message: "Apply edenler üstünlikli alyndy.",
      results: data,
    };
  } catch (error) {
    console.error("Error getting applied users:", error);
    return {
      success: false,
      message: "Serwerde näsazlyk ýüze çykdy.",
    };
  }
}
