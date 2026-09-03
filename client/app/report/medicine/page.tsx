"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ComplaintForm from "@/features/complaints/components/ComplaintForm";
import ComplaintSuccessScreen from "@/features/complaints/components/ComplaintSuccessScreen";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/features/auth/context/AuthContext";

export default function MedicineReportPage() {
    const router = useRouter();
    const { user, isLoading } = useAuth();
    const [successRef, setSuccessRef] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/signin?redirect=/report/medicine");
        } else if (!isLoading && user && !user.isEmailVerified) {
            router.push("/verify-email");
        }
    }, [user, isLoading, router]);

    const handleComplaintReported = (referenceId: string) => {
        setSuccessRef(referenceId);
    };

    if (isLoading || !user) {
        return <div className="p-12 font-mono text-xs uppercase tracking-widest text-[#7A817D] animate-pulse">Loading...</div>;
    }

    if (successRef) {
        return (
            <ComplaintSuccessScreen
                referenceId={successRef}
                userEmail={user.email}
                hasPhone={false}
            />
        );
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
                <ComplaintForm 
                    category="MEDICINE" 
                    onReported={handleComplaintReported} 
                />
            </div>
        </div>
    );
}
