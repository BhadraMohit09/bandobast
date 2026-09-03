"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useRouter } from "next/navigation";
import { getUserProfile, uploadProfilePhoto, updateUserProfile, UserProfile, getUserOutages, OutageDto } from "@/features/users/api";
import { Camera, Zap, Droplets, ArrowLeft, CheckCircle2, Lock, Save, X, Info, AlertTriangle, Edit2 } from "lucide-react";
import { FadeIn } from "@/components/ui/fade-in";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { BadgeDisplay } from "@/features/gamification/components/BadgeDisplay";
import { TrendingUp } from "lucide-react";

export default function ProfilePage() {
    const { token, user, logout, updateUser, isLoading } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    
    // Outages Pagination State
    const [outages, setOutages] = useState<OutageDto[]>([]);
    const [outagesLoading, setOutagesLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Custom Modal State
    const [alertModal, setAlertModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: "success" | "error" | "info";
    }>({ isOpen: false, title: "", message: "", type: "info" });

    const showAlert = (title: string, message: string, type: "success" | "error" | "info") => {
        setAlertModal({ isOpen: true, title, message, type });
    };

    const closeAlert = () => {
        setAlertModal(prev => ({ ...prev, isOpen: false }));
    };
    
    // Form state
    const [formData, setFormData] = useState({
        displayName: "",
        phoneNumber: "",
        bio: ""
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        if (!isLoading) {
            if (!token || !user) {
                router.push("/signin");
            } else if (!user.isEmailVerified) {
                router.push("/verify-email");
            } else {
                fetchProfile();
            }
        }
    }, [token, user, isLoading, router]);

    const fetchProfile = useCallback(() => {
        if (!token) return;
        getUserProfile(token)
            .then((data) => {
                setProfile(data);
                setFormData({
                    displayName: data.displayName || "",
                    phoneNumber: data.phoneNumber || "",
                    bio: data.bio || ""
                });
                if (data.profilePhotoUrl && user?.profilePhotoUrl !== data.profilePhotoUrl) {
                    updateUser({ profilePhotoUrl: data.profilePhotoUrl });
                }
            })
            .catch((err) => {
                console.error("Failed to load profile", err);
                if (err.response?.status === 401) {
                    logout();
                    router.push("/signin");
                }
            })
            .finally(() => setLoading(false));
    }, [token, router, logout, updateUser, user?.profilePhotoUrl]);

    // Complaints State
    const [complaints, setComplaints] = useState<any[]>([]);
    const [complaintsLoading, setComplaintsLoading] = useState(true);

    useEffect(() => {
        if (!token) return;
        setOutagesLoading(true);
        getUserOutages(token, debouncedSearch, page, 10)
            .then(res => {
                setOutages(res.items);
                setTotalPages(res.totalPages);
            })
            .catch(console.error)
            .finally(() => setOutagesLoading(false));
            
        // Fetch complaints
        import("@/features/complaints/api/complaintApi").then(({ getMyComplaints }) => {
            setComplaintsLoading(true);
            getMyComplaints(1, 20)
                .then(res => setComplaints(res.items))
                .catch(console.error)
                .finally(() => setComplaintsLoading(false));
        });
    }, [token, debouncedSearch, page]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !token) return;

        setUploading(true);
        try {
            const url = await uploadProfilePhoto(token, file);
            setProfile(prev => prev ? { ...prev, profilePhotoUrl: url } : null);
            updateUser({ profilePhotoUrl: url });
            showAlert("Photo Updated", "Your profile photo has been updated successfully.", "success");
        } catch (err) {
            console.error("Failed to upload photo", err);
            showAlert("Upload Failed", "There was an error uploading your profile photo. Please try again.", "error");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;
        
        setSaving(true);
        try {
            await updateUserProfile(token, {
                displayName: formData.displayName,
                phoneNumber: formData.phoneNumber,
                bio: formData.bio
            });
            updateUser({ displayName: formData.displayName });
            showAlert("Profile Updated", "Your details have been saved successfully.", "success");
        } catch (err) {
            console.error("Failed to update profile", err);
            showAlert("Update Failed", "There was an error updating your profile. Please try again.", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = () => {
        showAlert("Under Development", "The Change Password feature is currently being built. Please check back later.", "info");
    };

    if (loading) {
        return (
            <div className="min-h-screen p-6 md:p-12 max-w-[1280px] mx-auto w-full animate-pulse">
                <div className="h-32 w-32 bg-[#D8D8D1] rounded-full mb-8"></div>
                <div className="h-8 w-64 bg-[#D8D8D1] rounded mb-4"></div>
            </div>
        );
    }

    if (!profile) return null;

    return (
        <div className="min-h-screen p-6 md:p-12 max-w-[1280px] mx-auto w-full relative">
            <Link href="/" className="font-mono text-[10px] uppercase tracking-widest text-[#7A817D] hover:text-[#10201B] transition-colors flex items-center mb-8 md:mb-12">
                <ArrowLeft className="mr-2 h-3 w-3" /> Back Home
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start">
                <div className="lg:col-span-4 w-full flex flex-col">
                    <FadeIn direction="up" className="w-full">
                        <h2 className="font-mono text-xs uppercase tracking-widest text-[#10201B] mb-8 border-b border-[#D8D8D1] pb-4">
                            Account
                        </h2>

                        <div className="w-full flex flex-col items-center justify-center mb-10">
                            <div className="relative w-32 h-32 group mb-5">
                                <div className="w-full h-full rounded-full overflow-hidden border-2 border-[#D8D8D1] bg-[#EBEBE3]">
                                {profile.profilePhotoUrl ? (
                                    <img src={profile.profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center font-serif text-4xl text-[#7A817D]">
                                        {profile.displayName.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="absolute bg-[#10201B] text-white rounded-full hover:bg-[#10201B]/90 transition-colors shadow-md disabled:opacity-50 border-4 border-white flex items-center justify-center"
                                style={{ 
                                    width: '36px', 
                                    height: '36px',
                                    right: '2px',
                                    bottom: '2px'
                                }}
                                title="Change Photo"
                            >
                                <Edit2 className="h-4 w-4" />
                            </button>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*" 
                                onChange={handleFileChange}
                            />
                        </div>
                        
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <h3 className="font-serif text-2xl text-[#10201B] leading-tight">{profile.displayName}</h3>
                            {profile.isVerified && (
                                <CheckCircle2 className="w-5 h-5 text-[#147A8A]" />
                            )}
                        </div>
                        <p className="font-sans text-[15px] text-[#5E6B68]">{profile.email}</p>
                        </div>

                        <form onSubmit={handleSave} className="w-full flex flex-col gap-6 mb-10">
                            
                            <div className="space-y-2">
                                <Label htmlFor="displayName" className="text-[#10201B]">Display Name</Label>
                                <Input 
                                    id="displayName" 
                                    value={formData.displayName}
                                    onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                                    required
                                    className="border-[#D8D8D1] focus-visible:ring-[#10201B]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phoneNumber" className="text-[#10201B]">Phone Number</Label>
                                <Input 
                                    id="phoneNumber" 
                                    type="tel"
                                    placeholder="+91 9876543210"
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                                    className="border-[#D8D8D1] focus-visible:ring-[#10201B]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bio" className="text-[#10201B]">Bio / About</Label>
                                <textarea 
                                    id="bio" 
                                    placeholder="Tell the community a bit about yourself..."
                                    value={formData.bio}
                                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                    className="flex min-h-[80px] w-full rounded-md border border-[#D8D8D1] bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-[#7A817D] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#10201B] disabled:cursor-not-allowed disabled:opacity-50"
                                />
                            </div>

                            <button 
                                type="submit"
                                disabled={saving}
                                className={cn(
                                    buttonVariants({ variant: "default" }),
                                    "w-full rounded-full bg-[#10201B] hover:bg-[#10201B]/90 text-white font-sans font-medium h-12 mt-2 disabled:opacity-70 flex items-center justify-center gap-2"
                                )}
                            >
                                {saving ? "Saving..." : "Save changes"}
                            </button>
                        </form>

                        <div className="flex flex-col gap-4 w-full border-t border-[#D8D8D1] pt-8">
                            <button 
                                onClick={handleChangePassword}
                                type="button"
                                className={cn(
                                    buttonVariants({ variant: "outline" }),
                                    "w-full rounded-full border border-[#D8D8D1] text-[#10201B] font-sans font-medium h-10 hover:bg-[#EBEBE3] transition-colors"
                                )}
                            >
                                Change password
                            </button>

                            <button 
                                onClick={() => setShowLogoutModal(true)}
                                type="button"
                                className="w-full text-center font-sans font-medium text-[#B34435] hover:text-[#903022] hover:underline transition-colors mt-2"
                            >
                                Log out
                            </button>
                        </div>
                    </FadeIn>
                </div>

                <div className="lg:col-span-8">
                    <FadeIn direction="up" delay={0.1}>
                        
                        {/* Gamification Dashboard */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                            <div className="bg-white p-6 border border-[#D8D8D1] rounded-[10px]">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-[#10201B]" />
                                        <h2 className="text-lg font-serif text-[#10201B]">Civic Points</h2>
                                    </div>
                                    <span className="text-2xl font-serif text-[#147A8A]">{profile.civicPoints || 0}</span>
                                </div>
                                <div className="w-full bg-[#F5F4EF] rounded-full h-2 mb-2 border border-[#D8D8D1]">
                                    <div 
                                        className="bg-[#147A8A] h-2 rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${Math.min(100, ((profile.civicPoints || 0) / ((profile.civicPoints || 0) < 50 ? 50 : (profile.civicPoints || 0) < 200 ? 200 : 500)) * 100)}%` }}
                                    ></div>
                                </div>
                                <p className="text-[11px] text-[#7A817D] font-mono">
                                    Progress to next badge tier
                                </p>
                            </div>

                            <div className="bg-white p-6 border border-[#D8D8D1] rounded-[10px]">
                                <h2 className="text-lg font-serif text-[#10201B] mb-4">Earned Badges</h2>
                                {!profile.badges || profile.badges.length === 0 ? (
                                    <p className="text-sm text-[#7A817D] py-2">No badges yet. Start reporting to earn them!</p>
                                ) : (
                                    <div className="flex flex-wrap gap-4">
                                        {profile.badges.map((b, i) => (
                                            <div key={i} className="flex flex-col items-center gap-2">
                                                <BadgeDisplay badgeName={b.badgeName} size="md" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 border-b border-[#D8D8D1] pb-4">
                            <h2 className="font-mono text-xs uppercase tracking-widest text-[#10201B]">
                                Your Complaints & Reports
                            </h2>
                        </div>
                        
                        {complaintsLoading ? (
                            <div className="space-y-0 mb-12">
                                {[1, 2].map((i) => (
                                    <div key={i} className="py-6 border-b border-[#D8D8D1] flex justify-between">
                                        <div className="h-4 w-32 bg-[#D8D8D1] rounded animate-pulse"></div>
                                    </div>
                                ))}
                            </div>
                        ) : complaints.length > 0 && (
                            <div className="flex flex-col mb-12">
                                {complaints.map((c) => (
                                    <div key={c.id} className="py-5 border-b border-[#D8D8D1] flex flex-col gap-1.5">
                                        <div className="flex items-center justify-between w-full">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-[10px] uppercase tracking-widest text-[#10201B]">
                                                    {c.category} • {c.type.replace("_", " ")}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {c.vouchCount > 0 && (
                                                    <span className="font-mono text-[10px] text-[#B34435] flex items-center gap-1 font-medium bg-[#B34435]/10 px-2 py-0.5 rounded-full">
                                                        🔥 {c.vouchCount} {c.vouchCount === 1 ? 'Vouch' : 'Vouches'}
                                                    </span>
                                                )}
                                                <span className="font-mono text-[10px] uppercase tracking-widest text-[#10201B] bg-[#EBEBE3] px-2 py-0.5 rounded-full">
                                                    ● {c.status}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="font-serif text-[22px] text-[#10201B] leading-tight mt-1 mb-1">
                                            {c.publicReferenceId}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className="font-sans text-sm text-[#5E6B68]">
                                                Reported {new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                            </span>
                                            {c.evidenceUrl && (
                                                <a href={c.evidenceUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-[10px] uppercase tracking-widest text-[#147A8A] hover:underline">
                                                    View Evidence
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 border-b border-[#D8D8D1] pb-4 mt-8">
                            <h2 className="font-mono text-xs uppercase tracking-widest text-[#10201B]">
                                Your Outage Reports
                            </h2>
                            <input 
                                type="text" 
                                placeholder="Search reports..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full sm:w-64 h-9 px-4 rounded-full border border-[#D8D8D1] bg-transparent font-sans text-sm focus:outline-none focus:border-[#10201B] focus:ring-1 focus:ring-[#10201B] transition-all placeholder:text-[#7A817D]"
                            />
                        </div>
                        
                        {outagesLoading ? (
                            <div className="space-y-0">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="py-6 border-b border-[#D8D8D1] flex justify-between">
                                        <div className="h-4 w-32 bg-[#D8D8D1] rounded animate-pulse"></div>
                                    </div>
                                ))}
                            </div>
                        ) : outages.length === 0 ? (
                            search ? (
                                <div className="py-12 text-left">
                                    <p className="font-sans text-[#5E6B68]">No matching reports.</p>
                                </div>
                            ) : (
                                <div className="py-12 text-left">
                                    <p className="font-sans text-[#5E6B68]">No outage reports yet.</p>
                                    <Link href="/report" className="text-[#10201B] font-medium underline mt-2 inline-block hover:text-[#147A8A] transition-colors">
                                        Report an outage
                                    </Link>
                                </div>
                            )
                        ) : (
                            <div className="flex flex-col">
                                {outages.map((o) => {
                                    const isPower = o.type === "Power";
                                    const Icon = isPower ? Zap : Droplets;
                                    const label = isPower ? "POWER OUTAGE" : "WATER OUTAGE";
                                    const accentColor = isPower ? "text-[#B7791F]" : "text-[#147A8A]";
                                    
                                    return (
                                        <div key={o.id} className="py-5 border-b border-[#D8D8D1] flex flex-col gap-1.5">
                                            <div className="flex items-center justify-between w-full">
                                                <div className="flex items-center gap-2">
                                                    <Icon className={`h-3.5 w-3.5 ${accentColor}`} strokeWidth={2.5} />
                                                    <span className={`font-mono text-[10px] uppercase tracking-widest ${accentColor}`}>
                                                        {label}
                                                    </span>
                                                </div>
                                                {o.resolvedAt ? (
                                                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#5E6B68] bg-[#EBEBE3] px-2 py-0.5 rounded-full flex items-center gap-1">
                                                        ● RESOLVED
                                                    </span>
                                                ) : (
                                                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#10201B] px-2 py-0.5 rounded-full flex items-center gap-1">
                                                        ● ACTIVE
                                                    </span>
                                                )}
                                            </div>
                                            <Link href={`/areas/${o.localityId}`} className="font-serif text-[22px] text-[#10201B] hover:underline leading-tight mt-1 mb-1">
                                                {o.localityName}
                                            </Link>
                                            <span className="font-sans text-sm text-[#5E6B68]">
                                                Reported {new Date(o.reportedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {!outagesLoading && totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4 mt-8">
                                <button 
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="h-9 px-4 rounded-full border border-[#D8D8D1] font-sans text-xs font-medium disabled:opacity-50 hover:bg-[#EBEBE3] transition-colors"
                                >
                                    Previous
                                </button>
                                <span className="font-mono text-xs text-[#7A817D]">
                                    Page {page} of {totalPages}
                                </span>
                                <button 
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="h-9 px-4 rounded-full border border-[#D8D8D1] font-sans text-xs font-medium disabled:opacity-50 hover:bg-[#EBEBE3] transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </FadeIn>
                </div>
            </div>

            {/* Custom Alert Modal */}
            {alertModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div 
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
                        onClick={closeAlert}
                    ></div>
                    
                    <div className="bg-[#F5F4EF] rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-xl border border-[#D8D8D1] transform transition-all relative z-10 animate-in zoom-in-95 duration-200">
                        <div className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center mb-5",
                            alertModal.type === "success" ? "bg-[#147A8A]/10 text-[#147A8A]" : 
                            alertModal.type === "error" ? "bg-red-100 text-red-600" : 
                            "bg-blue-100 text-blue-600"
                        )}>
                            {alertModal.type === "success" && <CheckCircle2 className="w-6 h-6" />}
                            {alertModal.type === "error" && <AlertTriangle className="w-6 h-6" />}
                            {alertModal.type === "info" && <Info className="w-6 h-6" />}
                        </div>
                        
                        <h3 className="font-serif text-2xl font-medium text-[#10201B] mb-2">{alertModal.title}</h3>
                        <p className="font-sans text-[#5E6B68] text-[15px] mb-8 leading-relaxed">
                            {alertModal.message}
                        </p>
                        
                        <div className="flex justify-end">
                            <button 
                                onClick={closeAlert}
                                className="font-sans font-medium px-6 h-10 rounded-xl bg-[#10201B] text-white hover:bg-[#10201B]/90 transition-colors"
                            >
                                Got it
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
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
        </div>
    );
}
