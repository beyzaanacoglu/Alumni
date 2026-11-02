<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Company extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'industry',
        'website',
        'email',
        'phone',
        'city',
        'address',
        'description',
    ];

    /**
     * One-to-Many (Inverted): The representative user managing this company profile.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * One-to-Many: A company has many job postings.
     */
    public function jobPostings(): HasMany
    {
        return $this->hasMany(JobPosting::class);
    }
}
