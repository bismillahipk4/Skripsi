<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with('roles')
            ->select('id', 'name', 'email', 'created_at')
            ->latest()
            ->paginate(10);

        $roles = Role::orderBy('name')->pluck('name');

        return Inertia::render('Users/Index', [
            'users' => $users,
            'roles' => $roles,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Password::defaults()],
            'role'     => ['required', 'string', 'exists:roles,name'],
        ]);

        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        $user->assignRole($validated['role']);

        return redirect()->route('users.index')
            ->with('success', 'User berhasil ditambahkan.');
    }

    public function destroy(User $user)
    {
        // Cegah user menghapus dirinya sendiri
        if (auth()->id() === $user->id) {
            return redirect()->back()->withErrors(['error' => 'Anda tidak bisa menghapus akun anda sendiri.']);
        }

        $user->delete();

        return redirect()->route('users.index')
            ->with('success', 'User berhasil dihapus.');
    }
}