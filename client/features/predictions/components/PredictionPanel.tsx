"use client";

import { useEffect, useState } from "react";
import { getPredictions } from "@/features/predictions/api";
import { PredictionResponse } from "@/features/predictions/types";
import { cn } from "@/lib/utils";

export function PredictionPanel({ localityId }: { localityId: number | null }) {
    const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (localityId === null) return;
        setLoading(true);
        setError(null);
        getPredictions(localityId)
            .then(setPrediction)
            .catch(() => setError("Failed to load predictions."))
            .finally(() => setLoading(false));
    }, [localityId]);

    if (loading) {
        return (
            <div className="flex flex-col items-start py-8">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#7A817D] mb-4">Analyzing patterns</span>
                <div className="h-8 w-64 bg-[#D8D8D1] rounded animate-pulse"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-8 text-left border-l-2 border-[#B34435] pl-6">
                <p className="font-sans text-[#B34435]">{error}</p>
            </div>
        );
    }

    const patterns = prediction?.patterns || [];

    if (patterns.length === 0) {
        return (
            <div className="py-8 flex flex-col items-start">
                <p className="font-serif text-3xl font-medium text-[#10201B] mb-4">Not enough reports yet.</p>
                <p className="font-sans text-[#5E6B68] max-w-md leading-relaxed mb-6">
                    bandobast needs more local reports before a recurring outage pattern can be identified.
                </p>
                <a href={`/report?areaId=${localityId}`} className="font-mono text-xs uppercase tracking-widest text-[#10201B] hover:text-[#10201B] transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-[#10201B] hover:after:w-full after:transition-all">
                    Report an outage
                </a>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-12">
            {patterns.map((pattern, index) => {
                const isPower = pattern.outageType.toLowerCase() === "power";
                const accentColor = isPower ? "text-[#B7791F]" : "text-[#147A8A]";
                const accentBg = isPower ? "bg-[#B7791F]" : "bg-[#147A8A]";
                
                return (
                    <div key={index} className="flex flex-col items-start">
                        <p className="font-serif text-3xl md:text-4xl font-medium text-[#10201B] leading-tight mb-8 max-w-2xl">
                            {pattern.outageType} outages are most frequently reported between {pattern.hourBucketStart}:00 and {pattern.hourBucketEnd}:00 on {pattern.dayOfWeek}s.
                        </p>
                        
                        <div className="grid grid-cols-3 gap-8 md:gap-16 w-full border-t border-[#D8D8D1] pt-6 mb-8">
                            <div className="flex flex-col">
                                <span className="font-mono text-[10px] uppercase tracking-widest text-[#7A817D] mb-1">Based on</span>
                                <span className="font-sans text-[#10201B]">{pattern.occurrenceCount} reports</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-mono text-[10px] uppercase tracking-widest text-[#7A817D] mb-1">Window</span>
                                <span className="font-sans text-[#10201B]">{pattern.hourBucketStart}:00 – {pattern.hourBucketEnd}:00</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-mono text-[10px] uppercase tracking-widest text-[#7A817D] mb-1">Day</span>
                                <span className="font-sans text-[#10201B]">{pattern.dayOfWeek}</span>
                            </div>
                        </div>

                        {/* Minimal Timeline */}
                        <div className="w-full relative mt-4 h-8 flex items-center">
                            <div className="absolute w-full h-px bg-[#D8D8D1]"></div>
                            <div className="absolute left-0 -top-2 flex flex-col items-center">
                                <div className="h-4 w-px bg-[#D8D8D1] mb-2"></div>
                                <span className="font-mono text-[10px] uppercase text-[#7A817D]">00:00</span>
                            </div>
                            <div className="absolute right-0 -top-2 flex flex-col items-center">
                                <div className="h-4 w-px bg-[#D8D8D1] mb-2"></div>
                                <span className="font-mono text-[10px] uppercase text-[#7A817D]">24:00</span>
                            </div>
                            
                            {/* Active block calculated by bucket */}
                            <div 
                                className={cn("absolute h-1 -translate-y-1/2", accentBg)}
                                style={{ 
                                    left: `${(pattern.hourBucketStart / 24) * 100}%`, 
                                    width: `${((pattern.hourBucketEnd - pattern.hourBucketStart) / 24) * 100}%` 
                                }}
                            ></div>
                            
                            <div 
                                className="absolute -top-2 flex flex-col items-center"
                                style={{ left: `${(pattern.hourBucketStart / 24) * 100}%` }}
                            >
                                <div className="h-4 w-px bg-[#10201B] mb-2"></div>
                                <span className={cn("font-mono text-[10px] uppercase", accentColor)}>{pattern.hourBucketStart}:00</span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
