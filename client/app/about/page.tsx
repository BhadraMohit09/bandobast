import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | bandobast",
  description: "Learn about our mission to bring civic intelligence and transparency to local power and water infrastructure.",
};

export default function AboutPage() {
    return (
        <div className="min-h-screen p-6 md:p-12 max-w-[1280px] mx-auto w-full">
            <div className="mb-16 md:mb-24 max-w-3xl">
                <span className="font-mono text-xs uppercase tracking-widest text-[#10201B] block mb-6">
                    About bandobast
                </span>
                <h1 className="font-serif text-[2.5rem] md:text-[4rem] leading-[1.1] font-medium tracking-tight text-[#10201B] mb-8">
                    Civic intelligence, powered by the community.
                </h1>
                <p className="text-[#5E6B68] font-sans text-xl md:text-2xl leading-relaxed">
                    bandobast is an independent platform dedicated to bringing transparency to local infrastructure and public safety. We turn isolated incidents into a clear, shared picture of what's happening on the ground.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start">
                {/* Main Content */}
                <div className="lg:col-span-8 flex flex-col gap-12 md:gap-16">
                    <section className="border-t border-[#D8D8D1] pt-8">
                        <h2 className="font-serif text-2xl md:text-3xl font-medium text-[#10201B] mb-6">The Problem</h2>
                        <div className="prose prose-lg text-[#10201B] font-sans leading-relaxed space-y-6">
                            <p>
                                In many neighborhoods, power outages, water shortages, and public safety concerns like adulterated food or counterfeit medicines are a recurring reality. Yet, the data surrounding these events is often fragmented, hidden behind corporate or government call centers, or scattered across disjointed social media complaints.
                            </p>
                            <p>
                                When the lights go out or a safety issue arises, residents are left in the dark—wondering if it's just their street or a broader systemic failure. Without centralized historical data, it's impossible to prove that a community is experiencing systemic neglect rather than isolated accidents.
                            </p>
                        </div>
                    </section>

                    <section className="border-t border-[#D8D8D1] pt-8">
                        <h2 className="font-serif text-2xl md:text-3xl font-medium text-[#10201B] mb-6">Our Approach</h2>
                        <div className="prose prose-lg text-[#10201B] font-sans leading-relaxed space-y-6">
                            <p>
                                bandobast bridges this gap by relying on the most accurate source of truth available: <strong>the people living there</strong>. By aggregating crowdsourced reports of infrastructure disruptions and public safety hazards (such as unsafe food, medicines, and drugs), we build an independent, real-time map of civic health.
                            </p>
                            <p>
                                Beyond just showing what's happening right now, our system analyzes historical reports to identify <strong>recurring patterns</strong>. This enables communities to anticipate disruptions, demand accountability, and maintain a verifiable public record.
                            </p>
                        </div>
                    </section>

                    <section className="border-t border-[#D8D8D1] pt-8">
                        <h2 className="font-serif text-2xl md:text-3xl font-medium text-[#10201B] mb-6">Privacy by Design</h2>
                        <div className="prose prose-lg text-[#10201B] font-sans leading-relaxed space-y-6">
                            <p>
                                Civic technology should not compromise personal privacy. While basic accounts help you track your own reports, we ensure your identity remains entirely untracked in the public domain. Our focus is strictly on the data that matters: the locality, the issue category, and the timestamp.
                            </p>
                        </div>
                    </section>
                </div>

                {/* Sidebar */}
                <aside className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-[#D8D8D1] pt-12 lg:pt-0 lg:pl-12 space-y-12">
                    <div>
                        <h3 className="font-mono text-xs uppercase tracking-widest text-[#7A817D] mb-4">
                            Core Pillars
                        </h3>
                        <ul className="space-y-6">
                            <li>
                                <h4 className="font-serif text-lg text-[#10201B] mb-1">Decentralized</h4>
                                <p className="font-sans text-sm text-[#5E6B68]">No reliance on official utility data feeds. Built entirely on ground-truth reports.</p>
                            </li>
                            <li>
                                <h4 className="font-serif text-lg text-[#10201B] mb-1">Analytical</h4>
                                <p className="font-sans text-sm text-[#5E6B68]">Detection of structural patterns across different localities and safety categories.</p>
                            </li>
                            <li>
                                <h4 className="font-serif text-lg text-[#10201B] mb-1">Accessible</h4>
                                <p className="font-sans text-sm text-[#5E6B68]">Clean, readable interfaces designed for immediate understanding during an active crisis.</p>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-[#EBEBE3] p-6 border border-[#D8D8D1]">
                        <h3 className="font-serif text-xl text-[#10201B] mb-2">
                            Contribute Data
                        </h3>
                        <p className="font-sans text-sm text-[#5E6B68] mb-6">
                            The platform's accuracy relies on consistent community reporting. Next time your area experiences an issue, log it here.
                        </p>
                        <a 
                            href="/report"
                            className="inline-flex items-center justify-center w-full rounded-full bg-[#10201B] hover:bg-[#10201B]/90 text-white font-sans font-medium px-6 h-10 transition-transform hover:scale-[1.02]"
                        >
                            Report an Issue
                        </a>
                    </div>
                </aside>
            </div>
        </div>
    );
}
