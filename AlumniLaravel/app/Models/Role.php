<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Role extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'display_name', 'description'];

    public const ADMIN = 'admin';
    public const ALUMNI = 'alumni';
    public const COMPANY = 'company';
    public const STUDENT = 'student';

    /**
     * Many-to-Many: A role belongs to many users.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'role_user')->withTimestamps();
    }
}
