import "dotenv/config";
import { db } from "../config/db.js";

export const getJobSeekerJobs = async (
  page = 1,
  title = "",
  description = "",
  active = true,
  company = "",
  location = "",
  category = "",
  salary_range = "",
  employment_type = ""
) => {
  try {
    const limit = 40;
    const offset = limit * (page - 1);

    let baseQuery = "FROM jobs WHERE is_active = true";
    const values = [];
    let index = 1;

    if (title) {
      baseQuery += ` AND title ILIKE $${index++}`;
      values.push(`${title}%`);
    }
    if (description) {
      baseQuery += ` AND description ILIKE $${index++}`;
      values.push(`${description}%`);
    }
    if (typeof active === "boolean") {
      baseQuery += ` AND is_active = $${index++}`;
      values.push(active);
    }
    if (company) {
      baseQuery += ` AND company ILIKE $${index++}`;
      values.push(`${company}%`);
    }
    if (location) {
      baseQuery += ` AND location ILIKE $${index++}`;
      values.push(`${location}%`);
    }
    if (category) {
      baseQuery += ` AND category ILIKE $${index++}`;
      values.push(`${category}%`);
    }
    if (salary_range) {
      baseQuery += ` AND salary_range ILIKE $${index++}`;
      values.push(`${salary_range}%`);
    }
    if (employment_type) {
      baseQuery += ` AND employment_type ILIKE $${index++}`;
      values.push(`${employment_type}%`);
    }

    const countQuery = `SELECT COUNT(*) ${baseQuery}`;
    const countResult = await db.query(countQuery, values);
    const totalResults = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalResults / limit);

    const dataQuery = `SELECT * ${baseQuery} LIMIT ${limit} OFFSET ${offset}`;
    const dataResult = await db.query(dataQuery, values);

    return {
      success: true,
      data: {
        page,
        results: dataResult.rows,
        total_pages: totalPages,
        total_results: totalResults,
      },
    };
  } catch (error) {
    console.error("Error fetching job seeker jobs:", error);
    return {
      success: false,
      message: "Internal server error.",
    };
  }
};
export const addToFavorites = async (jobSeekerId, jobId) => {
  try {
    // 1. Iş bar bolsa dowam edýär
    const jobResult = await db.query(
      `SELECT employer_id FROM jobs WHERE id = $1`,
      [jobId]
    );

    if (jobResult.rows.length === 0) {
      return {
        success: false,
        message: "Job not found.",
      };
    }

    // 2. Öňden 'favorite' edipdirmi barlaýarys
    const existing = await db.query(
      `SELECT * FROM favorite WHERE user_id = $1 AND job_id = $2`,
      [jobSeekerId, jobId]
    );

    if (existing.rows.length > 0) {
      return {
        success: false,
        message: "You already added this job to favorites.",
      };
    }

    // 3. Täze favorite goşulýar
    await db.query(
      `INSERT INTO favorite (user_id, job_id) VALUES ($1, $2)`,
      [jobSeekerId, jobId]
    );

    return {
      success: true,
      message: "Successfully added to favorites.",
    };
  } catch (error) {
    console.error("Error adding to favorites:", error);
    return {
      success: false,
      message: "Internal server error.",
    };
  }
};

export const getAllOwnApplyedJobs = async (
  jobSeekerId,
  page = 1,
  title = "",
  description = "",
  active,
  company = "",
  location = "",
  category = "",
  salary_range = "",
  employment_type = ""
) => {
  try {
    const values = [jobSeekerId];
    let index = 2;
    let limit = 40;

    let baseWhere = `WHERE favorite.user_id = $1`;
    let filters = "";

    if (title) {
      filters += ` AND jobs.title ILIKE $${index++}`;
      values.push(`${title}%`);
    }
    if (description) {
      filters += ` AND jobs.description ILIKE $${index++}`;
      values.push(`${description}%`);
    }
    if (typeof active === "boolean") {
      filters += ` AND jobs.is_active = $${index++}`;
      values.push(active);
    }
    if (company) {
      filters += ` AND jobs.company ILIKE $${index++}`;
      values.push(`${company}%`);
    }
    if (location) {
      filters += ` AND jobs.location ILIKE $${index++}`;
      values.push(`${location}%`);
    }
    if (category) {
      filters += ` AND jobs.category ILIKE $${index++}`;
      values.push(`${category}%`);
    }
    if (salary_range) {
      filters += ` AND jobs.salary_range ILIKE $${index++}`;
      values.push(`${salary_range}%`);
    }
    if (employment_type) {
      filters += ` AND jobs.employment_type ILIKE $${index++}`;
      values.push(`${employment_type}%`);
    }

    const fullWhereClause = `${baseWhere}${filters}`;

    // Final query with pagination
    const query = `
      SELECT favorite.id, favorite.user_id, jobs.id AS job_id, jobs.employer_id, jobs.title,
             jobs.description, jobs.company, jobs.location, jobs.category, 
             jobs.salary_range, jobs.employment_type, jobs.is_active 
      FROM favorite 
      INNER JOIN jobs ON favorite.job_id = jobs.id 
      ${fullWhereClause}
      LIMIT ${limit} OFFSET ${(page - 1) * (limit)}
    `;
    const result = await db.query(query, values);

    // Count query with the same filters
    const countQuery = `
      SELECT COUNT(*) 
      FROM favorite 
      INNER JOIN jobs ON favorite.job_id = jobs.id 
      ${fullWhereClause}
    `;
    const countResult = await db.query(countQuery, values);
    const totalCount = parseInt(countResult.rows[0].count);

    return {
      success: true,
      message: "Successfully detected applied jobs",
      data: {
        page,
        results: result.rows,
        total_pages: Math.ceil(totalCount / limit) || 1,
        total_results: totalCount || 0,
      },
    };
  } catch (error) {
    console.error("Error fetching applied jobs:", error);
    return {
      success: false,
      message: "Internal server error.",
    };
  }
};


export const deleteSpesificApplyedJob = async (
  jobSeekerId,
  jobId,
  page = 1
) => {
  try {
    // İş barlagy: bar bolsa, iş dowam edýär
    const jobResult = await db.query(
      `DELETE FROM favorite  where user_id=${jobSeekerId} and job_id=${jobId} RETURNING *`
    );

    if (jobResult.rows.length === 0) {
      return {
        success: false,
        message: "Job not found.",
      };
    }

    return {
      success: true,
      message: "Successfully deleted applyed the user job",
    };
  } catch (error) {
    console.error("Error adding to favorites:", error);
    return {
      success: false,
      message: "Internal server error.",
    };
  }
};
