<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class AdminSeeder extends Seeder
{
    public function run()
    {
        // Buat Role kalau belum ada
        Role::firstOrCreate(['name' => 'Admin']);
        Role::firstOrCreate(['name' => 'Staff']);

        // Buat User Admin
        $admin = User::firstOrCreate(
            ['email' => 'admin@kait-handmade.com'],
            [
                'name' => 'Administrator',
                'password' => Hash::make('password123'),
            ]
        );

        // Assign role Admin
        $admin->assignRole('Admin');

        echo "✅ Admin berhasil dibuat!\n";
        echo "Email    : admin@kait-handmade.com\n";
        echo "Password : password123\n";
    }
}