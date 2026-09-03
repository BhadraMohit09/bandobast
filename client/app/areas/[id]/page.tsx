"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Area } from "@/features/areas/types";
import { getAreaById } from "@/features/areas/api";
import { LocalityStatus } from "@/features/outages/types";
import { getLocalityStatus } from "@/features/outages/api";
import { PredictionPanel } from "@/features/predictions/components/PredictionPanel";
import OutageList from "@/features/outages/components/OutageList";
import { buttonVariants } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, CheckCircle2, Zap, Droplets } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AreaDetailPage() {
    const params = useParams();
    const id = Number(params.id);
    const [area, setArea] = useState<Area | null>(null);
    const [status, setStatus] = useState<LocalityStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        Promise.all([
            getAreaById(id),
            getLocalityStatus(id)
        ])
        .then(([areaData, statusData]) => {
            setArea(areaData);
            setStatus(statusData);
        })
        .catch(() => setError("Failed to load area details."))
        .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen p-6 md:p-12 max-w-[1280px] mx-auto w-full">
                <div className="space-y-8 animate-pulse">
                    <div className="h-4 w-32 bg-[#D8D8D1] rounded"></div>
                    <div className="border-b border-[#D8D8D1] pb-12">
                        <div className="h-12 w-64 bg-[#D8D8D1] rounded mb-4"></div>
                        <div className="h-4 w-24 bg-[#D8D8D1] rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !area) {
        return (
            <div className="min-h-screen p-6 md:p-12 max-w-[1280px] mx-auto w-full">
                <div className="border-t border-[#D8D8D1] pt-12 text-left">
                    <AlertCircle className="h-8 w-8 text-[#B34435] mb-6" />
                    <h2 className="font-serif text-3xl font-medium text-[#10201B] mb-2">{error || "Area not found"}</h2>
                    <p className="font-sans text-[#5E6B68] mb-8">The locality you are looking for does not exist or there was a problem loading it.</p>
                    <Link href="/areas" className="font-mono text-xs uppercase tracking-widest text-[#10201B] hover:text-[#5E6B68] transition-colors flex items-center">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Areas
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 md:p-12 max-w-[1280px] mx-auto w-full">
            <div className="mb-12 md:mb-16">
                <Link href="/areas" className="font-mono text-[10px] uppercase tracking-widest text-[#7A817D] hover:text-[#10201B] transition-colors flex items-center mb-8 md:mb-16">
                    <ArrowLeft className="mr-2 h-3 w-3" /> Back to Areas
                </Link>
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                    <div>
                        <span className="font-mono text-xs uppercase tracking-widest text-[#10201B] block mb-4">
                            Area · {area.name.split(" ")[0]}
                        </span>
                        <h1 className="font-serif text-4xl md:text-6xl font-medium tracking-tight text-[#10201B] mb-4">
                            {area.name}
                        </h1>
                        <span className="font-mono text-xs text-[#5E6B68] uppercase tracking-widest block">
                            PIN {area.pinCode}
                        </span>
                    </div>
                    <Link 
                        href={`/report?areaId=${id}`} 
                        className={cn(
                            buttonVariants({ variant: "default" }),
                            "rounded-full bg-[#10201B] hover:bg-[#10201B]/90 text-white font-sans font-medium px-8 h-12 transition-transform hover:scale-[1.02]"
                        )}
                    >
                        Report outage here
                    </Link>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start">
                {/* Main Content Column */}
                <div className="lg:col-span-8 flex flex-col gap-12 md:gap-16">
                    
                    <section>
                        <h2 className="font-mono text-xs uppercase tracking-widest text-[#10201B] border-b border-[#D8D8D1] pb-4 mb-8">
                            Prediction
                        </h2>
                        <PredictionPanel localityId={id} />
                    </section>
                    
                    <section>
                        <h2 className="font-mono text-xs uppercase tracking-widest text-[#10201B] border-b border-[#D8D8D1] pb-4 mb-8">
                            Recent Reports
                        </h2>
                        <OutageList localityId={id} />
                    </section>

                </div>

                {/* Sidebar Column */}
                <aside className="lg:col-span-4 order-first lg:order-none mb-8 lg:mb-0">
                    <h2 className="font-mono text-xs uppercase tracking-widest text-[#10201B] border-b border-[#D8D8D1] pb-4 mb-6">
                        Current Status
                    </h2>
                    
                    {!status || (!status.hasActivePowerOutage && !status.hasActiveWaterOutage) ? (
                        <div className="flex items-start gap-3 p-5 bg-[#EBEBE3] border border-[#D8D8D1]">
                            <CheckCircle2 className="h-5 w-5 text-[#5E6B68] shrink-0" />
                            <div>
                                <p className="font-serif text-lg text-[#10201B] mb-1 leading-tight">All clear</p>
                                <p className="font-sans text-sm text-[#5E6B68]">No active outages reported recently.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {status.hasActivePowerOutage && (
                                <div className="flex items-start gap-3 p-5 bg-[#B7791F]/10 border border-[#B7791F]/20">
                                    <Zap className="h-5 w-5 text-[#B7791F] shrink-0" />
                                    <div>
                                        <p className="font-serif text-lg text-[#10201B] mb-1 leading-tight">Power Outage Active</p>
                                        <p className="font-sans text-sm text-[#5E6B68]">
                                            Last reported: {status.lastPowerReport ? new Date(status.lastPowerReport.endsWith('Z') ? status.lastPowerReport : status.lastPowerReport + 'Z').toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Recently'}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {status.hasActiveWaterOutage && (
                                <div className="flex items-start gap-3 p-5 bg-[#147A8A]/10 border border-[#147A8A]/20">
                                    <Droplets className="h-5 w-5 text-[#147A8A] shrink-0" />
                                    <div>
                                        <p className="font-serif text-lg text-[#10201B] mb-1 leading-tight">Water Outage Active</p>
                                        <p className="font-sans text-sm text-[#5E6B68]">
                                            Last reported: {status.lastWaterReport ? new Date(status.lastWaterReport.endsWith('Z') ? status.lastWaterReport : status.lastWaterReport + 'Z').toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Recently'}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
}
