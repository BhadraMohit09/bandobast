"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { register } from "../api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";

export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login: setAuth } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await register({ email, displayName, password });
      setAuth(data);
      router.push("/verify-email");
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred during registration.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white border border-[#D8D8D1] p-8 mt-12">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-[#10201B] mb-2">Sign Up</h1>
        <p className="font-sans text-sm text-[#5E6B68]">Join the intelligence network.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-[#B34435]/10 border border-[#B34435]/20 flex items-start gap-3 text-[#B34435]">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="displayName" className="font-mono text-[10px] uppercase tracking-widest text-[#7A817D]">Display Name</Label>
          <Input 
            id="displayName" 
            type="text" 
            required 
            maxLength={100}
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            className="bg-white border-[#D8D8D1] focus-visible:ring-[#10201B] rounded-none h-10 font-sans"
          />
        </div>
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
          <Label htmlFor="password" className="font-mono text-[10px] uppercase tracking-widest text-[#7A817D]">Password (Min 8 chars)</Label>
          <Input 
            id="password" 
            type="password" 
            required
            minLength={8}
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
          {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create Account"}
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-[#D8D8D1] text-center">
        <p className="text-sm text-[#5E6B68]">
          Already have an account?{' '}
          <Link href={`/signin?redirect=${encodeURIComponent(redirect)}`} className="text-[#10201B] font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
