import express from "express";
import {
  create,
  deleteEmployerJob,
  employerJobs,
  updateJob,
  applyedUsers,
} from "../controllers/jobController.js";
import { createJobValidation } from "../validation/jobValidation.js";
import { verifyToken } from "../middleware/auth.token.js";
import "dotenv/config";
import {
  applyJob,
  jobSeekerJobs,
  getAllApplyedJobs,
  deleteApplyedJobById,
} from "../controllers/jobSeekerControlle.js";
import { db } from "../config/db.js";

const router = express.Router();
////// Employer Job Routes //////
//Employer create job
router.post("/employer/create-job", createJobValidation, verifyToken, create);

//Employer Read
router.get("/employer/jobs", verifyToken, employerJobs);

// update job
router.put(
  "/employer/update-job/:id",
  createJobValidation,
  verifyToken,
  updateJob
);
router.delete("/employer/delete-job/:id", verifyToken, deleteEmployerJob);

router.get("/employer/applyed-users/:id", verifyToken, applyedUsers);

////// Job seeker job routes
// Job seeker can view all jobs
router.get("/job-seeker/jobs", jobSeekerJobs);
// Job seeker can view a specific job

router.get("/job-seeker/jobs/:id", async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await db.query(
      "SELECT * FROM jobs WHERE id = $1 and is_active=true",
      [jobId]
    );
    if (job.rows.length > 0) {
      res.status(200).json({ success: true, data: job.rows[0] });
    } else {
      res.status(404).json({ success: false, message: "Job not found." });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/job-seeker/applying-job/:id", verifyToken, applyJob);

router.get("/job-seeker/get-all-applyed-jobs", verifyToken, getAllApplyedJobs);

router.delete(
  "/job-seeker/delete-applyed-job/:id",
  verifyToken,
  deleteApplyedJobById
);
export default router;
