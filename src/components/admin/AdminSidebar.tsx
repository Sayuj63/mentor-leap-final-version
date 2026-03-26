"use client";
import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    ShieldCheck,
    Users,
    BookOpen,
    Calendar,
    Package,
    Settings,
    LogOut,
    ChevronLeft,
    BarChart3,
    Layers
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

const navItems = [
    { label: 'Admin Dashboard', href: '/admin', icon: ShieldCheck },
    { label: 'User Management', href: '/admin/users', icon: Users },
    { label: 'Blog CMS', href: '/admin/blog', icon: BookOpen },
    { label: 'Curriculum', href: '/admin/courses', icon: BookOpen },
    { label: 'Events & Live', href: '/admin/events', icon: Calendar },
    { label: 'Live Registrations', href: '/admin/registrations', icon: Layers },
    { label: 'Coaching Requests', href: '/admin/coaching', icon: Users },
    { label: 'Products', href: '/admin/products', icon: Package },

    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
];

interface AdminSidebarProps {
    isOpen?: boolean;
    onClose?: boolean | (() => void);
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
    const pathname = usePathname();
    const { logout } = useAuth();
    const router = useRouter();

    const handleClose = () => {
        if (typeof onClose === 'function') onClose();
    };

    return (
        <>
            {/* Mobile Overlay */}
            <div 
                className={`fixed inset-0 bg-[#020617]/80 backdrop-blur-sm z-[100] transition-opacity duration-300 lg:hidden ${
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={handleClose}
            ></div>

            <aside className={`fixed lg:sticky top-0 left-0 w-[280px] h-screen bg-[#020617] border-r border-white/5 flex flex-col z-[101] transition-transform duration-300 lg:translate-x-0 ${
                isOpen ? 'translate-x-0' : '-translate-x-full'
            } flex-shrink-0`}>
                <div className="p-8 flex items-center justify-between">
                    <Link href="/admin" className="flex items-center gap-3" onClick={handleClose}>
                        <img
                            src="https://marktaleevents.com/mentorleap/wp-content/uploads/2026/03/WhatsApp-Image-2026-02-26-at-6.16.25-AM.jpeg"
                            alt="MentorLeap"
                            className="h-8 w-auto object-contain"
                        />
                        <span className="text-[10px] font-bold bg-[#00e5ff] text-black px-1.5 py-0.5 rounded uppercase tracking-tighter">Admin</span>
                    </Link>
                    <button onClick={handleClose} className="lg:hidden text-[#475569] hover:text-white transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                </div>
                <div className="px-8 pb-4">
                    <p className="text-[10px] text-[#475569] font-bold uppercase tracking-[0.2em] pl-1">Management Suite</p>
                </div>

                <div className="flex-1 px-4 overflow-y-auto">
                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={handleClose}
                                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all group ${active
                                        ? 'bg-[#00e5ff]/20 text-[#00e5ff]'
                                        : 'text-[#94a3b8] hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <Icon size={20} className={active ? 'text-[#00e5ff]' : 'text-[#64748b] group-hover:text-white'} />
                                    <span className="text-sm font-semibold">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-4 space-y-2">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#94a3b8] hover:bg-white/5 transition-all text-sm font-medium border border-transparent hover:border-white/10"
                    >
                        <ChevronLeft size={18} />
                        <span>Student View</span>
                    </Link>

                    <button
                        onClick={() => {
                            logout();
                            router.push('/auth/login');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500/80 hover:text-red-400 hover:bg-red-500/5 transition-all text-sm font-medium"
                    >
                        <LogOut size={20} />
                        <span>Exit Admin</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
