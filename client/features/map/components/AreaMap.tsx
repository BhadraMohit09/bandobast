"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Area } from "@/features/areas/types";
import { getAreas } from "@/features/areas/api";
import Link from "next/link";
import { MapPin } from "lucide-react";

export default function AreaMap() {
    const [areas, setAreas] = useState<Area[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAreas()
            .then(res => setAreas(res.items))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="w-full h-[400px] md:h-[500px] bg-[#EBEBE3] border-y border-[#D8D8D1] animate-pulse flex items-center justify-center">
                <span className="font-mono text-xs uppercase tracking-widest text-[#7A817D]">Loading Map...</span>
            </div>
        );
    }

    // Center on average of all areas, or fallback to central Gujarat
    const defaultCenter: [number, number] = [22.2587, 71.1924];
    
    let center = defaultCenter;
    if (areas.length > 0) {
        const avgLat = areas.reduce((sum, a) => sum + a.latitude, 0) / areas.length;
        const avgLng = areas.reduce((sum, a) => sum + a.longitude, 0) / areas.length;
        center = [avgLat, avgLng];
    }

    return (
        <div className="w-full h-[400px] md:h-[500px] border-y border-[#D8D8D1] relative z-0 mb-16">
            <MapContainer 
                center={center} 
                zoom={7} 
                scrollWheelZoom={false}
                className="w-full h-full z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {areas.map((area) => {
                    const count = area.recentOutageCount || 0;
                    
                    let color = "#7A817D"; // Gray (0)
                    let radius = 6;
                    
                    if (count > 0 && count <= 3) {
                        color = "#B7791F"; // Amber (1-3)
                        radius = 8;
                    } else if (count > 3) {
                        color = "#B34435"; // Red (4+)
                        radius = 12;
                    }

                    return (
                        <CircleMarker
                            key={area.id}
                            center={[area.latitude, area.longitude]}
                            pathOptions={{ 
                                color: color, 
                                fillColor: color, 
                                fillOpacity: 0.7,
                                weight: 2
                            }}
                            radius={radius}
                        >
                            <Popup className="font-sans">
                                <div className="p-1">
                                    <h3 className="font-serif font-medium text-lg text-[#10201B] mb-1">{area.name}</h3>
                                    <p className="font-mono text-[10px] uppercase tracking-widest text-[#5E6B68] mb-3">PIN {area.pinCode}</p>
                                    
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: color }}></div>
                                        <span className="text-sm text-[#10201B]">
                                            {count} recent report{count !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    
                                    <Link 
                                        href={`/areas/${area.id}`}
                                        className="inline-flex items-center text-xs font-medium text-[#10201B] hover:underline"
                                    >
                                        <MapPin className="mr-1 h-3 w-3" /> View details
                                    </Link>
                                </div>
                            </Popup>
                        </CircleMarker>
                    );
                })}
            </MapContainer>
        </div>
    );
}
