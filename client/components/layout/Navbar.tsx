"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Menu, X, User } from "lucide-react";

export function Navbar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Close mobile menu when pathname changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    return (
        <>
        <header className="sticky top-0 z-50 w-full border-b border-[#D8D8D1] bg-[#F5F4EF]/90 backdrop-blur-sm">
            <div className="flex h-[72px] md:h-[82px] max-w-[1280px] mx-auto items-center justify-between px-6 md:px-12">
                <Link href="/" className="flex items-center gap-2">
                    <span className="font-serif font-medium tracking-tight text-xl text-[#10201B]">bandobast</span>
                </Link>
                
                <nav className="flex items-center gap-4 md:gap-8">
                    <Link 
                        href="/feed"
                        className={cn(
                            "font-mono text-[11px] uppercase tracking-widest transition-colors hidden md:block",
                            pathname?.startsWith("/feed") 
                                ? "text-[#10201B] font-medium" 
                                : "text-[#7A817D] hover:text-[#10201B]"
                        )}
                    >
                        Live Feed
                    </Link>
                    <Link 
                        href="/areas"
                        className={cn(
                            "font-mono text-[11px] uppercase tracking-widest transition-colors hidden md:block",
                            pathname?.startsWith("/areas") 
                                ? "text-[#10201B] font-medium" 
                                : "text-[#7A817D] hover:text-[#10201B]"
                        )}
                    >
                        Browse Areas
                    </Link>
                    <Link 
                        href="/about"
                        className={cn(
                            "font-mono text-[11px] uppercase tracking-widest transition-colors hidden md:block",
                            pathname?.startsWith("/about") 
                                ? "text-[#10201B] font-medium" 
                                : "text-[#7A817D] hover:text-[#10201B]"
                        )}
                    >
                        About
                    </Link>
                    <Link 
                        href="/contribute"
                        className={cn(
                            "font-mono text-[11px] uppercase tracking-widest transition-colors hidden md:block",
                            pathname?.startsWith("/contribute") 
                                ? "text-[#10201B] font-medium" 
                                : "text-[#7A817D] hover:text-[#10201B]"
                        )}
                    >
                        Contribute
                    </Link>
                    
                    {user ? (
                        <div className="relative hidden md:block" ref={dropdownRef}>
                            <button
                                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                aria-label="Open account menu"
                                aria-expanded={isProfileDropdownOpen}
                                className={cn(
                                    "flex items-center justify-center w-10 h-10 rounded-full bg-[#E5E4DF] text-[#10201B] overflow-hidden border border-[#D8D8D1] transition-all focus:outline-none focus:ring-2 focus:ring-[#10201B] focus:ring-offset-2 focus:ring-offset-[#F5F4EF]",
                                    isProfileDropdownOpen ? "ring-2 ring-[#10201B] ring-offset-2 ring-offset-[#F5F4EF]" : "hover:border-[#10201B]/30 hover:shadow-sm"
                                )}
                            >
                                {user.profilePhotoUrl ? (
                                    <img src={user.profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-4 h-4" />
                                )}
                            </button>

                            {isProfileDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-[220px] bg-white rounded-[10px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-[#D8D8D1] py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                                    <div className="px-4 py-2.5">
                                        <p className="font-serif font-medium text-lg text-[#10201B] truncate leading-tight mb-0.5">{user.displayName}</p>
                                        <p className="font-sans text-[12px] text-[#7A817D] truncate">{user.email}</p>
                                    </div>
                                    <div className="h-px bg-[#D8D8D1]/50 w-full my-1"></div>
                                    <Link 
                                        href="/profile" 
                                        onClick={() => setIsProfileDropdownOpen(false)}
                                        className="block px-4 py-2.5 font-sans text-[14px] text-[#10201B] hover:bg-[#F5F4EF] transition-colors focus:outline-none focus:bg-[#F5F4EF]"
                                    >
                                        Profile
                                    </Link>
                                    <button 
                                        onClick={() => {
                                            setIsProfileDropdownOpen(false);
                                            setShowLogoutModal(true);
                                        }}
                                        className="block w-full text-left px-4 py-2.5 font-sans text-[14px] text-[#B34435] hover:bg-red-50 transition-colors focus:outline-none focus:bg-red-50"
                                    >
                                        Log out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link 
                            href="/signin"
                            className="font-mono text-xs uppercase tracking-widest text-[#5E6B68] hover:text-[#10201B] transition-colors hidden md:block"
                        >
                            Sign In
                        </Link>
                    )}

                    <Link 
                        href="/report" 
                        className={cn(
                            buttonVariants({ variant: "default" }),
                            "rounded-full bg-[#10201B] hover:bg-[#10201B]/90 text-white font-sans font-medium px-4 md:px-6 h-9 md:h-10 transition-transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#10201B] focus:ring-offset-2 focus:ring-offset-[#F5F4EF]"
                        )}
                    >
                        <span className="sm:hidden">Report issue</span>
                        <span className="hidden sm:inline">Report an issue</span>
                    </Link>

                    {/* Mobile Menu Toggle */}
                    <button 
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                        aria-expanded={isMobileMenuOpen}
                        className="md:hidden relative flex items-center justify-center w-11 h-11 text-[#10201B] hover:opacity-70 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10201B] rounded-sm"
                    >
                        <Menu 
                            className={cn(
                                "absolute w-6 h-6 transition-all duration-200 ease-out",
                                isMobileMenuOpen ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"
                            )} 
                        />
                        <X 
                            className={cn(
                                "absolute w-6 h-6 transition-all duration-200 ease-out",
                                isMobileMenuOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"
                            )} 
                        />
                    </button>
                </nav>
            </div>

            {/* Mobile Menu */}
            <div 
                className={cn(
                    "md:hidden absolute top-[72px] left-0 w-full bg-[#F5F4EF] border-b border-[#D8D8D1] shadow-lg transition-all duration-200 ease-out origin-top",
                    isMobileMenuOpen ? "opacity-100 translate-y-0 visible" : "opacity-0 -translate-y-2 invisible"
                )}
            >
                <div className="flex flex-col py-6 px-6">
                    <div className="flex flex-col gap-6">
                        <Link 
                            href="/feed"
                            className={cn(
                                "font-mono text-[11px] uppercase tracking-widest transition-colors hover:text-[#10201B]",
                                pathname === "/feed" ? "text-[#10201B] font-medium" : "text-[#7A817D]"
                            )}
                        >
                            Live Feed
                        </Link>
                        <Link 
                            href="/areas"
                            className={cn(
                                "font-mono text-[11px] uppercase tracking-widest transition-colors hover:text-[#10201B]",
                                pathname?.startsWith("/areas") ? "text-[#10201B] font-medium" : "text-[#7A817D]"
                            )}
                        >
                            Browse Areas
                        </Link>
                        <Link 
                            href="/about"
                            className={cn(
                                "font-mono text-[11px] uppercase tracking-widest transition-colors hover:text-[#10201B]",
                                pathname === "/about" ? "text-[#10201B] font-medium" : "text-[#7A817D]"
                            )}
                        >
                            About
                        </Link>
                        <Link 
                            href="/contribute"
                            className={cn(
                                "font-mono text-[11px] uppercase tracking-widest transition-colors hover:text-[#10201B]",
                                pathname === "/contribute" ? "text-[#10201B] font-medium" : "text-[#7A817D]"
                            )}
                        >
                            Contribute
                        </Link>
                    </div>
                    
                    {user ? (
                        <>
                            <div className="h-px bg-[#D8D8D1] w-full my-6 opacity-70"></div>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#E5E4DF] text-[#10201B] overflow-hidden border border-[#D8D8D1]">
                                        {user.profilePhotoUrl ? (
                                            <img src={user.profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-5 h-5" />
                                        )}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="font-serif font-medium text-lg text-[#10201B] truncate leading-tight">{user.displayName}</p>
                                        <p className="font-sans text-[13px] text-[#5E6B68] truncate mt-0.5">{user.email}</p>
                                    </div>
                                </div>
                                <Link 
                                    href="/profile" 
                                    className="font-sans text-base text-[#10201B] py-2.5 -mx-3 px-3 rounded-xl hover:bg-[#EBEBE3]/60 transition-colors focus:outline-none focus:bg-[#EBEBE3]/60"
                                >
                                    Profile
                                </Link>
                                <button 
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        setShowLogoutModal(true);
                                    }}
                                    className="text-left font-sans text-base text-[#B34435] py-2.5 -mx-3 px-3 rounded-xl hover:bg-red-50/70 transition-colors focus:outline-none focus:bg-red-50/70"
                                >
                                    Log out
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="h-px bg-[#D8D8D1] w-full my-6 opacity-70"></div>
                            <Link 
                                href="/signin"
                                className="font-mono text-[13px] uppercase tracking-widest text-[#10201B] hover:text-[#10201B]/70 py-2 -mx-2 px-2"
                            >
                                Sign In
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>

        {/* Logout Confirmation Modal */}
        {showLogoutModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div 
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
                    onClick={() => setShowLogoutModal(false)}
                ></div>
                
                <div className="bg-[#F5F4EF] rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-xl border border-[#D8D8D1] transform transition-all relative z-10 animate-in zoom-in-95 duration-200">
                    <h3 className="font-serif text-2xl font-medium text-[#10201B] mb-2">Log Out</h3>
                    <p className="font-sans text-[#5E6B68] text-[15px] mb-8 leading-relaxed">
                        Are you sure you want to log out of your account?
                    </p>
                    
                    <div className="flex justify-end gap-3">
                        <button 
                            onClick={() => setShowLogoutModal(false)}
                            className="font-sans font-medium px-5 h-10 rounded-xl border border-[#D8D8D1] text-[#10201B] hover:bg-[#EBEBE3] transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={() => {
                                setShowLogoutModal(false);
                                logout();
                            }}
                            className="font-sans font-medium px-6 h-10 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center justify-center"
                        >
                            Log Out
                        </button>
                    </div>
                </div>
            </div>
        )}
        </>
    );
}
