<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JobPosting extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'company_id', 'title', 'description', 'company_name', 'city', 'country',
        'employment_type', 'work_mode', 'experience_level', 'required_skills',
        'contact_email', 'external_application_link', 'application_deadline',
        'status', 'latitude', 'longitude',
    ];

    protected function casts(): array
    {
        return [
            'application_deadline' => 'date',
            'latitude' => 'float',
            'longitude' => 'float',
        ];
    }

    /**
     * One-to-Many (Inverted): Author user who published the posting.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * One-to-Many (Inverted): Associated company profile.
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * One-to-Many: Internal applications submitted to this posting.
     */
    public function applications(): HasMany
    {
        return $this->hasMany(Application::class);
    }

    /**
     * Many-to-Many: Users who applied to this posting via applications pivot.
     */
    public function applicants(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'applications')
            ->withPivot(['id', 'type', 'cover_letter', 'status'])
            ->withTimestamps();
    }

    /** True when applications are tracked internally (no external link). */
    public function usesInternalApplications(): bool
    {
        return $this->external_application_link === null;
    }

    public function isAcceptingApplications(): bool
    {
        return $this->status === 'open'
            && ($this->application_deadline === null || ! $this->application_deadline->isPast() || $this->application_deadline->isToday());
    }
}
