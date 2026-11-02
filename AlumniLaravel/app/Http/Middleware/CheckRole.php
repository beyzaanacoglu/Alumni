<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     * Checks if the authenticated user possesses at least one of the specified roles.
     *
     * Usage in routes:
     *   ->middleware(['auth', 'role:admin'])
     *   ->middleware(['auth', 'role:alumni,company,admin'])
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        // 1. Authentication check
        if (! $user) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }

            return redirect()->guest('/login');
        }

        // 2. Role authorization check
        if (! $user->hasRole($roles)) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'message' => 'Forbidden: You do not have the required role to access this resource.',
                    'required_roles' => $roles,
                ], 403);
            }

            abort(403, 'Bu işlem için yetkiniz bulunmamaktadır.');
        }

        return $next($request);
    }
}
