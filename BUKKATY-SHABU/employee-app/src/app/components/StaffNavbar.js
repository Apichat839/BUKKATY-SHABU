"use client";
import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const API_BASE_URL = 'http://localhost:8080';

const navItems = [
    {
        label: 'รายการสั่งอาหาร',
        path: '/staff',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
        ),
    },
    {
        label: 'จัดการโต๊ะ',
        path: '/staff/tables',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
        ),
    },
    {
        label: 'จัดการเมนู',
        path: '/staff/menu',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
        ),
    },
];

export default function StaffNavbar() {
    const router = useRouter();
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => router.push('/staff')}
                >
                    <img
                        src={`${API_BASE_URL}/imgs/11bkt.png`}
                        alt="Bukkaty Logo"
                        className="w-9 h-9 rounded-full border-2 border-primary object-cover bg-muted"
                    />
                    <div>
                        <h1 className="font-bold text-base leading-none tracking-wide text-foreground">BUKKATY</h1>
                        <span className="text-[10px] text-primary font-bold uppercase tracking-widest">Staff Dashboard</span>
                    </div>
                </div>

                {/* Nav Links */}
                <nav className="flex items-center gap-1">
                    {navItems.map((item) => {
                        const isActive =
                            item.path === '/staff'
                                ? pathname === '/staff'
                                : pathname.startsWith(item.path);
                        return (
                            <Button
                                key={item.path}
                                variant={isActive ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => router.push(item.path)}
                                className={cn('flex items-center gap-2 text-sm font-medium')}
                            >
                                {item.icon}
                                {item.label}
                            </Button>
                        );
                    })}
                </nav>
            </div>
        </header>
    );
}
