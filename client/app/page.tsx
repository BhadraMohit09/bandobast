"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { getAreas } from "@/features/areas/api";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

import { FadeIn } from "@/components/ui/fade-in";
import { TouchEffect } from "@/components/ui/touch-effect";

export default function Home() {
  const [areasCount, setAreasCount] = useState<number | null>(null);
  const [typedText, setTypedText] = useState("");
  const fullText = "bandobast | Civic Intelligence";

  useEffect(() => {
    getAreas().then(res => setAreasCount(res.totalCount)).catch(() => setAreasCount(0));
    
    let i = 0;
    const timer = setInterval(() => {
      if (i <= fullText.length) {
        setTypedText(fullText.slice(0, i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 60);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Editorial Hero */}
      <section className="px-6 md:px-12 pt-16 md:pt-28 pb-12 max-w-[1280px] w-full mx-auto overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-8 flex flex-col items-start">
            <FadeIn direction="up" delay={0.1}>
              <span className="font-mono text-xs uppercase tracking-widest text-[#7A817D] mb-6 flex items-center h-[16px]">
                {typedText}
                <span className="animate-pulse ml-[2px] w-[5px] h-[14px] bg-[#7A817D] inline-block"></span>
              </span>
            </FadeIn>
            <FadeIn direction="up" delay={0.2}>
              <h1 className="text-[3rem] md:text-[5rem] lg:text-[5.5rem] leading-[1.05] font-serif font-medium text-[#10201B] mb-8 max-w-4xl tracking-tight">
                Know what&apos;s happening<br />in your area.
              </h1>
            </FadeIn>
            <FadeIn direction="up" delay={0.3}>
              <p className="text-lg md:text-xl text-[#5E6B68] font-sans font-light leading-relaxed max-w-xl mb-12">
                Community-powered reporting for local infrastructure, food safety, and medical concerns across India.
              </p>
            </FadeIn>
            <FadeIn direction="up" delay={0.4} className="w-full sm:w-auto">
              <div className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto">
                <TouchEffect className="w-full sm:w-auto">
                  <Link 
                    href="/report" 
                    className={cn(
                      buttonVariants({ variant: "default", size: "lg" }),
                      "w-full sm:w-auto rounded-full bg-[#10201B] hover:bg-[#10201B]/90 text-white font-medium h-12 px-8 transition-transform"
                    )}
                  >
                    Report an issue
                  </Link>
                </TouchEffect>
                <TouchEffect className="w-full sm:w-auto">
                  <Link 
                    href="/areas" 
                    className="w-full sm:w-auto flex items-center justify-center font-sans font-medium text-[#10201B] hover:text-[#10201B] transition-colors group"
                  >
                    Browse areas
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </TouchEffect>
              </div>
            </FadeIn>
          </div>
          
          <div className="lg:col-span-4 w-full h-full min-h-[300px] border border-[#D8D8D1] bg-white/40 p-8 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-8">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B34435] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#B34435]"></span>
              </span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#B34435]">Live Network</span>
            </div>
            
            <div className="space-y-6">
              {/* Abstract editorial graphic representation */}
              <div className="h-px w-full bg-[#D8D8D1] relative">
                <div className="absolute top-1/2 left-[20%] -translate-y-1/2 w-2 h-2 rounded-full bg-[#B7791F]"></div>
                <div className="absolute top-1/2 left-[60%] -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#D8D8D1]"></div>
                <div className="absolute top-1/2 left-[85%] -translate-y-1/2 w-2 h-2 rounded-full bg-[#147A8A]"></div>
              </div>
              <div className="h-px w-[80%] bg-[#D8D8D1] relative">
                <div className="absolute top-1/2 left-[40%] -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#D8D8D1]"></div>
              </div>
              <div className="h-px w-[90%] bg-[#D8D8D1] relative">
                <div className="absolute top-1/2 left-[30%] -translate-y-1/2 w-2 h-2 rounded-full bg-[#B7791F]"></div>
                <div className="absolute top-1/2 left-[75%] -translate-y-1/2 w-2 h-2 rounded-full bg-[#B7791F]"></div>
              </div>
            </div>

            <div className="mt-12 font-mono text-[10px] uppercase tracking-widest text-[#7A817D]">
              Fig 1. Real-time community disruption signals
            </div>
          </div>
        </div>
      </section>

      {/* Information Strip */}
      <div className="border-y border-[#D8D8D1] bg-white">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-4 flex flex-wrap gap-x-12 gap-y-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#7A817D]">Areas Tracked</span>
            <span className="font-serif text-lg font-medium text-[#10201B]">{areasCount !== null ? areasCount : '—'}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#7A817D]">Last Update</span>
            <span className="font-serif text-lg font-medium text-[#10201B]">Live</span>
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <section className="px-6 md:px-12 py-24 max-w-[1280px] w-full mx-auto">
        <FadeIn direction="up">
          <h2 className="font-mono text-xs uppercase tracking-widest text-[#10201B] mb-12 border-b border-[#D8D8D1] pb-4">
            How bandobast Works
          </h2>
        </FadeIn>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 lg:gap-16">
          <FadeIn direction="up" delay={0.1} className="flex flex-col border-t-2 border-[#10201B] pt-6">
            <span className="font-serif text-5xl text-[#10201B] mb-6">01</span>
            <h3 className="font-mono text-sm uppercase tracking-widest text-[#10201B] mb-4">Report</h3>
            <p className="font-sans text-[#5E6B68] leading-relaxed">
              Citizens report civic issues, unsafe products, and infrastructure disruptions instantly, establishing a decentralized network of real-time ground truth.
            </p>
          </FadeIn>
          
          <FadeIn direction="up" delay={0.2} className="flex flex-col border-t border-[#D8D8D1] md:border-t-2 md:border-[#10201B] pt-6">
            <span className="font-serif text-5xl text-[#10201B] mb-6">02</span>
            <h3 className="font-mono text-sm uppercase tracking-widest text-[#10201B] mb-4">Aggregate</h3>
            <p className="font-sans text-[#5E6B68] leading-relaxed">
              bandobast organizes incoming reports by category and location, turning isolated incidents into clear community signals and actionable data.
            </p>
          </FadeIn>
          
          <FadeIn direction="up" delay={0.3} className="flex flex-col border-t border-[#D8D8D1] md:border-t-2 md:border-[#10201B] pt-6">
            <span className="font-serif text-5xl text-[#10201B] mb-6">03</span>
            <h3 className="font-mono text-sm uppercase tracking-widest text-[#10201B] mb-4">Analyze</h3>
            <p className="font-sans text-[#5E6B68] leading-relaxed">
              Historical report aggregations reveal recurring patterns, allowing communities and authorities to address systematic issues and track resolutions.
            </p>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
