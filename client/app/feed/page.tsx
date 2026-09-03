"use client";

import { useEffect, useState } from "react";
import { getPublicComplaints, vouchForComplaint, ComplaintResponseDto } from "@/features/complaints/api/complaintApi";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Loader2, Flame, MapPin, CheckCircle2 } from "lucide-react";
import { FadeIn } from "@/components/ui/fade-in";

export default function FeedPage() {
    const { user } = useAuth();
    const [complaints, setComplaints] = useState<ComplaintResponseDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [vouchingId, setVouchingId] = useState<number | null>(null);

    useEffect(() => {
        fetchFeed();
    }, []);

    const fetchFeed = async () => {
        setLoading(true);
        try {
            const res = await getPublicComplaints(undefined, 1, 20);
            setComplaints(res.items);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleVouch = async (id: number, e: React.MouseEvent) => {
        e.preventDefault(); // In case it's in a link wrapper in future
        if (!user) {
            alert("Please sign in to vouch for complaints.");
            return;
        }

        const complaint = complaints.find(c => c.id === id);
        if (complaint && complaint.submitterName === user.displayName) {
            alert("You cannot vouch for your own complaint.");
            return;
        }

        setVouchingId(id);
        try {
            await vouchForComplaint(id);
            // Optimistically update
            setComplaints(prev => prev.map(c => 
                c.id === id ? { ...c, vouchCount: c.vouchCount + 1 } : c
            ));
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to vouch.");
        } finally {
            setVouchingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F4EF] p-4 md:p-8 pt-24">
            <div className="max-w-3xl mx-auto space-y-8">
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-12 border-b border-[#D8D8D1] pb-6">
                    <div>
                        <h1 className="font-serif text-4xl text-[#10201B] mb-2">Live Reports</h1>
                        <p className="font-sans text-[#5E6B68]">Real-time civic issues reported across the network.</p>
                    </div>
                    <div className="bg-[#10201B]/5 px-4 py-2 rounded-full border border-[#D8D8D1] flex items-center gap-2 text-sm font-sans">
                        <MapPin className="w-4 h-4 text-[#10201B]" />
                        <span>All Areas</span>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-[#10201B]" />
                    </div>
                ) : complaints.length === 0 ? (
                    <div className="text-center py-20 text-[#5E6B68] font-sans">
                        No reports found in the network.
                    </div>
                ) : (
                    <div className="space-y-6">
                        {complaints.map((c, idx) => (
                            <FadeIn key={c.id} direction="up" delay={idx * 0.05}>
                                <div className="bg-white p-6 rounded-[10px] border border-[#D8D8D1] shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-[#EBEBE3] rounded-full flex items-center justify-center font-serif text-[#10201B] text-lg">
                                                {c.submitterName.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-[#10201B] text-sm flex items-center gap-1.5">
                                                    {c.submitterName}
                                                    {c.submitterIsVerified && (
                                                        <CheckCircle2 className="w-4 h-4 text-[#147A8A]" />
                                                    )}
                                                </p>
                                                <p className="text-xs text-[#7A817D] font-mono">
                                                    {new Date(c.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="font-mono text-[10px] uppercase tracking-widest text-[#10201B] bg-[#F5F4EF] border border-[#D8D8D1] px-2 py-1 rounded-full">
                                            {c.category}
                                        </span>
                                    </div>
                                    
                                    <h3 className="font-serif text-xl text-[#10201B] mb-2">{c.title || c.publicReferenceId}</h3>
                                    {c.description && <p className="font-sans text-[#5E6B68] text-sm mb-4 line-clamp-3">{c.description}</p>}
                                    
                                    <div className="flex items-center justify-between pt-4 border-t border-[#F5F4EF]">
                                        <div className="flex items-center gap-2 text-xs font-mono text-[#7A817D]">
                                            <MapPin className="w-3.5 h-3.5" />
                                            {c.localityName || "Unknown Area"}
                                        </div>
                                        
                                        <button 
                                            onClick={(e) => handleVouch(c.id, e)}
                                            disabled={vouchingId === c.id}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F5F4EF] hover:bg-[#B34435]/10 text-[#5E6B68] hover:text-[#B34435] transition-colors border border-[#D8D8D1] hover:border-[#B34435]/30 text-sm font-medium"
                                        >
                                            {vouchingId === c.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Flame className={`w-4 h-4 ${c.vouchCount > 0 ? "text-[#B34435] fill-current" : ""}`} />
                                            )}
                                            <span>{c.vouchCount} Vouch{c.vouchCount !== 1 ? 'es' : ''}</span>
                                        </button>
                                    </div>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
