<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Application extends Model
{
    use HasFactory;

    protected $table = 'applications';

    // Application types (Job, Internship, Volunteer, Project, Scholarship)
    public const TYPE_JOB         = 'job';
    public const TYPE_INTERNSHIP  = 'internship';
    public const TYPE_VOLUNTEER   = 'volunteer';
    public const TYPE_PROJECT     = 'project';
    public const TYPE_SCHOLARSHIP = 'scholarship';

    public const ALL_TYPES = [
        self::TYPE_JOB,
        self::TYPE_INTERNSHIP,
        self::TYPE_VOLUNTEER,
        self::TYPE_PROJECT,
        self::TYPE_SCHOLARSHIP,
    ];

    // Application statuses
    public const STATUS_PENDING   = 'pending';
    public const STATUS_SUBMITTED = 'submitted';
    public const STATUS_REVIEWING = 'reviewing';
    public const STATUS_ACCEPTED  = 'accepted';
    public const STATUS_REJECTED  = 'rejected';

    public const ALL_STATUSES = [
        self::STATUS_PENDING,
        self::STATUS_SUBMITTED,
        self::STATUS_REVIEWING,
        self::STATUS_ACCEPTED,
        self::STATUS_REJECTED,
    ];

    protected $fillable = [
        'job_posting_id',
        'scholarship_id',
        'user_id',
        'type',
        'cover_letter',
        'status',
    ];

    /**
     * Relationship: The target job/internship/project posting (if applicable).
     */
    public function jobPosting(): BelongsTo
    {
        return $this->belongsTo(JobPosting::class);
    }

    /**
     * Relationship: The target scholarship (if applicable).
     */
    public function scholarship(): BelongsTo
    {
        return $this->belongsTo(Scholarship::class);
    }

    /**
     * Relationship: The applicant (student, alumni, or volunteer user).
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scopes
     */
    public function scopeForUser(Builder $query, int $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    public function scopeForPosting(Builder $query, int $jobPostingId): Builder
    {
        return $query->where('job_posting_id', $jobPostingId);
    }

    public function scopeForScholarship(Builder $query, int $scholarshipId): Builder
    {
        return $query->where('scholarship_id', $scholarshipId);
    }

    public function scopeJobs(Builder $query): Builder
    {
        return $query->where('type', self::TYPE_JOB);
    }

    public function scopeInternships(Builder $query): Builder
    {
        return $query->where('type', self::TYPE_INTERNSHIP);
    }

    public function scopeVolunteers(Builder $query): Builder
    {
        return $query->whereIn('type', [self::TYPE_VOLUNTEER, self::TYPE_PROJECT]);
    }

    public function scopeScholarships(Builder $query): Builder
    {
        return $query->where('type', self::TYPE_SCHOLARSHIP);
    }

    public function scopePending(Builder $query): Builder
    {
        return $query->whereIn('status', [self::STATUS_PENDING, self::STATUS_SUBMITTED]);
    }

    public function scopeAccepted(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_ACCEPTED);
    }

    /**
     * Status Helpers
     */
    public function isPending(): bool
    {
        return in_array($this->status, [self::STATUS_PENDING, self::STATUS_SUBMITTED], true);
    }

    public function isAccepted(): bool
    {
        return $this->status === self::STATUS_ACCEPTED;
    }

    public function isRejected(): bool
    {
        return $this->status === self::STATUS_REJECTED;
    }

    /**
     * Type Helpers
     */
    public function isJob(): bool
    {
        return $this->type === self::TYPE_JOB;
    }

    public function isInternship(): bool
    {
        return $this->type === self::TYPE_INTERNSHIP;
    }

    public function isVolunteer(): bool
    {
        return in_array($this->type, [self::TYPE_VOLUNTEER, self::TYPE_PROJECT], true);
    }

    public function isScholarship(): bool
    {
        return $this->type === self::TYPE_SCHOLARSHIP;
    }
}
