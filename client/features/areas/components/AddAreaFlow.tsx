"use client";

import { useState } from "react";
import { reverseGeocode } from "@/lib/geocoding";
import { createArea } from "@/features/areas/api";
import { Area } from "@/features/areas/types";
import { MapPin, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AddAreaFlowProps {
    onAreaCreated: (area: Area) => void;
}

type Step = "idle" | "loading" | "confirm" | "submitting" | "manual";

export function AddAreaFlow({ onAreaCreated }: AddAreaFlowProps) {
    const [step, setStep] = useState<Step>("idle");
    const [error, setError] = useState<string | null>(null);
    
    // Form state
    const [name, setName] = useState("");
    const [pinCode, setPinCode] = useState("");
    const [lat, setLat] = useState<number>(0);
    const [lng, setLng] = useState<number>(0);

    const handleLocate = () => {
        setError(null);
        setStep("loading");
        
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser. Please enter area manually.");
            setStep("manual");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setLat(latitude);
                setLng(longitude);
                
                try {
                    const result = await reverseGeocode(latitude, longitude);
                    setName(result.suggestedName);
                    setPinCode(result.suggestedPinCode);
                    setStep("confirm");
                } catch (err) {
                    setError("Failed to determine location details. Please enter manually.");
                    setStep("manual");
                }
            },
            (err) => {
                setError("Location access denied or unavailable. You can still add your area manually.");
                setStep("manual");
            },
            { timeout: 10000 }
        );
    };

    const handleSubmit = async (e?: React.FormEvent | React.KeyboardEvent) => {
        if (e) e.preventDefault();
        if (!name.trim() || !pinCode.trim()) {
            setError("Name and PIN code are required.");
            return;
        }

        setStep("submitting");
        setError(null);

        try {
            const newArea = await createArea({
                name: name.trim(),
                pinCode: pinCode.trim(),
                latitude: lat,
                longitude: lng
            });
            onAreaCreated(newArea);
            // Reset for next time if needed
            setStep("idle");
            setName("");
            setPinCode("");
        } catch (err: any) {
            if (err.response?.status === 409) {
                setError("This area already exists. Please search for it in the list above instead.");
            } else {
                setError("Failed to create area. Please try again.");
            }
            setStep(step === "submitting" && lat === 0 ? "manual" : "confirm");
        }
    };

    if (step === "idle") {
        return (
            <div className="mt-2 text-left">
                <button 
                    type="button" 
                    onClick={handleLocate}
                    className="inline-flex items-center font-mono text-[10px] uppercase tracking-widest text-[#10201B] hover:text-[#10201B] transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-[#10201B] hover:after:w-full after:transition-all"
                >
                    <MapPin className="h-3 w-3 mr-1" />
                    Can't find your area? Report it here
                </button>
            </div>
        );
    }

    if (step === "loading") {
        return (
            <div className="mt-4 p-4 border border-[#D8D8D1] bg-white flex items-center gap-3">
                <Loader2 className="h-4 w-4 animate-spin text-[#10201B]" />
                <span className="font-sans text-sm text-[#5E6B68]">Requesting location...</span>
            </div>
        );
    }

    return (
        <div className="mt-4 p-6 border border-[#D8D8D1] bg-white/50">
            <h4 className="font-serif text-lg font-medium text-[#10201B] mb-1">
                {step === "manual" ? "Add Area Manually" : "Confirm Area Details"}
            </h4>
            <p className="font-sans text-sm text-[#5E6B68] mb-6">
                {step === "manual" 
                    ? "Enter the details for your area to add it to the system." 
                    : "We found this location based on your device. Edit if needed."}
            </p>

            {error && (
                <div className="flex items-start gap-2 mb-6 text-[#B34435] font-sans text-sm">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="font-mono text-[10px] uppercase tracking-widest text-[#7A817D] block">
                        Area Name
                    </label>
                    <Input 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSubmit(); } }}
                        placeholder="e.g. Navrangpura"
                        className="bg-white border-[#D8D8D1] focus-visible:ring-[#10201B] rounded-none h-10 font-sans"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <label className="font-mono text-[10px] uppercase tracking-widest text-[#7A817D] block">
                        PIN Code
                    </label>
                    <Input 
                        value={pinCode} 
                        onChange={(e) => setPinCode(e.target.value)} 
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSubmit(); } }}
                        placeholder="e.g. 380009"
                        className="bg-white border-[#D8D8D1] focus-visible:ring-[#10201B] rounded-none h-10 font-sans"
                        required
                    />
                </div>

                <div className="flex items-center gap-3 pt-4">
                    <Button 
                        type="button" 
                        onClick={handleSubmit}
                        disabled={step === "submitting"}
                        className="rounded-full bg-[#10201B] hover:bg-[#10201B]/90 text-white font-sans font-medium px-6 h-10"
                    >
                        {step === "submitting" ? "Adding..." : "Add Area"}
                    </Button>
                    <Button 
                        type="button" 
                        variant="ghost"
                        onClick={() => { setStep("idle"); setError(null); }}
                        className="rounded-full hover:bg-[#EBEBE3] text-[#5E6B68] font-sans font-medium px-4 h-10"
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    );
}
