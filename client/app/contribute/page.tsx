"use client";

import { useState } from "react";
import { CheckCircle2, ShieldCheck, Heart, Loader2 } from "lucide-react";
import { FadeIn } from "@/components/ui/fade-in";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/context/AuthContext";
import { purchaseVerification } from "@/features/users/api";
import { useRouter } from "next/navigation";

export default function ContributePage() {
    const { token, user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleUpgrade = async () => {
        if (!user) {
            router.push("/signin");
            return;
        }

        if (!token) return;

        setLoading(true);
        try {
            await purchaseVerification(token);
            setSuccess(true);
            setTimeout(() => {
                router.push("/profile");
            }, 2000);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen p-6 md:p-12 max-w-[1280px] mx-auto w-full">
            <FadeIn direction="up">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h1 className="font-serif text-4xl md:text-5xl font-medium tracking-tight text-[#10201B] mb-6">
                        Support the platform.
                    </h1>
                    <p className="font-sans text-[#5E6B68] text-lg leading-relaxed">
                        bandobast is powered by the community. Your contributions help keep our servers running and our network independent.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Tier 1: General Contribution */}
                    <div className="bg-[#F5F4EF] p-8 border border-[#D8D8D1] rounded-[10px] flex flex-col justify-between">
                        <div>
                            <div className="w-12 h-12 bg-[#10201B]/5 rounded-full flex items-center justify-center mb-6">
                                <Heart className="w-6 h-6 text-[#10201B]" />
                            </div>
                            <h2 className="font-serif text-2xl text-[#10201B] mb-2">Community Supporter</h2>
                            <p className="font-sans text-[#5E6B68] text-sm mb-8">
                                A one-time contribution to help us maintain servers and keep the platform free for everyone.
                            </p>
                            <div className="space-y-4 mb-8">
                                {["₹100 (Buy us a Chai)", "₹500 (Server Supporter)", "Custom Amount"].map((tier, i) => (
                                    <button key={i} className="w-full text-left p-4 rounded-lg border border-[#D8D8D1] bg-white hover:border-[#10201B] transition-colors font-mono text-sm text-[#10201B]">
                                        {tier}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button className="w-full h-12 bg-[#10201B] text-white font-sans font-medium rounded-full hover:bg-[#10201B]/90 transition-colors">
                            Contribute Now
                        </button>
                    </div>

                    {/* Tier 2: Verification */}
                    <div className="bg-white p-8 border-2 border-[#147A8A] rounded-[10px] relative flex flex-col justify-between shadow-lg">
                        <div className="absolute top-0 right-0 bg-[#147A8A] text-white font-mono text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-bl-[10px]">
                            Recommended
                        </div>
                        <div>
                            <div className="w-12 h-12 bg-[#147A8A]/10 rounded-full flex items-center justify-center mb-6">
                                <ShieldCheck className="w-6 h-6 text-[#147A8A]" />
                            </div>
                            <h2 className="font-serif text-2xl text-[#10201B] mb-2 flex items-center gap-2">
                                Bandobast Verified
                            </h2>
                            <p className="font-sans text-[#5E6B68] text-sm mb-6">
                                Stand out as a trusted community member. Get the official verified badge next to your name across the platform.
                            </p>
                            <div className="flex items-baseline gap-1 mb-8">
                                <span className="font-serif text-4xl text-[#10201B]">₹499</span>
                                <span className="font-mono text-xs text-[#7A817D]">/year</span>
                            </div>
                            <ul className="space-y-3 mb-8">
                                {["Verified badge on profile & reports", "Priority listing on public feed", "Exclusive civic avatars", "Directly funds platform development"].map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-[#147A8A] shrink-0" />
                                        <span className="font-sans text-sm text-[#10201B]">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <button 
                            onClick={handleUpgrade}
                            disabled={loading || success}
                            className="w-full h-12 bg-[#147A8A] text-white font-sans font-medium rounded-full hover:bg-[#147A8A]/90 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : success ? "Verified!" : "Purchase Verification"}
                        </button>
                    </div>
                </div>
            </FadeIn>
        </div>
    );
}
