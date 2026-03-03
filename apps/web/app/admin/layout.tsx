"use client";

import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import AdminSidebar from '../../components/admin/AdminSidebar';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />

            <div className="flex flex-grow">
                <AdminSidebar />

                <main className="flex-grow p-4 lg:p-10 max-w-[1400px]">
                    {children}
                </main>
            </div>

            <Footer />
        </div>
    );
}
