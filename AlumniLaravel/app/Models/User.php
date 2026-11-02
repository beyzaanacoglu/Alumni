<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password', 'role'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    public function profile(): HasOne
    {
        return $this->hasOne(Profile::class);
    }

    public function workExperiences(): HasMany
    {
        return $this->hasMany(WorkExperience::class);
    }

    public function announcements(): HasMany
    {
        return $this->hasMany(Announcement::class);
    }

    public function jobPostings(): HasMany
    {
        return $this->hasMany(JobPosting::class);
    }

    public function applications(): HasMany
    {
        return $this->hasMany(Application::class);
    }

    public function jobApplications(): HasMany
    {
        return $this->applications();
    }

    public function feedPosts(): HasMany
    {
        return $this->hasMany(FeedPost::class);
    }

    public function sentMessages(): HasMany
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function receivedMessages(): HasMany
    {
        return $this->hasMany(Message::class, 'receiver_id');
    }

    /**
     * Many-to-Many: User has multiple assigned roles.
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_user')->withTimestamps();
    }

    /**
     * One-to-Many: Scholarships created/funded by this alumnus or admin.
     */
    public function fundedScholarships(): HasMany
    {
        return $this->hasMany(Scholarship::class);
    }

    /**
     * Many-to-Many: User applies to multiple JobPostings via applications pivot.
     */
    public function appliedPostings(): BelongsToMany
    {
        return $this->belongsToMany(JobPosting::class, 'applications')
            ->withPivot(['id', 'type', 'cover_letter', 'status'])
            ->withTimestamps();
    }

    public function appliedJobs(): BelongsToMany
    {
        return $this->appliedPostings();
    }

    /**
     * Many-to-Many: Scholarships this student applied to via applications pivot.
     */
    public function appliedScholarships(): BelongsToMany
    {
        return $this->belongsToMany(Scholarship::class, 'applications')
            ->withPivot(['id', 'type', 'cover_letter', 'status'])
            ->withTimestamps();
    }

    /**
     * One-to-Many: Companies managed by this user.
     */
    public function companies(): HasMany
    {
        return $this->hasMany(Company::class);
    }

    /**
     * Check if user holds a specific role (checks relation and role column).
     */
    public function hasRole(string|array $role): bool
    {
        $roleNames = (array) $role;

        // Fast-path: check direct role column
        if (in_array($this->role, $roleNames, true)) {
            return true;
        }

        // Check Many-to-Many roles relationship
        return $this->roles->pluck('name')->intersect($roleNames)->isNotEmpty();
    }

    public function isAdmin(): bool
    {
        return $this->hasRole(Role::ADMIN);
    }

    public function isAlumni(): bool
    {
        return $this->hasRole(Role::ALUMNI);
    }

    public function isCompany(): bool
    {
        return $this->hasRole(Role::COMPANY);
    }

    public function isStudent(): bool
    {
        return $this->hasRole(Role::STUDENT);
    }

    public function assignRole(string|Role $role): void
    {
        $roleModel = is_string($role) ? Role::where('name', $role)->firstOrFail() : $role;
        $this->roles()->syncWithoutDetaching([$roleModel->id]);
    }

    public function removeRole(string|Role $role): void
    {
        $roleModel = is_string($role) ? Role::where('name', $role)->first() : $role;
        if ($roleModel) {
            $this->roles()->detach($roleModel->id);
        }
    }

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
