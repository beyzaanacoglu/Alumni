<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Scholarship extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'donor_name',
        'is_anonymous',
        'amount',
        'currency',
        'duration',
        'quota',
        'requirements',
        'contact_email',
        'external_application_link',
        'application_deadline',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'is_anonymous' => 'boolean',
            'amount' => 'decimal:2',
            'quota' => 'integer',
            'application_deadline' => 'date',
        ];
    }

    /**
     * Relationship: The alumnus/admin who created/funded the scholarship.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relationship: Applications submitted to this scholarship.
     */
    public function applications(): HasMany
    {
        return $this->hasMany(Application::class);
    }

    /**
     * Many-to-Many: Student applicants for this scholarship.
     */
    public function applicants(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'applications')
            ->withPivot(['id', 'type', 'cover_letter', 'status'])
            ->withTimestamps();
    }

    /**
     * Accessor: Görünür bağışçı/mezun adı.
     * Veren kişi adının görünmesini istemiyorsa 'Anonim Mezun' döner.
     */
    public function getDonorDisplayNameAttribute(): string
    {
        if ($this->is_anonymous) {
            return 'Anonim Mezun';
        }

        return $this->donor_name ?: ($this->user?->name ?? 'Mezun');
    }

    /**
     * Dahili başvuru kabul edip etmediğini kontrol eder.
     * external_application_link NULL ise dahili başvuru yapılır.
     */
    public function usesInternalApplications(): bool
    {
        return $this->external_application_link === null;
    }

    /**
     * Başvuruların açık olup olmadığını denetler.
     */
    public function isAcceptingApplications(): bool
    {
        return $this->status === 'open'
            && ($this->application_deadline === null || ! $this->application_deadline->isPast() || $this->application_deadline->isToday());
    }

    /**
     * Bağışçı adının gizli olup olmadığını döndürür.
     */
    public function isAnonymous(): bool
    {
        return (bool) $this->is_anonymous;
    }

    /**
     * Scopes
     */
    public function scopeOpen(Builder $query): Builder
    {
        return $query->where('status', 'open');
    }

    public function scopeInternal(Builder $query): Builder
    {
        return $query->whereNull('external_application_link');
    }

    public function scopeExternal(Builder $query): Builder
    {
        return $query->whereNotNull('external_application_link');
    }
}
