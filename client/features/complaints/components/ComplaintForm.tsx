"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, UploadCloud, X } from "lucide-react";
import { createComplaint, uploadEvidence } from "../api/complaintApi";
import { useAuth } from "@/features/auth/context/AuthContext";

type ComplaintCategory = "FOOD" | "MEDICINE" | "DRUG";

interface ComplaintFormProps {
    category: ComplaintCategory;
    onReported: (referenceId: string) => void;
}

const getCategoryLabel = (cat: ComplaintCategory) => {
    switch (cat) {
        case "FOOD": return "Food Safety Issue";
        case "MEDICINE": return "Medicine Safety Issue";
        case "DRUG": return "Drug Safety Issue";
    }
};

const getTypes = (cat: ComplaintCategory) => {
    switch (cat) {
        case "FOOD": return ["ADULTERATED", "UNSAFE", "MISLABELED", "HYGIENE", "OTHER"];
        case "MEDICINE": return ["EXPIRED", "FAKE", "UNSAFE", "MISLABELED", "UNAUTHORIZED_SALE", "OTHER"];
        case "DRUG": return ["ILLEGAL_SALE", "SUSPECTED_NARCOTICS", "PRESCRIPTION_VIOLATION", "OTHER"];
    }
};

const getFormLabels = (cat: ComplaintCategory) => {
    switch (cat) {
        case "FOOD":
            return {
                titleLabel: "Product / Item / Restaurant Name (Optional)",
                titlePlaceholder: "e.g. Brand Name Milk, Local Restaurant",
                locationLabel: "Where was this purchased/observed? (Optional)",
                locationPlaceholder: "Store name, address, or locality",
                descLabel: "Description",
                descPlaceholder: "Please provide details about the food safety issue...",
            };
        case "MEDICINE":
            return {
                titleLabel: "Medicine Name / Brand (Optional)",
                titlePlaceholder: "e.g. Paracetamol 500mg, Brand Name",
                locationLabel: "Pharmacy / Chemist Details (Optional)",
                locationPlaceholder: "Pharmacy name, address, or website",
                descLabel: "Description & Details",
                descPlaceholder: "Please provide details about the issue (e.g., side effects, suspicious packaging)...",
            };
        case "DRUG":
            return {
                titleLabel: "Drug / Substance Details (Optional)",
                titlePlaceholder: "Name of the drug or suspected substance",
                locationLabel: "Location of Activity / Vendor (Optional)",
                locationPlaceholder: "Address, landmark, or specific area",
                descLabel: "Description of Incident",
                descPlaceholder: "Provide details about the illegal sale, suspicious activity, or violation...",
            };
    }
};

export default function ComplaintForm({ category, onReported }: ComplaintFormProps) {
    const { user } = useAuth();
    const [type, setType] = useState<string>("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [specificLocation, setSpecificLocation] = useState("");
    
    // Extra fields for medicine/food
    const [batchNo, setBatchNo] = useState("");
    const [mfgDate, setMfgDate] = useState("");
    const [expDate, setExpDate] = useState("");
    
    // File upload state
    const [file, setFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const types = getTypes(category);
    const labels = getFormLabels(category);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) {
            setFile(selected);
            setFilePreview(URL.createObjectURL(selected));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        
        if (!type || !description) {
            setError("Please select a complaint type and provide a description.");
            return;
        }

        setIsSubmitting(true);
        try {
            let evidenceUrl = undefined;
            if (file) {
                evidenceUrl = await uploadEvidence(file);
            }

            let finalDescription = description;
            const extraDetails = [];
            if (batchNo) extraDetails.push(`Batch No: ${batchNo}`);
            if (mfgDate) extraDetails.push(`Mfg Date: ${mfgDate}`);
            if (expDate) extraDetails.push(`Exp Date: ${expDate}`);
            
            if (extraDetails.length > 0) {
                finalDescription = `${extraDetails.join(" | ")}\n\n${description}`;
            }

            const res = await createComplaint({
                category,
                type,
                title,
                description: finalDescription,
                specificLocation,
                evidenceUrl
            });
            onReported(res.publicReferenceId);
        } catch (err: any) {
            setError(err.message || "An error occurred while submitting your complaint.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full">
            <h1 className="font-serif text-[40px] leading-[1.1] text-[#10201B] tracking-tight mb-8">
                Report {getCategoryLabel(category)}
            </h1>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-xl">
                {/* Type Selection */}
                <div className="flex flex-col gap-4">
                    <label className="font-mono text-[10px] uppercase tracking-widest text-[#7A817D]">
                        Issue Type <span className="text-[#B34435]">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {types.map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setType(t)}
                                className={`px-4 py-2.5 rounded-full font-mono text-[11px] uppercase tracking-wider transition-all duration-200 border ${
                                    type === t 
                                    ? "bg-[#147A8A]/10 text-[#147A8A] border-[#147A8A]" 
                                    : "bg-white text-[#5E6B68] border-[#D8D8D1] hover:bg-[#F5F4EF] hover:text-[#147A8A] hover:border-[#147A8A]/40"
                                }`}
                            >
                                {t.replace(/_/g, " ")}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Details */}
                <div className="flex flex-col gap-6 p-6 bg-white border border-[#D8D8D1] rounded-[10px]">
                    
                    <div className="flex flex-col gap-2">
                        <label className="font-mono text-[10px] uppercase tracking-widest text-[#7A817D]" htmlFor="title">
                            {labels.titleLabel}
                        </label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={labels.titlePlaceholder}
                            className="w-full bg-transparent border-b border-[#D8D8D1] pb-2 text-[15px] text-[#10201B] placeholder:text-[#A1A1A5] focus:outline-none focus:border-[#10201B] transition-colors"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="font-mono text-[10px] uppercase tracking-widest text-[#7A817D]" htmlFor="location">
                            {labels.locationLabel}
                        </label>
                        <input
                            id="location"
                            type="text"
                            value={specificLocation}
                            onChange={(e) => setSpecificLocation(e.target.value)}
                            placeholder={labels.locationPlaceholder}
                            className="w-full bg-transparent border-b border-[#D8D8D1] pb-2 text-[15px] text-[#10201B] placeholder:text-[#A1A1A5] focus:outline-none focus:border-[#10201B] transition-colors"
                        />
                    </div>

                    {category !== "DRUG" && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="font-mono text-[10px] uppercase tracking-widest text-[#7A817D]" htmlFor="batchNo">
                                    Batch Number
                                </label>
                                <input
                                    id="batchNo"
                                    type="text"
                                    value={batchNo}
                                    onChange={(e) => setBatchNo(e.target.value)}
                                    placeholder="Optional"
                                    className="w-full bg-transparent border-b border-[#D8D8D1] pb-2 text-[15px] text-[#10201B] placeholder:text-[#A1A1A5] focus:outline-none focus:border-[#10201B] transition-colors"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="font-mono text-[10px] uppercase tracking-widest text-[#7A817D]" htmlFor="mfgDate">
                                    Mfg Date
                                </label>
                                <input
                                    id="mfgDate"
                                    type="text"
                                    value={mfgDate}
                                    onChange={(e) => setMfgDate(e.target.value)}
                                    placeholder="Optional"
                                    className="w-full bg-transparent border-b border-[#D8D8D1] pb-2 text-[15px] text-[#10201B] placeholder:text-[#A1A1A5] focus:outline-none focus:border-[#10201B] transition-colors"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="font-mono text-[10px] uppercase tracking-widest text-[#7A817D]" htmlFor="expDate">
                                    Exp Date
                                </label>
                                <input
                                    id="expDate"
                                    type="text"
                                    value={expDate}
                                    onChange={(e) => setExpDate(e.target.value)}
                                    placeholder="Optional"
                                    className="w-full bg-transparent border-b border-[#D8D8D1] pb-2 text-[15px] text-[#10201B] placeholder:text-[#A1A1A5] focus:outline-none focus:border-[#10201B] transition-colors"
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        <label className="font-mono text-[10px] uppercase tracking-widest text-[#7A817D]" htmlFor="description">
                            {labels.descLabel} <span className="text-[#B34435]">*</span>
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            placeholder={labels.descPlaceholder}
                            className="w-full bg-transparent border-b border-[#D8D8D1] pb-2 text-[15px] text-[#10201B] placeholder:text-[#A1A1A5] focus:outline-none focus:border-[#10201B] transition-colors resize-none"
                        />
                    </div>

                    <div className="flex flex-col gap-2 pt-2 border-t border-[#D8D8D1]">
                        <label className="font-mono text-[10px] uppercase tracking-widest text-[#7A817D]">
                            Attach Photo / Video (Optional)
                        </label>
                        {!filePreview ? (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full h-32 border-2 border-dashed border-[#D8D8D1] rounded-[10px] flex flex-col items-center justify-center text-[#7A817D] hover:bg-[#F5F4EF] transition-colors hover:border-[#10201B]"
                            >
                                <UploadCloud className="w-6 h-6 mb-2" />
                                <span className="font-sans text-[13px]">Click to upload evidence</span>
                            </button>
                        ) : (
                            <div className="relative w-full h-48 border border-[#D8D8D1] rounded-[10px] overflow-hidden bg-gray-50">
                                {file?.type.startsWith('video/') ? (
                                    <video src={filePreview} controls className="w-full h-full object-contain" />
                                ) : (
                                    <img src={filePreview} alt="Evidence preview" className="w-full h-full object-contain" />
                                )}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFile(null);
                                        setFilePreview(null);
                                        if (fileInputRef.current) fileInputRef.current.value = "";
                                    }}
                                    className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 hover:bg-black transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*,video/*"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 border border-[#B34435]/20 rounded-md">
                        <p className="text-[13px] text-[#B34435]">{error}</p>
                    </div>
                )}

                <Button 
                    type="submit" 
                    disabled={isSubmitting || !type || !description}
                    className="w-full sm:w-auto self-start h-12 px-8 rounded-full bg-[#10201B] hover:bg-[#10201B]/90 text-white font-medium"
                >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Complaint"}
                </Button>
            </form>
        </div>
    );
}
