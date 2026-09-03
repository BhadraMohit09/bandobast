"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";
import OutageForm from "@/features/outages/components/OutageForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/features/auth/context/AuthContext";

function InfrastructureReport() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, isLoading } = useAuth();
    const areaId = searchParams.get("areaId");

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/signin?redirect=/report/infrastructure" + (areaId ? `%3FareaId=${areaId}` : ""));
        } else if (!isLoading && user && !user.isEmailVerified) {
            router.push("/verify-email");
        }
    }, [user, isLoading, router, areaId]);

    const handleOutageReported = (localityId: number) => {
        router.push(`/areas/${localityId}`);
    };

    if (isLoading || !user) {
        return <div className="p-12 font-mono text-xs uppercase tracking-widest text-[#7A817D] animate-pulse">Loading...</div>;
    }

    return (
        <div className="min-h-[calc(100vh-82px)] flex flex-col p-6 md:p-12 max-w-[1280px] mx-auto w-full">
            <Link 
                href="/report" 
                className="font-mono text-[10px] uppercase tracking-widest text-[#7A817D] hover:text-[#10201B] transition-colors flex items-center mb-12 self-start"
            >
                <ArrowLeft className="mr-2 h-3 w-3" /> Back to categories
            </Link>
            
            <div className="flex-1 flex flex-col justify-start max-w-2xl animate-in fade-in duration-300">
                <h1 className="font-serif text-[40px] leading-[1.1] text-[#10201B] tracking-tight mb-8">
                    Report Outage
                </h1>
                <OutageForm
                    defaultAreaId={areaId ? Number(areaId) : undefined}
                    onReported={handleOutageReported}
                />
            </div>
        </div>
    );
}

export default function InfrastructurePage() {
    return (
        <Suspense fallback={
            <div className="min-h-[calc(100vh-82px)] p-6 md:p-12 max-w-[1280px] mx-auto w-full">
                <div className="font-mono text-xs uppercase tracking-widest text-[#7A817D] animate-pulse">Loading...</div>
            </div>
        }>
            <InfrastructureReport />
        </Suspense>
    );
}
