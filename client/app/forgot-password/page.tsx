"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { forgotPassword } from "@/features/auth/api";

import { Suspense } from "react";

function ForgotPasswordContent() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await forgotPassword(email);
      setStatus("success");
      setMessage(res.message || "A password reset link has been sent to your email.");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.response?.data?.message || "An error occurred while requesting password reset.");
    }
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white border border-[#D8D8D1] p-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-[#10201B] mb-2">Forgot Password</h1>
        <p className="font-sans text-sm text-[#5E6B68]">Enter your email address to receive a password reset link.</p>
      </div>

      {status === "error" && (
        <div className="mb-6 p-4 bg-[#B34435]/10 border border-[#B34435]/20 flex items-start gap-3 text-[#B34435]">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{message}</p>
        </div>
      )}

      {status === "success" ? (
        <div className="space-y-6">
          <div className="p-4 bg-[#147A8A]/10 border border-[#147A8A]/20 flex items-start gap-3 text-[#147A8A]">
            <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{message}</p>
          </div>
          <Link href="/signin" className="block text-center w-full rounded-none bg-[#10201B] hover:bg-[#10201B]/90 text-[#F5F4EF] font-sans font-medium h-12 leading-[48px]">
            Return to Sign In
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-mono text-[10px] uppercase tracking-widest text-[#7A817D]">Email Address</Label>
            <Input 
              id="email" 
              type="email" 
              required 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="bg-white border-[#D8D8D1] focus-visible:ring-[#10201B] rounded-none h-10 font-sans"
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={status === "loading" || !email}
            className="w-full rounded-none bg-[#10201B] hover:bg-[#10201B]/90 text-[#F5F4EF] font-sans font-medium h-12"
          >
            {status === "loading" ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send Reset Link"}
          </Button>
        </form>
      )}

      <div className="mt-8 pt-6 border-t border-[#D8D8D1] text-center">
        <p className="text-sm text-[#5E6B68]">
          Remember your password?{' '}
          <Link href="/signin" className="text-[#10201B] font-medium hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F4EF] p-4">
      <Suspense fallback={<div className="flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#10201B]" /></div>}>
        <ForgotPasswordContent />
      </Suspense>
    </div>
  );
}
