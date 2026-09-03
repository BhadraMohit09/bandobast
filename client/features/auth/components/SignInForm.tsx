"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { login } from "../api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login: setAuth } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/report";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const data = await login({ email, password });
      setAuth(data);
      if (!data.isEmailVerified) {
        router.push("/verify-email");
      } else {
        router.push(redirect);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred during sign in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white border border-[#D8D8D1] p-8 mt-12">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-[#10201B] mb-2">Sign In</h1>
        <p className="font-sans text-sm text-[#5E6B68]">Welcome back. Enter your credentials to continue.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-[#B34435]/10 border border-[#B34435]/20 flex items-start gap-3 text-[#B34435]">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

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
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="font-mono text-[10px] uppercase tracking-widest text-[#7A817D]">Password</Label>
            <Link href={`/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ""}`} className="font-mono text-[10px] uppercase tracking-widest text-[#147A8A] hover:underline">
              Forgot Password?
            </Link>
          </div>
          <Input 
            id="password" 
            type="password" 
            required 
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="bg-white border-[#D8D8D1] focus-visible:ring-[#10201B] rounded-none h-10 font-sans"
          />
        </div>
        
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full rounded-none bg-[#10201B] hover:bg-[#10201B]/90 text-[#F5F4EF] font-sans font-medium h-12"
        >
          {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign In"}
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-[#D8D8D1] text-center">
        <p className="text-sm text-[#5E6B68]">
          Don't have an account?{' '}
          <Link href={`/signup?redirect=${encodeURIComponent(redirect)}`} className="text-[#10201B] font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
