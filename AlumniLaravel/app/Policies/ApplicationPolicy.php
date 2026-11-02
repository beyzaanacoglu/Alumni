<?php

namespace App\Policies;

use App\Models\Application;
use App\Models\JobPosting;
use App\Models\Role;
use App\Models\User;

class ApplicationPolicy
{
    /**
     * Determine whether the user can view any applications list.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasRole([Role::ADMIN, Role::ALUMNI, Role::COMPANY, Role::STUDENT]);
    }

    /**
     * Determine whether the user can view a specific application.
     * - The applicant can view their own application.
     * - The posting author or associated company representative can view applications to their posting.
     * - Admin can view all applications.
     */
    public function view(User $user, Application $application): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        // Applicant can view their own application
        if ($application->user_id === $user->id) {
            return true;
        }

        // Posting or Scholarship owner can view candidate applications
        if ($application->jobPosting && $application->jobPosting->user_id === $user->id) {
            return true;
        }

        if ($application->scholarship && $application->scholarship->user_id === $user->id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can apply to a job/internship/volunteer project.
     * - User must be an Alumni or Student (or Admin).
     * - The posting must accept internal applications (external_application_link is NULL).
     * - The posting must be currently open and deadline valid.
     * - The user cannot apply to their own posting.
     * - No duplicate application.
     */
    public function create(User $user, JobPosting $jobPosting): bool
    {
        if (! $user->hasRole([Role::ALUMNI, Role::STUDENT, Role::ADMIN])) {
            return false;
        }

        if (! $jobPosting->usesInternalApplications() || ! $jobPosting->isAcceptingApplications()) {
            return false;
        }

        if ($jobPosting->user_id === $user->id) {
            return false;
        }

        return ! $jobPosting->applications()->where('user_id', $user->id)->exists();
    }

    /**
     * Determine whether the user can update the application status.
     * Only the posting or scholarship author (or Admin) can change status (e.g. accepted, rejected).
     */
    public function update(User $user, Application $application): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return ($application->jobPosting && $application->jobPosting->user_id === $user->id)
            || ($application->scholarship && $application->scholarship->user_id === $user->id);
    }

    /**
     * Determine whether the user can delete / withdraw the application.
     * - The candidate can withdraw their application while it is still pending/submitted.
     * - Admin can delete any application.
     */
    public function delete(User $user, Application $application): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $application->user_id === $user->id && $application->isPending();
    }
}
