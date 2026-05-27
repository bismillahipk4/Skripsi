<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class StaffMiddleware
{
    /**
     * Handle an incoming request.
     * Allow users with the 'staff' or 'admin' role.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user() || ! $request->user()->hasAnyRole(['Staff', 'Admin'])) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Forbidden.'], 403);
            }

            abort(403, 'Anda tidak memiliki akses.');
        }

        return $next($request);
    }
}
