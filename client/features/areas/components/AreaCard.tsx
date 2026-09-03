import Link from "next/link";
import { Area } from "../types";
import { ArrowRight } from "lucide-react";

export function AreaCard({ area }: { area: Area }) {
    return (
        <Link href={`/areas/${area.id}`} className="block group border-t border-[#D8D8D1] transition-colors hover:bg-white/50">
            <div className="py-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex flex-col items-start gap-4">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#7A817D]">
                        Area · ID {area.id}
                    </span>
                    <div>
                        <h3 className="font-serif text-2xl md:text-3xl text-[#10201B] font-medium leading-none mb-3">
                            {area.name}
                        </h3>
                        <span className="font-mono text-xs text-[#5E6B68] uppercase tracking-widest">
                            PIN {area.pinCode}
                        </span>
                    </div>
                </div>

                <div className="flex items-center text-sm font-sans font-medium text-[#10201B] mt-4 md:mt-0">
                    <span className="group-hover:text-[#10201B] transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-[#10201B] group-hover:after:w-full after:transition-all">
                        View area
                    </span>
                    <ArrowRight className="ml-2 h-4 w-4 text-[#10201B] group-hover:text-[#10201B] transition-all group-hover:translate-x-1" />
                </div>
            </div>
        </Link>
    );
}
