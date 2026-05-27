<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     */
    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user() ? [
                    'id'   => $request->user()->id,
                    'name' => $request->user()->name,
                    'email'=> $request->user()->email,
                    'role' => $request->user()->getRoleNames()->first(),
                ] : null,
            ],
            'ziggy' => fn () => [
                ...(new Ziggy())->toArray(),
                'location' => $request->url(),
            ],
        ]);
    }

    /**
     * Handle the incoming request.
     *
     * Important: Allow access to login page even if user is already authenticated
     */
    public function handle(Request $request, \Closure $next): \Symfony\Component\HttpFoundation\Response
    {
        return parent::handle($request, $next);
    }
}