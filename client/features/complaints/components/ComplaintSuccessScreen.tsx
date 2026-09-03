"use client";

import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface ComplaintSuccessScreenProps {
    referenceId: string;
    userEmail?: string;
    hasPhone?: boolean;
}

export default function ComplaintSuccessScreen({
    referenceId,
    userEmail,
    hasPhone,
}: ComplaintSuccessScreenProps) {
    const showNotifHint = userEmail || hasPhone;

    return (
        <div className="min-h-[calc(100vh-82px)] flex flex-col p-6 md:p-12 max-w-[1280px] mx-auto w-full justify-center items-center">
            <div className="flex flex-col items-center text-center max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Icon */}
                <div className="w-16 h-16 rounded-full bg-[#10201B]/8 flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-9 h-9 text-[#10201B]" strokeWidth={1.5} />
                </div>

                {/* Heading */}
                <h1 className="font-serif text-[32px] leading-tight text-[#10201B] mb-2">
                    Report Submitted Successfully
                </h1>
                <p className="font-sans text-[15px] text-[#5E6B68] mb-8">
                    Your report has been received and is now under review.
                </p>

                {/* Reference ID card */}
                <div className="bg-white border border-[#D8D8D1] rounded-[10px] p-6 w-full mb-6">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-[#7A817D] mb-2">
                        Report ID
                    </p>
                    <p className="font-mono text-xl font-semibold text-[#10201B] tracking-wider break-all">
                        {referenceId}
                    </p>
                </div>

                {/* Notification hint */}
                {showNotifHint && (
                    <div className="w-full mb-8 px-4 py-3 bg-[#F5F4EF] border border-[#D8D8D1] rounded-[8px]">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-[#7A817D] mb-2">
                            Confirmation sent to
                        </p>
                        <div className="flex flex-col gap-1">
                            {userEmail && (
                                <p className="font-sans text-[13px] text-[#10201B]">
                                    {userEmail}
                                </p>
                            )}
                            {hasPhone && (
                                <p className="font-sans text-[13px] text-[#10201B]">
                                    Registered mobile number
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <Link
                        href="/profile"
                        className="flex-1 flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-[#10201B] hover:bg-[#10201B]/90 text-white font-sans font-medium text-[14px] transition-colors"
                    >
                        View in Profile
                    </Link>
                    <Link
                        href="/report"
                        className="flex-1 flex items-center justify-center gap-2 h-12 px-6 rounded-full border border-[#D8D8D1] bg-white hover:bg-[#F5F4EF] text-[#10201B] font-sans font-medium text-[14px] transition-colors"
                    >
                        File Another Report
                    </Link>
                </div>

                {/* Keep ID note */}
                <p className="font-mono text-[10px] text-[#7A817D] mt-6 uppercase tracking-widest">
                    Keep your Report ID for tracking purposes
                </p>
            </div>
        </div>
    );
}
