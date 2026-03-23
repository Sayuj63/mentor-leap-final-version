"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    BookOpen,
    Calendar,
    Award,
    Bot,
    User,
    Settings,
    LogOut,
    Shield,
    Search,
    X,
    Home
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

const navItems = [
    { label: 'Back to Home', href: '/', icon: Home },
    { label: 'Overview', href: '/dashboard/overview', icon: LayoutDashboard },
    { label: 'Explore Courses', href: '/dashboard/explore', icon: Search },
    { label: 'My Courses', href: '/dashboard/my-courses', icon: BookOpen },
    { label: 'My Events', href: '/dashboard/my-events', icon: Calendar },
    { label: 'Certificates', href: '/dashboard/certificates', icon: Award },
    { label: 'AI Assistant', href: '/dashboard/ai-assistant', icon: Bot },
];

const secondaryItems = [
    { label: 'Profile', href: '/dashboard/profile', icon: User },
];

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const { logout, isAdmin } = useAuth();

    return (
        <>
            {/* Backdrop for mobile */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
                    onClick={onClose}
                />
            )}

            <aside className={`
                fixed inset-y-0 left-0 z-50 w-[280px] bg-[#020617] border-r border-white/5 flex flex-col h-screen
                transition-transform duration-300 ease-in-out md:static md:translate-x-0 md:flex-shrink-0
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* Logo Section */}
                <div className="p-8 flex items-center justify-between">
                    <Link href="/dashboard" className="block" onClick={onClose}>
                        <img
                            src="https://marktaleevents.com/mentorleap/wp-content/uploads/2026/03/WhatsApp-Image-2026-02-26-at-6.16.25-AM.jpeg"
                            alt="MentorLeap"
                            className="h-10 w-auto object-contain"
                        />
                    </Link>
                    {/* Close button for mobile */}
                    <button 
                        onClick={onClose}
                        className="p-2 text-[#94a3b8] hover:text-white md:hidden"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Main Navigation */}
                <div className="flex-1 px-4 overflow-y-auto custom-scrollbar">
                    <nav className="space-y-1">
                        <p className="px-4 text-[10px] font-bold text-[#475569] uppercase tracking-widest mb-4">Main Menu</p>
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={onClose}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${active
                                        ? 'bg-[#00e5ff]/10 text-[#00e5ff]'
                                        : 'text-[#94a3b8] hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <Icon size={20} className={active ? 'text-[#00e5ff]' : 'text-[#64748b] group-hover:text-white'} />
                                    <span className="text-sm font-medium">{item.label}</span>
                                    {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00e5ff] shadow-[0_0_8px_rgba(0,229,255,0.8)]"></div>}
                                </Link>
                            );
                        })}
                    </nav>

                    <nav className="mt-10 space-y-1">
                        <p className="px-4 text-[10px] font-bold text-[#475569] uppercase tracking-widest mb-4">Account</p>
                        {secondaryItems.map((item) => {
                            const Icon = item.icon;
                            const active = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={onClose}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${active
                                        ? 'bg-[#00e5ff]/10 text-[#00e5ff]'
                                        : 'text-[#94a3b8] hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <Icon size={20} className={active ? 'text-[#00e5ff]' : 'text-[#64748b] group-hover:text-white'} />
                                    <span className="text-sm font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* ADMIN SHORTCUT */}
                    {isAdmin && (
                        <nav className="mt-10 space-y-1">
                            <p className="px-4 text-[10px] font-bold text-[#facc15] uppercase tracking-widest mb-4">Management</p>
                            <Link
                                href="/admin"
                                onClick={onClose}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.05)] border border-amber-500/20"
                            >
                                <Shield size={20} />
                                <span className="text-sm font-bold">Admin Panel</span>
                            </Link>
                        </nav>
                    )}
                </div>

                {/* Footer / Logout */}
                <div className="p-4 border-t border-white/5 mt-auto">
                    <button
                        onClick={() => {
                            onClose();
                            logout();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400/80 hover:text-red-400 hover:bg-red-500/5 transition-all text-sm font-medium"
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
