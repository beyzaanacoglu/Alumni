<?php

namespace App\Policies;

use App\Models\JobPosting;
use App\Models\Role;
use App\Models\User;

class JobPostingPolicy
{
    /**
     * Determine whether the user can view any job postings.
     */
    public function viewAny(?User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the job posting.
     */
    public function view(?User $user, JobPosting $jobPosting): bool
    {
        return true;
    }

    /**
     * Determine whether the user can create job postings.
     * Only Admin, Alumni, and Company representative roles are authorized.
     */
    public function create(User $user): bool
    {
        return $user->hasRole([Role::ADMIN, Role::ALUMNI, Role::COMPANY]);
    }

    /**
     * Determine whether the user can update the job posting.
     * The author, company owner, or an Admin can edit.
     */
    public function update(User $user, JobPosting $jobPosting): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $jobPosting->user_id === $user->id;
    }

    /**
     * Determine whether the user can delete the job posting.
     */
    public function delete(User $user, JobPosting $jobPosting): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $jobPosting->user_id === $user->id;
    }

    /**
     * Determine whether the user can apply to the job posting internally.
     * Must be an open internal job, candidate cannot be the author, and no duplicate application.
     */
    public function apply(User $user, JobPosting $jobPosting): bool
    {
        if (! $jobPosting->usesInternalApplications() || ! $jobPosting->isAcceptingApplications()) {
            return false;
        }

        if ($jobPosting->user_id === $user->id) {
            return false;
        }

        return ! $jobPosting->applications()->where('user_id', $user->id)->exists();
    }
}
