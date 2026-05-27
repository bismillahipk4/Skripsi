<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run()
    {
        // Buat Permission
        $permissions = [
            'manage users',
            'manage products',
            'view stock',
            'manage stock',
            'move stock',
            'view logs',
            'generate reports'
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Buat Role Admin
        $admin = Role::firstOrCreate(['name' => 'Admin']);
        $admin->givePermissionTo(Permission::all());

        // Buat Role Staff
        $staff = Role::firstOrCreate(['name' => 'Staff']);
        $staff->givePermissionTo([
            'view stock',
            'manage stock',
            'move stock',
            'view logs'
        ]);

        // Assign ke user pertama (nanti kita buat)
        $user = \App\Models\User::first();
        if ($user) {
            $user->assignRole('Admin');
        }
    }
}