import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Boxes, Folder, History, LayoutGrid, Users, ShoppingCart, ClipboardCheck, ClipboardList } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Barang',
        url: '/barang',
        icon: Boxes,  
    },
    {
        title: 'Penjualan',
        url: '/penjualan',
        icon: ShoppingCart,
    },
    {
        title: 'History',
        url:'/history',
        icon: History,
    },
    {
        title: 'Stock Opname',
        url: '/opname',
        icon: ClipboardCheck,
    }
];

const footerNavItems: NavItem[] = [
];

export function AppSidebar() {
    const { auth } = usePage<any>().props;
    const isAdmin = auth?.user?.role === 'Admin' || auth?.user?.role === 'admin';

    // Insert 'User' menu if admin
    const items = [...mainNavItems];
    if (isAdmin) {
        items.splice(3, 0, {
            title: 'User',
            url: '/users',
            icon: Users,
        });
        
        items.push({
            title: 'Approval Opname',
            url: '/opname/approval',
            icon: ClipboardList,
        });
    }

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/barang" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={items} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
