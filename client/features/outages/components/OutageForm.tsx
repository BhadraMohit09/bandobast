"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getAreas } from "@/features/areas/api";
import { Area } from "@/features/areas/types";
import { createOutage } from "@/features/outages/api";
import { OutageType } from "@/features/outages/types";
import { AlertCircle, CheckCircle2, Zap, Droplets, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { AddAreaFlow } from "@/features/areas/components/AddAreaFlow";

// Native implementation for the select to avoid Radix UI ID-display issues and have full styling control
export default function OutageForm({ defaultAreaId, onReported, onAreaSelected }: { defaultAreaId?: number; onReported?: (localityId: number) => void; onAreaSelected?: (id: number | null) => void }) {
    const [areas, setAreas] = useState<Area[]>([]);
    const [localityId, setLocalityId] = useState<string>(defaultAreaId ? String(defaultAreaId) : "");
    const [type, setType] = useState<OutageType | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isAreaDropdownOpen, setIsAreaDropdownOpen] = useState(false);

    useEffect(() => {
        getAreas().then(res => setAreas(res.items)).catch(() => setError("Failed to load areas."));
    }, []);

    useEffect(() => {
        if (defaultAreaId) {
            setLocalityId(String(defaultAreaId));
        }
    }, [defaultAreaId]);

    useEffect(() => {
        onAreaSelected?.(localityId ? Number(localityId) : null);
    }, [localityId, onAreaSelected]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!localityId || type === null) {
            setError("Please select both area and outage type.");
            return;
        }

        setSubmitting(true);

        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            setSubmitting(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    await createOutage({
                        localityId: Number(localityId),
                        type: type,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                    setSuccess(true);
                    onReported?.(Number(localityId));
                } catch (err: any) {
                    if (err.response?.status === 409 && err.response.data?.message) {
                        setError(err.response.data.message);
                    } else if (err.response?.data?.message) {
                        setError(err.response.data.message);
                    } else if (err.response?.data?.Error) {
                        setError(err.response.data.Error);
                    } else {
                        setError("Failed to report outage. Please try again.");
                    }
                } finally {
                    setSubmitting(false);
                }
            },
            (geoErr) => {
                setError("Please allow location access to verify this outage report.");
                setSubmitting(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }

    const selectedArea = areas.find(a => String(a.id) === localityId);

    if (success) {
        return (
            <div className="w-full max-w-md">
                <span className="font-mono text-xs uppercase tracking-widest text-[#10201B] block mb-6">
                    Report Received
                </span>
                <div className="flex items-start gap-3 p-6 bg-white border border-[#D8D8D1]">
                    <CheckCircle2 className="h-5 w-5 text-[#10201B] shrink-0 mt-0.5" />
                    <div>
                        <p className="font-serif text-xl text-[#10201B] mb-2">Thank you</p>
                        <p className="font-sans text-sm text-[#5E6B68]">Your outage report has been added to the local activity feed.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md">
            <span className="font-mono text-xs uppercase tracking-widest text-[#10201B] block mb-4">
                Report an Outage
            </span>
            <p className="font-serif text-2xl md:text-3xl font-medium text-[#10201B] mb-8 leading-tight">
                Help your community document a local disruption.
            </p>

            <form onSubmit={handleSubmit} className="space-y-8 border-t border-[#D8D8D1] pt-8">
                {/* Custom Area Select */}
                <div className="space-y-4 relative">
                    <label className="font-mono text-[10px] uppercase tracking-widest text-[#7A817D] block">
                        Area
                    </label>
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setIsAreaDropdownOpen(!isAreaDropdownOpen)}
                            className="w-full flex items-center justify-between border-b border-[#10201B] pb-3 text-left bg-transparent focus:outline-none"
                        >
                            <span className={cn("font-serif text-xl", !selectedArea && "text-[#7A817D]")}>
                                {selectedArea ? `${selectedArea.name} — PIN ${selectedArea.pinCode}` : "[ Select your area ]"}
                            </span>
                            <ChevronDown className="h-4 w-4 text-[#10201B] opacity-50" />
                        </button>
                        
                        {isAreaDropdownOpen && (
                            <div className="absolute top-full left-0 w-full mt-2 bg-[#F5F4EF] border border-[#D8D8D1] shadow-xl z-50 max-h-[300px] overflow-y-auto">
                                {areas.map((area) => (
                                    <button
                                        key={area.id}
                                        type="button"
                                        onClick={() => {
                                            setLocalityId(String(area.id));
                                            setIsAreaDropdownOpen(false);
                                        }}
                                        className="w-full text-left px-6 py-4 border-b border-[#D8D8D1] last:border-0 hover:bg-white transition-colors flex flex-col"
                                    >
                                        <span className="font-serif text-lg text-[#10201B]">{area.name}</span>
                                        <span className="font-mono text-[10px] uppercase tracking-widest text-[#5E6B68] mt-1">PIN {area.pinCode}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <AddAreaFlow onAreaCreated={(newArea) => {
                        setAreas(prev => [...prev, newArea].sort((a, b) => a.name.localeCompare(b.name)));
                        setLocalityId(String(newArea.id));
                    }} />
                </div>

                {/* Outage Type Selection Blocks */}
                <div className="space-y-4">
                    <label className="font-mono text-[10px] uppercase tracking-widest text-[#7A817D] block">
                        Outage
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setType(OutageType.Power)}
                            className={cn(
                                "flex flex-col items-center justify-center p-6 border transition-all text-center group",
                                type === OutageType.Power 
                                    ? "border-[#B7791F] bg-[#B7791F]/5" 
                                    : "border-[#D8D8D1] bg-white hover:border-[#10201B]/20"
                            )}
                        >
                            <Zap className={cn("h-6 w-6 mb-3", type === OutageType.Power ? "text-[#B7791F]" : "text-[#7A817D] group-hover:text-[#10201B]")} />
                            <span className={cn("font-mono text-xs uppercase tracking-widest", type === OutageType.Power ? "text-[#B7791F]" : "text-[#10201B]")}>Power</span>
                        </button>
                        
                        <button
                            type="button"
                            onClick={() => setType(OutageType.Water)}
                            className={cn(
                                "flex flex-col items-center justify-center p-6 border transition-all text-center group",
                                type === OutageType.Water 
                                    ? "border-[#147A8A] bg-[#147A8A]/5" 
                                    : "border-[#D8D8D1] bg-white hover:border-[#10201B]/20"
                            )}
                        >
                            <Droplets className={cn("h-6 w-6 mb-3", type === OutageType.Water ? "text-[#147A8A]" : "text-[#7A817D] group-hover:text-[#10201B]")} />
                            <span className={cn("font-mono text-xs uppercase tracking-widest", type === OutageType.Water ? "text-[#147A8A]" : "text-[#10201B]")}>Water</span>
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="flex items-start gap-2 pt-2 text-[#B34435] font-sans text-sm">
                        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                <div className="pt-6 border-t border-[#D8D8D1]">
                    <Button 
                        type="submit" 
                        disabled={submitting} 
                        className="w-full md:w-auto rounded-full bg-[#10201B] hover:bg-[#10201B]/90 text-white font-sans font-medium px-8 h-12 transition-transform hover:scale-[1.02]"
                    >
                        {submitting ? "Submitting..." : "Submit report"}
                    </Button>
                </div>
            </form>
            
            {/* Click outside overlay for dropdown */}
            {isAreaDropdownOpen && (
                <div className="fixed inset-0 z-40" onClick={() => setIsAreaDropdownOpen(false)}></div>
            )}
        </div>
    );
}