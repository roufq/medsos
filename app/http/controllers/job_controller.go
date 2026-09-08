package controllers

import (
	"github.com/goravel/framework/contracts/http"
	"goravel/app/repositories"
	"strconv"
)

type JobController struct {
	jobRepo repositories.JobRepository
}

func NewJobController(jobRepo repositories.JobRepository) *JobController {
	return &JobController{
		jobRepo: jobRepo,
	}
}

func (c *JobController) GetAllJobs(ctx http.Context) http.Response {
	userID, authErr := authenticatedUserID(ctx)
	if authErr != nil {
		return ctx.Response().Json(401, http.Json{"error": "Unauthorized"})
	}

	jobs, err := c.jobRepo.GetAllJobs()
	if err != nil {
		return ctx.Response().Json(500, http.Json{"error": "Failed to get jobs"})
	}

	appliedIDs, _ := c.jobRepo.GetAppliedJobIDs(userID)

	return ctx.Response().Json(200, http.Json{
		"jobs":        jobs,
		"applied_ids": appliedIDs,
	})
}

func (c *JobController) ApplyJob(ctx http.Context) http.Response {
	userID, authErr := authenticatedUserID(ctx)
	if authErr != nil {
		return ctx.Response().Json(401, http.Json{"error": "Unauthorized"})
	}
	jobID, err := strconv.ParseInt(ctx.Request().Input("job_id"), 10, 64)
	if err != nil || jobID <= 0 {
		return ctx.Response().Json(400, http.Json{"error": "Invalid job_id"})
	}

	if err := c.jobRepo.ApplyJob(userID, jobID); err != nil {
		return ctx.Response().Json(500, http.Json{"error": "Failed to apply for job"})
	}

	return ctx.Response().Json(200, http.Json{"message": "Successfully applied"})
}
