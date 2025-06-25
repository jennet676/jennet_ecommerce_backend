import { db } from "../config/db.js";
import {
  getJobSeekerJobs,
  addToFavorites,
  getAllOwnApplyedJobs,
  deleteSpesificApplyedJob,
} from "../services/jobSeekerService.js";

export const jobSeekerJobs = async (req, res) => {
  const { page } = req.query;

  const title = req.query.title;
  const description = req.query.description;
  const active = req.query.active;
  const company = req.query.company;
  const location = req.query.location;
  const category = req.query.category;
  const salary_range = req.query.salary_range;
  const employment_type = req.query.employment_type;

  const result = await getJobSeekerJobs(
    page,
    title,
    description,
    active,
    company,
    location,
    category,
    salary_range,
    employment_type
  );

  if (result.success) {
    res.status(201).json(result);
  } else {
    res.status(400).json(result);
  }
};

export const applyJob = async (req, res) => {
  const jobSeekerId = req.user.user_id;
  const jobId = req.params.id;

  const result = await addToFavorites(jobSeekerId, jobId);
  if (result.success) {
    res.status(201).json(result);
  } else {
    res.status(400).json(result);
  }
};

export const getAllApplyedJobs = async (req, res) => {
  const jobSeekerId = req.user.user_id;
  //  ähli apply eden işlerini

  const page = req.query.page;
  const title = req.query.title;
  const description = req.query.description;
  let active = req.query.active;
  const company = req.query.company;
  const location = req.query.location;
  const category = req.query.category;
  const salary_range = req.query.salary_range;
  const employment_type = req.query.employment_type;

  const result = await getAllOwnApplyedJobs(jobSeekerId,page,title,
    description,
    active=true,
    company,
    location,
    category,
    salary_range,
    employment_type);

  if (result.success) {
    res.status(201).json(result);
  } else {
    res.status(400).json(result);
  }
};

export const deleteApplyedJobById = async (req, res) => {
  const jobSeekerId = req.user.user_id;
  const jobId = req.params.id;

  const result = await deleteSpesificApplyedJob(jobSeekerId, jobId);

  if (result.success) {
    res.status(201).json(result);
  } else {
    res.status(400).json(result);
  }
};
