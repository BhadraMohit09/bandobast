"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/context/AuthContext";
import apiClient from "@/lib/apiClient";
import { Mail, ArrowRight, ShieldCheck, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function VerifyEmailPage() {
    const { user, updateUser, logout, isLoading } = useAuth();
    const router = useRouter();
    
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [resendMessage, setResendMessage] = useState("");
    const [countdown, setCountdown] = useState(0);

    // Protection logic
    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push("/signin?redirect=/verify-email");
            } else if (user.isEmailVerified) {
                router.push("/profile"); // Already verified
            }
        }
    }, [user, isLoading, router]);

    // Resend countdown
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            const res = await apiClient.post("/auth/verify-email", {
                email: user?.email,
                otp: otp.trim()
            });
            setSuccess(true);
            updateUser({ isEmailVerified: true });
            setTimeout(() => {
                router.push("/profile");
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || "Invalid verification code.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResend = async () => {
        if (countdown > 0 || isResending) return;
        
        setError("");
        setResendMessage("");
        setIsResending(true);

        try {
            await apiClient.post("/auth/resend-otp", {
                email: user?.email
            });
            setResendMessage("Verification code sent! Check your inbox.");
            setCountdown(60); // 60s cooldown
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to resend code.");
        } finally {
            setIsResending(false);
        }
    };

    if (isLoading || !user || user.isEmailVerified) return null;

    return (
        <main className="min-h-screen bg-[#F5F4EF] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-6">
                    <ShieldCheck className="w-12 h-12 text-[#10201B]" />
                </div>
                <h2 className="text-center text-3xl font-bold text-[#10201B] tracking-tight">
                    Verify your email
                </h2>
                <p className="mt-2 text-center text-sm text-[#5E6B68]">
                    We sent a 6-character code to <br />
                    <span className="font-semibold text-[#10201B]">{user.email}</span>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-sm border border-[#D8D8D1] sm:rounded-2xl sm:px-10">
                    
                    {success ? (
                        <div className="text-center py-6">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                                <ShieldCheck className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">Email Verified!</h3>
                            <p className="text-sm text-gray-500 mt-2">Redirecting you to your profile...</p>
                        </div>
                    ) : (
                        <form className="space-y-6" onSubmit={handleVerify}>
                            <div>
                                <label htmlFor="otp" className="block text-sm font-medium text-[#10201B]">
                                    Verification Code
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="otp"
                                        name="otp"
                                        type="text"
                                        required
                                        placeholder="e.g. AA1234"
                                        className="appearance-none block w-full px-3 py-3 border border-[#D8D8D1] rounded-lg shadow-sm placeholder-[#949F9C] focus:outline-none focus:ring-2 focus:ring-[#10201B] focus:border-[#10201B] sm:text-lg tracking-widest text-center uppercase"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.toUpperCase())}
                                        maxLength={6}
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                                    {error}
                                </div>
                            )}

                            {resendMessage && (
                                <div className="text-sm text-green-700 bg-green-50 p-3 rounded-lg border border-green-100">
                                    {resendMessage}
                                </div>
                            )}

                            <div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || otp.length < 6}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-[#10201B] hover:bg-[#1A332B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#10201B] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isSubmitting ? "Verifying..." : "Verify Email"}
                                    {!isSubmitting && <ArrowRight className="ml-2 w-4 h-4" />}
                                </button>
                            </div>
                        </form>
                    )}

                    {!success && (
                        <div className="mt-6 text-center">
                            <button
                                onClick={handleResend}
                                disabled={countdown > 0 || isResending}
                                className="inline-flex items-center text-sm font-medium text-[#5E6B68] hover:text-[#10201B] disabled:opacity-50"
                            >
                                <RefreshCw className={`w-4 h-4 mr-2 ${isResending ? 'animate-spin' : ''}`} />
                                {countdown > 0 ? `Resend code in ${countdown}s` : "Resend code"}
                            </button>
                        </div>
                    )}
                </div>
                
                <div className="mt-8 flex justify-center space-x-6 text-sm">
                    <button 
                        onClick={() => {
                            logout();
                            router.push("/");
                        }}
                        className="text-[#5E6B68] hover:text-[#10201B]"
                    >
                        Sign out
                    </button>
                </div>
            </div>
        </main>
    );
}
