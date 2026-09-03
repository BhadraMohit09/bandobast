"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { resetPassword } from "@/features/auth/api";

import { Suspense } from "react";

function ResetPasswordContent() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  // Basic validation rules
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const isValid = hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial;
  const passwordsMatch = password === confirmPassword;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) {
      setStatus("error");
      setMessage("Password does not meet the requirements.");
      return;
    }
    if (!passwordsMatch) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }
    if (!token || !email) {
      setStatus("error");
      setMessage("Missing or invalid reset token.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await resetPassword({ token, email, newPassword: password });
      setStatus("success");
      setMessage(res.message || "Password successfully reset. You can now sign in.");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.response?.data?.message || "An error occurred while resetting the password.");
    }
  }

  if (!token || !email) {
    return (
      <div className="w-full max-w-md mx-auto bg-white border border-[#D8D8D1] p-8 text-center">
        <AlertCircle className="h-12 w-12 text-[#B34435] mx-auto mb-4" />
        <h1 className="font-serif text-2xl text-[#10201B] mb-2">Invalid Link</h1>
        <p className="font-sans text-sm text-[#5E6B68] mb-6">The password reset link is invalid or missing required parameters.</p>
        <Link href="/forgot-password" className="text-[#147A8A] font-medium hover:underline">
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white border border-[#D8D8D1] p-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-[#10201B] mb-2">Reset Password</h1>
        <p className="font-sans text-sm text-[#5E6B68]">Enter your new password below.</p>
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
            Go to Sign In
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="password" className="font-mono text-[10px] uppercase tracking-widest text-[#7A817D]">New Password</Label>
            <Input 
              id="password" 
              type="password" 
              required 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="bg-white border-[#D8D8D1] focus-visible:ring-[#10201B] rounded-none h-10 font-sans"
            />
            <div className="mt-2 text-xs space-y-1">
              <p className={`${hasMinLength ? 'text-[#147A8A]' : 'text-[#7A817D]'}`}>• At least 8 characters</p>
              <p className={`${hasUpper && hasLower ? 'text-[#147A8A]' : 'text-[#7A817D]'}`}>• Uppercase and lowercase letters</p>
              <p className={`${hasNumber ? 'text-[#147A8A]' : 'text-[#7A817D]'}`}>• At least one number</p>
              <p className={`${hasSpecial ? 'text-[#147A8A]' : 'text-[#7A817D]'}`}>• At least one special character</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="font-mono text-[10px] uppercase tracking-widest text-[#7A817D]">Confirm Password</Label>
            <Input 
              id="confirmPassword" 
              type="password" 
              required 
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className={`bg-white border-[#D8D8D1] focus-visible:ring-[#10201B] rounded-none h-10 font-sans ${confirmPassword && !passwordsMatch ? 'border-[#B34435]' : ''}`}
            />
            {confirmPassword && !passwordsMatch && (
              <p className="text-xs text-[#B34435]">Passwords do not match.</p>
            )}
          </div>
          
          <Button 
            type="submit" 
            disabled={status === "loading" || !isValid || !passwordsMatch}
            className="w-full rounded-none bg-[#10201B] hover:bg-[#10201B]/90 text-[#F5F4EF] font-sans font-medium h-12"
          >
            {status === "loading" ? <Loader2 className="h-5 w-5 animate-spin" /> : "Reset Password"}
          </Button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F4EF] p-4">
      <Suspense fallback={<div className="flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#10201B]" /></div>}>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}
