import { FadeIn } from "@/components/ui/fade-in";
import { CheckCircle2, XCircle, Camera, FileText, MapPin } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function GuidelinesPage() {
    return (
        <div className="min-h-screen bg-[#F5F4EF] p-6 md:p-12 pt-24 max-w-[1280px] mx-auto w-full">
            <FadeIn direction="up">
                <div className="max-w-3xl mx-auto">
                    <h1 className="font-serif text-4xl md:text-5xl font-medium tracking-tight text-[#10201B] mb-6">
                        Reporting Guidelines
                    </h1>
                    <p className="font-sans text-[#5E6B68] text-lg leading-relaxed mb-16">
                        Bandobast relies on high-quality, verified data from citizens to make real-world impact. Follow these guidelines to ensure your reports are useful to the community and authorities.
                    </p>

                    <section className="mb-16">
                        <h2 className="font-serif text-2xl text-[#10201B] mb-6 border-b border-[#D8D8D1] pb-2">
                            General Best Practices
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white p-6 border border-[#D8D8D1] rounded-[10px]">
                                <h3 className="font-mono text-sm text-[#147A8A] flex items-center gap-2 mb-4">
                                    <CheckCircle2 className="w-4 h-4" /> DO
                                </h3>
                                <ul className="space-y-4 font-sans text-sm text-[#10201B]">
                                    <li className="flex items-start gap-2">
                                        <Camera className="w-4 h-4 shrink-0 mt-0.5 text-[#5E6B68]" />
                                        <span>Take clear, well-lit photos of the issue.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-[#5E6B68]" />
                                        <span>Provide exact street names or landmarks.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <FileText className="w-4 h-4 shrink-0 mt-0.5 text-[#5E6B68]" />
                                        <span>Include receipts or bills for product issues.</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="bg-white p-6 border border-[#D8D8D1] rounded-[10px]">
                                <h3 className="font-mono text-sm text-[#B34435] flex items-center gap-2 mb-4">
                                    <XCircle className="w-4 h-4" /> DON&apos;T
                                </h3>
                                <ul className="space-y-4 font-sans text-sm text-[#10201B]">
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#5E6B68]">•</span>
                                        <span>Submit duplicate reports for the same issue. Check the feed first.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#5E6B68]">•</span>
                                        <span>Upload blurry or heavily edited photos.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#5E6B68]">•</span>
                                        <span>Include personal information or faces of individuals without consent.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section className="mb-16">
                        <h2 className="font-serif text-2xl text-[#10201B] mb-6 border-b border-[#D8D8D1] pb-2">
                            Category Specific Advice
                        </h2>
                        <div className="space-y-8">
                            <div>
                                <h3 className="font-serif text-xl text-[#10201B] mb-2">Medicine & Drug Safety</h3>
                                <p className="font-sans text-[#5E6B68] text-sm mb-4">When reporting expired or suspected fake medication, authorities need specific details to act.</p>
                                <div className="bg-[#EBEBE3] p-4 rounded-lg font-mono text-xs text-[#10201B] leading-relaxed">
                                    Required in photo: Batch Number, Manufacturing Date, Expiry Date.<br/>
                                    Required in description: Name of pharmacy, exact address.
                                </div>
                            </div>
                            <div>
                                <h3 className="font-serif text-xl text-[#10201B] mb-2">Food Safety</h3>
                                <p className="font-sans text-[#5E6B68] text-sm mb-4">For adulterated food or unhygienic restaurant conditions.</p>
                                <div className="bg-[#EBEBE3] p-4 rounded-lg font-mono text-xs text-[#10201B] leading-relaxed">
                                    Required: Clear photos of the unhygienic condition or adulterated item.<br/>
                                    Helpful: Receipt showing date and time of purchase.
                                </div>
                            </div>
                            <div>
                                <h3 className="font-serif text-xl text-[#10201B] mb-2">Infrastructure & Outages</h3>
                                <p className="font-sans text-[#5E6B68] text-sm mb-4">For potholes, broken streetlights, or water leaks.</p>
                                <div className="bg-[#EBEBE3] p-4 rounded-lg font-mono text-xs text-[#10201B] leading-relaxed">
                                    Required: Exact street landmark.<br/>
                                    Helpful: Wide-angle photo showing the hazard in context of the street.
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="flex justify-center mt-20">
                        <Link 
                            href="/report" 
                            className={cn(
                                buttonVariants({ variant: "default", size: "lg" }),
                                "rounded-full bg-[#10201B] hover:bg-[#10201B]/90 text-white font-medium h-12 px-12 transition-transform hover:scale-[1.02]"
                            )}
                        >
                            I&apos;m ready to report
                        </Link>
                    </div>

                </div>
            </FadeIn>
        </div>
    );
}
