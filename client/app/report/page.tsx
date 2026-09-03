"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/features/auth/context/AuthContext";
import { cn } from "@/lib/utils";

function ReportHome() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, isLoading } = useAuth();
    
    // If areaId is present, they probably came from a specific area page and want to report an outage
    // Let's forward them straight to infrastructure
    const areaId = searchParams.get("areaId");

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/signin?redirect=/report" + (areaId ? `%3FareaId=${areaId}` : ""));
        } else if (!isLoading && user && !user.isEmailVerified) {
            router.push("/verify-email");
        } else if (!isLoading && user && user.isEmailVerified && areaId) {
            router.push(`/report/infrastructure?areaId=${areaId}`);
        }
    }, [user, isLoading, router, areaId]);

    if (isLoading || !user || areaId) {
        return <div className="p-12 font-mono text-xs uppercase tracking-widest text-[#7A817D] animate-pulse">Loading...</div>;
    }

    return (
        <div className="min-h-[calc(100vh-82px)] flex flex-col p-6 md:p-12 max-w-[1280px] mx-auto w-full">
            <Link 
                href="/" 
                className="font-mono text-[10px] uppercase tracking-widest text-[#7A817D] hover:text-[#10201B] transition-colors flex items-center mb-12 self-start"
            >
                <ArrowLeft className="mr-2 h-3 w-3" /> Back Home
            </Link>
            
            <div className="flex-1 flex flex-col justify-start max-w-2xl animate-in fade-in duration-300">
                <h1 className="font-serif text-[40px] leading-[1.1] text-[#10201B] tracking-tight mb-4">
                    Report an issue
                </h1>
                <p className="font-sans text-[15px] text-[#5E6B68] mb-8">
                    What type of issue would you like to report?
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                        { id: "infrastructure", title: "Infrastructure", desc: "Power or water outages" },
                        { id: "food", title: "Food Safety", desc: "Unsafe, adulterated, or mislabeled food" },
                        { id: "medicine", title: "Medicine Safety", desc: "Unsafe or mislabeled medicine" },
                        { id: "drug", title: "Drug Safety", desc: "Unsafe or illegal drug concerns" }
                    ].map((cat) => (
                        <Link
                            key={cat.id}
                            href={`/report/${cat.id}`}
                            className="flex flex-col text-left p-6 bg-white border border-[#D8D8D1] rounded-[10px] hover:-translate-y-[2px] hover:shadow-[0_6px_16px_rgba(20,122,138,0.06)] hover:border-[#147A8A]/40 transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-[#147A8A]/50 group"
                        >
                            <span className="font-serif text-xl text-[#10201B] group-hover:text-[#147A8A] transition-colors mb-1">{cat.title}</span>
                            <span className="font-sans text-[13px] text-[#7A817D] group-hover:text-[#5E6B68] transition-colors">{cat.desc}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function ReportPage() {
    return (
        <Suspense fallback={
            <div className="min-h-[calc(100vh-82px)] p-6 md:p-12 max-w-[1280px] mx-auto w-full">
                <div className="font-mono text-xs uppercase tracking-widest text-[#7A817D] animate-pulse">Loading...</div>
            </div>
        }>
            <ReportHome />
        </Suspense>
    );
}
