"use client";

import { useEffect, useState } from "react";
import { Area } from "@/features/areas/types";
import { getAreas } from "@/features/areas/api";
import { AreaCard } from "@/features/areas/components/AreaCard";
import dynamic from "next/dynamic";

const AreaMap = dynamic(() => import("@/features/map/components/AreaMap"), { 
    ssr: false,
    loading: () => (
        <div className="w-full h-[400px] md:h-[500px] bg-[#EBEBE3] border-y border-[#D8D8D1] animate-pulse flex items-center justify-center mb-16">
            <span className="font-mono text-xs uppercase tracking-widest text-[#7A817D]">Loading Map...</span>
        </div>
    )
});

export default function AreasPage() {
    const [areas, setAreas] = useState<Area[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1); // Reset page on new search
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        setLoading(true);
        getAreas(debouncedSearch, page, 10)
            .then(res => {
                setAreas(res.items);
                setTotalPages(res.totalPages);
            })
            .finally(() => setLoading(false));
    }, [debouncedSearch, page]);

    return (
        <div className="min-h-screen p-0 md:pt-12 mx-auto w-full">
            <div className="mb-12 max-w-2xl px-6 md:px-12 mx-auto w-full max-w-[1280px]">
                <span className="font-mono text-xs uppercase tracking-widest text-[#10201B] block mb-4">
                    Areas
                </span>
                <h1 className="font-serif text-4xl md:text-5xl font-medium tracking-tight text-[#10201B] mb-6">
                    Explore local outage intelligence.
                </h1>
                <p className="text-[#5E6B68] font-sans text-lg md:text-xl">
                    Select a locality to view recent reports and historical patterns.
                </p>
            </div>

            <AreaMap />

            <div className="px-6 md:px-12 max-w-[1280px] mx-auto w-full py-12">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                    <h2 className="font-serif text-2xl text-[#10201B]">Browse Areas</h2>
                    <input 
                        type="text" 
                        placeholder="Search locality or pincode..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full sm:w-72 h-10 px-4 rounded-full border border-[#D8D8D1] bg-white font-sans text-sm focus:outline-none focus:border-[#10201B] focus:ring-1 focus:ring-[#10201B] transition-all"
                    />
                </div>

                {loading ? (
                    <div className="space-y-0">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="h-24 border-t border-[#D8D8D1] bg-white/40 animate-pulse"></div>
                        ))}
                    </div>
                ) : areas.length === 0 ? (
                    <div className="py-24 border-t border-[#D8D8D1] text-center">
                        <p className="font-mono text-sm uppercase tracking-widest text-[#7A817D]">No areas found</p>
                    </div>
                ) : (
                    <div className="flex flex-col border-b border-[#D8D8D1]">
                        {areas.map((area) => (
                            <AreaCard key={area.id} area={area} />
                        ))}
                    </div>
                )}

                {!loading && totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-12">
                        <button 
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="h-10 px-6 rounded-full border border-[#D8D8D1] font-sans text-sm font-medium disabled:opacity-50 hover:bg-white transition-colors"
                        >
                            Previous
                        </button>
                        <span className="font-mono text-sm text-[#7A817D]">
                            Page {page} of {totalPages}
                        </span>
                        <button 
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="h-10 px-6 rounded-full border border-[#D8D8D1] font-sans text-sm font-medium disabled:opacity-50 hover:bg-white transition-colors"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
