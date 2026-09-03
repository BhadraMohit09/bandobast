"use client";

import { useEffect, useState, useCallback } from "react";
import { getOutagesByLocality, resolveOutage } from "@/features/outages/api";
import { Outage, OutageType } from "@/features/outages/types";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Zap, Droplets, CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

function formatTimeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return "just now";
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "yesterday";
    
    return `${diffInDays}d ago`;
}

export default function OutageList({ localityId }: { localityId: number | null }) {
    const [outages, setOutages] = useState<Outage[]>([]);
    const [loading, setLoading] = useState(false);
    const [resolvingId, setResolvingId] = useState<number | null>(null);
    const [confirmResolveId, setConfirmResolveId] = useState<number | null>(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const { user } = useAuth();

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchOutages = useCallback(() => {
        if (localityId === null) return;
        setLoading(true);
        getOutagesByLocality(localityId, debouncedSearch, page, 10)
            .then(res => {
                setOutages(res.items);
                setTotalPages(res.totalPages);
            })
            .finally(() => setLoading(false));
    }, [localityId, debouncedSearch, page]);

    useEffect(() => {
        fetchOutages();
        const interval = setInterval(fetchOutages, 30000);
        return () => clearInterval(interval);
    }, [fetchOutages]);

    async function handleResolve(id: number) {
        setResolvingId(id);
        try {
            await resolveOutage(id);
            setConfirmResolveId(null);
            await fetchOutages();
        } catch (e) {
            console.error("Failed to resolve", e);
        } finally {
            setResolvingId(null);
        }
    }

    if (localityId === null) {
        return (
            <div className="py-12 border-t border-[#D8D8D1] text-left">
                <p className="font-mono text-sm uppercase tracking-widest text-[#7A817D]">Select an area to view reports.</p>
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 border-t border-[#D8D8D1] pt-8">
                <h3 className="font-serif text-xl text-[#10201B]">Reports</h3>
                <input 
                    type="text" 
                    placeholder="Search power or water..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full sm:w-64 h-9 px-4 rounded-full border border-[#D8D8D1] bg-white font-sans text-sm focus:outline-none focus:border-[#10201B] focus:ring-1 focus:ring-[#10201B] transition-all"
                />
            </div>

            <div className="flex flex-col">
                {loading && outages.length === 0 ? (
                    <div className="flex flex-col">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="py-6 border-b border-[#D8D8D1] flex justify-between">
                                <div className="h-4 w-32 bg-[#D8D8D1] rounded animate-pulse"></div>
                                <div className="h-4 w-16 bg-[#D8D8D1] rounded animate-pulse"></div>
                            </div>
                        ))}
                    </div>
                ) : !loading && outages.length === 0 ? (
                    <div className="py-12 text-left border-y border-[#D8D8D1]">
                        <p className="font-serif text-2xl font-medium text-[#10201B] mb-2">No recent reports</p>
                        <p className="font-sans text-[#5E6B68]">All clear in this area for that search.</p>
                    </div>
                ) : (
                    outages.map((o) => {
                        const isPower = o.type === OutageType.Power;
                        const Icon = isPower ? Zap : Droplets;
                        const label = isPower ? "Power Outage" : "Water Outage";
                        const accentColor = isPower ? "text-[#B7791F]" : "text-[#147A8A]";
                        const isOwner = user && user.userId === o.userId;
                        
                        return (
                            <div key={o.id} className="py-6 border-b border-[#D8D8D1] flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <Icon className={`h-4 w-4 ${accentColor}`} strokeWidth={2.5} />
                                    <span className={`font-mono text-xs uppercase tracking-widest ${accentColor}`}>
                                        {label}
                                    </span>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="font-serif italic text-lg text-[#5E6B68]">
                                        {formatTimeAgo(o.reportedAt)}
                                    </div>
                                    {isOwner && (
                                        <button
                                            onClick={() => setConfirmResolveId(o.id)}
                                            disabled={resolvingId === o.id}
                                            className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-[#5E6B68] hover:text-[#10201B] transition-colors disabled:opacity-50"
                                        >
                                            <CheckCircle2 className="h-3 w-3" />
                                            {resolvingId === o.id ? "Resolving..." : "Mark Resolved"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {!loading && totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                    <button 
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="h-9 px-4 rounded-full border border-[#D8D8D1] font-sans text-xs font-medium disabled:opacity-50 hover:bg-[#EBEBE3] transition-colors"
                    >
                        Previous
                    </button>
                    <span className="font-mono text-xs text-[#7A817D]">
                        Page {page} of {totalPages}
                    </span>
                    <button 
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="h-9 px-4 rounded-full border border-[#D8D8D1] font-sans text-xs font-medium disabled:opacity-50 hover:bg-[#EBEBE3] transition-colors"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Resolve Confirmation Modal */}
            {confirmResolveId !== null && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div 
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
                        onClick={() => setConfirmResolveId(null)}
                    ></div>
                    
                    <div className="bg-[#F5F4EF] rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-xl border border-[#D8D8D1] transform transition-all relative z-10 animate-in zoom-in-95 duration-200">
                        <div className="w-12 h-12 rounded-full bg-[#147A8A]/10 flex items-center justify-center mb-5">
                            <CheckCircle2 className="w-6 h-6 text-[#147A8A]" />
                        </div>
                        
                        <h3 className="font-serif text-2xl font-medium text-[#10201B] mb-2">Resolve Outage?</h3>
                        <p className="font-sans text-[#5E6B68] text-[15px] mb-8 leading-relaxed">
                            Are you sure you want to mark this outage as resolved? This will update the status for everyone in the community.
                        </p>
                        
                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => setConfirmResolveId(null)}
                                className="font-sans font-medium px-5 h-10 rounded-xl border border-[#D8D8D1] text-[#10201B] hover:bg-[#EBEBE3] transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => handleResolve(confirmResolveId)}
                                disabled={resolvingId === confirmResolveId}
                                className="font-sans font-medium px-6 h-10 rounded-xl bg-[#10201B] text-white hover:bg-[#10201B]/90 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                            >
                                {resolvingId === confirmResolveId ? "Resolving..." : "Yes, Resolve it"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}