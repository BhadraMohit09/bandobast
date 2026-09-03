const fs = require('fs');

fs.writeFileSync('components/layout/Navbar.tsx', \"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Zap } from "lucide-react";

export function Navbar() {
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white">
            <div className="container flex h-16 max-w-7xl mx-auto items-center px-6 md:px-8">
                <Link href="/" className="flex items-center gap-2 mr-8">
                    <Zap className="h-5 w-5 text-primary" />
                    <span className="font-bold tracking-tight text-lg text-foreground">Bandobast</span>
                </Link>
                
                <nav className="flex flex-1 items-center justify-end gap-2 md:gap-4">
                    <Link 
                        href="/areas" 
                        className={cn(
                            buttonVariants({ variant: "ghost", size: "sm" }), 
                            "text-muted-foreground hover:text-foreground",
                            pathname?.startsWith("/areas") && "bg-muted text-primary font-medium"
                        )}
                    >
                        Browse Areas
                    </Link>
                    <Link 
                        href="/report" 
                        className={cn(
                            buttonVariants({ variant: "default", size: "sm" }),
                            ""
                        )}
                    >
                        Report Outage
                    </Link>
                </nav>
            </div>
        </header>
    );
}\);

fs.writeFileSync('app/page.tsx', \import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ArrowRight, MapPin } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-6 py-24 bg-background">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
          Community-powered outage reporting
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          Bandobast helps you track local power and water outages, view real-time reports, and predict upcoming disruptions based on historical data.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link href="/report" className={buttonVariants({ variant: "default", size: "lg", className: "h-12 px-8" })}>
            Report an Outage
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link href="/areas" className={buttonVariants({ variant: "outline", size: "lg", className: "h-12 px-8 bg-white" })}>
            <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
            Browse Areas
          </Link>
        </div>
      </div>
    </div>
  );
}\);

fs.writeFileSync('features/outages/components/OutageForm.tsx', \"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { getAreas } from "@/features/areas/api";
import { Area } from "@/features/areas/types";
import { createOutage } from "@/features/outages/api";
import { OutageType } from "@/features/outages/types";
import { getReporterToken } from "@/lib/reporterToken";
import { AlertCircle, CheckCircle2, Loader2, MapPin, Zap, Droplets } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OutageForm({ defaultAreaId, onReported, onAreaSelected }: { defaultAreaId?: number; onReported?: (localityId: number) => void; onAreaSelected?: (id: number | null) => void }) {
    const [areas, setAreas] = useState<Area[]>([]);
    const [localityId, setLocalityId] = useState<string>(defaultAreaId ? String(defaultAreaId) : "");
    const [type, setType] = useState<string>("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        getAreas().then(setAreas).catch(() => setError("Failed to load areas."));
    }, []);

    useEffect(() => {
        if (defaultAreaId) {
            setLocalityId(String(defaultAreaId));
        }
    }, [defaultAreaId]);

    useEffect(() => {
        onAreaSelected?.(localityId ? Number(localityId) : null);
    }, [localityId, onAreaSelected]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!localityId || type === "") {
            setError("Please select both area and outage type.");
            return;
        }

        setSubmitting(true);
        try {
            await createOutage({
                localityId: Number(localityId),
                type: Number(type) as OutageType,
                reporterToken: getReporterToken(),
            });
            setSuccess(true);
            onReported?.(Number(localityId));
        } catch {
            setError("Failed to report outage. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Card className="w-full max-w-md shadow-sm border-muted">
            <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-2xl font-bold tracking-tight">Report an Outage</CardTitle>
                <p className="text-sm text-muted-foreground">
                    Help your community by reporting local power and water outages.
                </p>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="area" className="text-sm font-medium">Area</Label>
                        <Select value={localityId} onValueChange={(value) => setLocalityId(value ?? "")}>
                            <SelectTrigger id="area" className="h-11 px-4 border-muted focus:ring-primary focus:ring-offset-1 transition-colors">
                                <SelectValue placeholder="Select your area" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px] border-muted">
                                {areas.map((area) => (
                                    <SelectItem key={area.id} value={String(area.id)} className="cursor-pointer py-2.5 px-3 hover:bg-muted focus:bg-muted">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            <span>{area.name}</span>
                                            <span className="text-xs text-muted-foreground ml-2">({area.pinCode})</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="type" className="text-sm font-medium">Outage Type</Label>
                        <Select value={type} onValueChange={(value) => setType(value ?? "")}>
                            <SelectTrigger id="type" className="h-11 px-4 border-muted focus:ring-primary focus:ring-offset-1 transition-colors">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent className="border-muted">
                                <SelectItem value="0" className="cursor-pointer py-2.5 px-3 hover:bg-muted focus:bg-muted">
                                    <div className="flex items-center gap-2">
                                        <Zap className="h-4 w-4 text-amber-500" />
                                        <span>Power</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="1" className="cursor-pointer py-2.5 px-3 hover:bg-muted focus:bg-muted">
                                    <div className="flex items-center gap-2">
                                        <Droplets className="h-4 w-4 text-blue-500" />
                                        <span>Water</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {error && (
                        <div className="flex items-start gap-2 p-3 text-sm text-destructive border border-destructive/20 bg-destructive/10 rounded-md">
                            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}
                    
                    {success && (
                        <div className="flex items-start gap-2 p-3 text-sm text-emerald-700 border border-emerald-200 bg-emerald-50 rounded-md">
                            <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                            <p>Outage reported. Thank you!</p>
                        </div>
                    )}

                    <Button type="submit" disabled={submitting} className="w-full h-11 text-base font-medium">
                        {submitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Reporting...
                            </>
                        ) : "Submit Report"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}\);

fs.writeFileSync('app/areas/page.tsx', \"use client";

import { useEffect, useState } from "react";
import { Area } from "@/features/areas/types";
import { getAreas } from "@/features/areas/api";
import { AreaCard } from "@/features/areas/components/AreaCard";
import { MapPin } from "lucide-react";

export default function AreasPage() {
    const [areas, setAreas] = useState<Area[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAreas()
            .then(setAreas)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-background p-6 md:p-12">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-10 space-y-2 animate-pulse">
                        <div className="h-10 w-64 bg-muted rounded-md mb-4"></div>
                        <div className="h-6 w-96 bg-muted rounded-md"></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="h-40 rounded-xl bg-muted animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-6 md:p-12">
            <div className="max-w-7xl mx-auto">
                <div className="mb-10 space-y-2">
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">Explore Regions</h1>
                    <p className="text-muted-foreground text-lg max-w-2xl">
                        Select a locality to view predictions and recent outage reports.
                    </p>
                </div>
                {areas.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">
                        <MapPin className="h-10 w-10 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">No areas found.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {areas.map((area) => (
                            <AreaCard key={area.id} area={area} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}\);

fs.writeFileSync('features/areas/components/AreaCard.tsx', \import Link from "next/link";
import { Area } from "../types";
import { MapPin, ArrowRight } from "lucide-react";

export function AreaCard({ area }: { area: Area }) {
    return (
        <Link href={\/areas/\\} className="block group">
            <div className="flex flex-col h-full rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/30">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <MapPin className="h-5 w-5" />
                    </div>
                </div>
                
                <h3 className="text-xl font-bold tracking-tight text-foreground line-clamp-1">{area.name}</h3>
                <p className="mt-2 flex items-center text-sm text-muted-foreground">
                    <span className="inline-flex items-center rounded-md bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                        PIN: {area.pinCode}
                    </span>
                </p>

                <div className="mt-6 flex items-center text-sm font-medium text-primary">
                    View Details <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
            </div>
        </Link>
    );
}\);

fs.writeFileSync('app/areas/[id]/page.tsx', \"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Area } from "@/features/areas/types";
import { getAreaById } from "@/features/areas/api";
import { PredictionPanel } from "@/features/predictions/components/PredictionPanel";
import OutageList from "@/features/outages/components/OutageList";
import { buttonVariants } from "@/components/ui/button";
import { AlertCircle, MapPin, ArrowLeft, Zap } from "lucide-react";

export default function AreaDetailPage() {
    const params = useParams();
    const id = Number(params.id);
    const [area, setArea] = useState<Area | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        getAreaById(id)
            .then(setArea)
            .catch(() => setError("Failed to load area details."))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background p-6 md:p-12">
                <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
                    <div className="h-6 w-24 bg-muted rounded-md mb-8"></div>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/40 pb-8">
                        <div className="space-y-3">
                            <div className="h-12 w-64 bg-muted rounded-md"></div>
                            <div className="h-6 w-32 bg-muted rounded-md"></div>
                        </div>
                        <div className="h-12 w-56 bg-muted rounded-xl"></div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start pt-4">
                        <div className="h-[400px] bg-muted/50 rounded-2xl border border-muted"></div>
                        <div className="h-[500px] bg-muted/50 rounded-2xl border border-muted"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !area) {
        return (
            <div className="p-6 md:p-12 text-center max-w-lg mx-auto mt-24">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mb-6">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
                <h2 className="text-2xl font-bold mb-3">{error || "Area not found"}</h2>
                <p className="text-muted-foreground text-lg">The area you are looking for does not exist or there was a problem loading it.</p>
                <Link href="/areas" className={buttonVariants({ variant: "outline", className: "mt-8" })}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Areas
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-6 md:p-12">
            <div className="max-w-7xl mx-auto space-y-8">
                <Link href="/areas" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Areas
                </Link>
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b pb-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 flex items-center gap-3 text-foreground">
                            <MapPin className="h-8 w-8 text-primary" />
                            \
                        </h1>
                        <div className="flex items-center gap-3 text-muted-foreground">
                            <span className="inline-flex items-center rounded-md bg-muted px-2.5 py-1 text-sm font-medium text-foreground">
                                PIN: \
                            </span>
                        </div>
                    </div>
                    <Link href={\/report?areaId=\\} className={buttonVariants({ variant: "default", size: "lg", className: "h-12 px-6 rounded-xl" })}>
                        <Zap className="mr-2 h-5 w-5" />
                        Report an outage here
                    </Link>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start pt-4">
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold tracking-tight">
                                Predictions
                            </h2>
                        </div>
                        <PredictionPanel localityId={id} />
                    </section>
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold tracking-tight">
                                Recent Reports
                            </h2>
                        </div>
                        <OutageList localityId={id} />
                    </section>
                </div>
            </div>
        </div>
    );
}\);

fs.writeFileSync('features/predictions/components/PredictionPanel.tsx', \"use client";

import { useEffect, useState } from "react";
import { getPrediction } from "@/features/predictions/api";
import { PredictionResponse } from "@/features/predictions/types";
import { Loader2, Zap, Droplets, LineChart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function PredictionPanel({ localityId }: { localityId: number | null }) {
    const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (localityId === null) return;
        setLoading(true);
        setError(null);
        getPrediction(localityId)
            .then(setPrediction)
            .catch(() => setError("Failed to load predictions."))
            .finally(() => setLoading(false));
    }, [localityId]);

    if (loading) {
        return (
            <Card className="shadow-sm border-muted">
                <CardContent className="p-8 flex flex-col items-center justify-center min-h-[250px] text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary/50" />
                    <p>Analyzing patterns...</p>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="shadow-sm border-destructive/20 bg-destructive/5">
                <CardContent className="p-6 text-center text-destructive font-medium">
                    {error}
                </CardContent>
            </Card>
        );
    }

    const patterns = prediction?.patterns || [];

    return (
        <Card className="shadow-sm border-muted">
            <CardContent className="p-0">
                {patterns.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center p-12">
                        <LineChart className="h-12 w-12 text-muted-foreground/30 mb-4" />
                        <p className="text-lg font-semibold text-foreground mb-1">No patterns detected</p>
                        <p className="text-muted-foreground text-sm">Check back once more reports come in.</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-border">
                        {patterns.map((pattern, index) => {
                            const isPower = pattern.outageType.toLowerCase() === "power";
                            const Icon = isPower ? Zap : Droplets;
                            const badgeColor = isPower 
                                ? "bg-amber-100 text-amber-700 border-amber-200" 
                                : "bg-blue-100 text-blue-700 border-blue-200";
                            
                            return (
                                <li key={index} className="p-5 hover:bg-muted/30 transition-colors">
                                    <div className="flex items-start gap-4">
                                        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border", badgeColor)}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 pt-0.5">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-base font-semibold text-foreground">
                                                    {pattern.dayOfWeek}s
                                                </span>
                                                <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                                                    {pattern.occurrenceCount} reports
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground font-medium">
                                                {pattern.hourBucketStart}:00 – {pattern.hourBucketEnd}:00 • {pattern.outageType} Outage Risk
                                            </p>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
}\);

fs.writeFileSync('features/outages/components/OutageList.tsx', \"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { getOutagesByLocality } from "@/features/outages/api";
import { Outage, OutageType } from "@/features/outages/types";
import { Zap, Droplets, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

function formatTimeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return "Just now";
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return \\m ago\;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return \\h ago\;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "Yesterday";
    
    return \\d ago\;
}

export default function OutageList({ localityId }: { localityId: number | null }) {
    const [outages, setOutages] = useState<Outage[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchOutages = useCallback(() => {
        if (localityId === null) return;
        setLoading(true);
        getOutagesByLocality(localityId)
            .then(setOutages)
            .finally(() => setLoading(false));
    }, [localityId]);

    useEffect(() => {
        fetchOutages();
        // Poll every 30 seconds for new reports
        const interval = setInterval(fetchOutages, 30000);
        return () => clearInterval(interval);
    }, [fetchOutages]);

    if (localityId === null) {
        return (
            <Card className="shadow-sm border-muted">
                <CardContent className="p-8 flex flex-col items-center justify-center min-h-[250px] text-center text-muted-foreground">
                    <Clock className="h-8 w-8 text-muted-foreground/30 mb-3" />
                    <p>Select an area to see recent reports.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="shadow-sm border-muted">
            <CardContent className="p-0">
                {loading && (
                    <div className="p-6 space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-muted animate-pulse rounded-lg"></div>
                                    <div className="h-5 w-24 bg-muted animate-pulse rounded"></div>
                                </div>
                                <div className="h-4 w-16 bg-muted animate-pulse rounded"></div>
                            </div>
                        ))}
                    </div>
                )}
                {!loading && outages.length === 0 && (
                    <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center">
                        <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-4 opacity-50" />
                        <p className="font-semibold text-foreground text-lg mb-1">All clear</p>
                        <p className="text-sm">No recent outage reports for this area.</p>
                    </div>
                )}
                {!loading && outages.length > 0 && (
                    <ul className="divide-y divide-border">
                        {outages.map((o) => {
                            const isPower = o.type === OutageType.Power;
                            const Icon = isPower ? Zap : Droplets;
                            const badgeColor = isPower 
                                ? "bg-amber-100 text-amber-700" 
                                : "bg-blue-100 text-blue-700";
                            const label = isPower ? "Power" : "Water";
                            
                            return (
                                <li key={o.id} className="flex justify-between items-center p-5 hover:bg-muted/30 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", badgeColor)}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <span className="font-medium text-foreground">{label} outage</span>
                                    </div>
                                    <div className="flex items-center text-sm font-medium text-muted-foreground whitespace-nowrap">
                                        <Clock className="mr-2 h-4 w-4" />
                                        {formatTimeAgo(o.reportedAt)}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
}\);
