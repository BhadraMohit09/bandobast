import SignUpForm from "@/features/auth/components/SignUpForm";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Sign Up - bandobast",
  description: "Join bandobast to report outages.",
};

export default function SignUpPage() {
  return (
    <div className="min-h-[calc(100vh-160px)] px-6 md:px-12 py-12 bg-[#F5F4EF] flex items-center justify-center">
      <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
        <SignUpForm />
      </Suspense>
    </div>
  );
}
