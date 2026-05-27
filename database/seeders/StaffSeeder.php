<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class StaffSeeder extends Seeder
{
    public function run()
    {
        // Pastikan role Staff ada
        Role::firstOrCreate(['name' => 'Staff']);

        // Buat akun Staff
        $staff = User::firstOrCreate(
            ['email' => 'staff@kait-handmade.com'],
            [
                'name'     => 'Staff Kait Handmade',
                'password' => Hash::make('password123'),
            ]
        );

        // Assign role Staff
        $staff->assignRole('Staff');

        echo "✅ Akun Staff berhasil dibuat!\n";
        echo "Email    : staff@kait-handmade.com\n";
        echo "Password : password123\n";
    }
}