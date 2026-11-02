<?php

namespace App\Policies;

use App\Models\Role;
use App\Models\Scholarship;
use App\Models\User;

class ScholarshipPolicy
{
    /**
     * Determine whether anyone can browse the list of scholarships.
     */
    public function viewAny(?User $user): bool
    {
        return true;
    }

    /**
     * Determine whether anyone can view details of a scholarship.
     */
    public function view(?User $user, Scholarship $scholarship): bool
    {
        return true;
    }

    /**
     * Determine whether the user can create a scholarship opportunity.
     * Alumni, Admins, and Companies can create scholarship notices.
     */
    public function create(User $user): bool
    {
        return $user->hasRole([Role::ADMIN, Role::ALUMNI, Role::COMPANY]);
    }

    /**
     * Determine whether the user can edit the scholarship.
     */
    public function update(User $user, Scholarship $scholarship): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $scholarship->user_id === $user->id;
    }

    /**
     * Determine whether the user can delete the scholarship.
     */
    public function delete(User $user, Scholarship $scholarship): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $scholarship->user_id === $user->id;
    }

    /**
     * Determine whether a student or alumni can apply to the scholarship internally.
     */
    public function apply(User $user, Scholarship $scholarship): bool
    {
        if (! $user->hasRole([Role::STUDENT, Role::ALUMNI, Role::ADMIN])) {
            return false;
        }

        if (! $scholarship->usesInternalApplications() || ! $scholarship->isAcceptingApplications()) {
            return false;
        }

        // Donor cannot apply to their own scholarship
        if ($scholarship->user_id === $user->id) {
            return false;
        }

        // Prevent duplicate application
        return ! $scholarship->applications()->where('user_id', $user->id)->exists();
    }

    /**
     * Determine whether the user can view the list of applicant students.
     * Only the donor (even if marked anonymous publicly) or an Admin can review applicant students.
     */
    public function viewApplicants(User $user, Scholarship $scholarship): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $scholarship->user_id === $user->id;
    }
}
