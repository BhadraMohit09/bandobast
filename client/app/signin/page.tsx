import SignInForm from "@/features/auth/components/SignInForm";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Sign In - bandobast",
  description: "Sign in to report outages and resolve issues.",
};

export default function SignInPage() {
  return (
    <div className="min-h-[calc(100vh-160px)] px-6 md:px-12 py-12 bg-[#F5F4EF] flex items-center justify-center">
      <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
        <SignInForm />
      </Suspense>
    </div>
  );
}
