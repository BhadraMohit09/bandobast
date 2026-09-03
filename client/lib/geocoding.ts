export interface ReverseGeocodeResult {
  suggestedName: string;
  suggestedPinCode: string;
}

export async function reverseGeocode(lat: number, lon: number): Promise<ReverseGeocodeResult> {
  // NOTE: Calling Nominatim directly from the browser is fine for this demo/local project. 
  // For production, this should be proxied through the backend with a proper User-Agent header 
  // to comply strictly with Nominatim's usage policy.
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=16&addressdetails=1`,
    { headers: { "Accept-Language": "en" } }
  );
  
  if (!res.ok) {
      throw new Error("Failed to reverse geocode");
  }

  const data = await res.json();
  const address = data.address || {};
  
  const suggestedName =
    address.residential ||
    address.suburb || 
    address.neighbourhood || 
    address.village || 
    address.town || 
    address.city_district || 
    address.city || 
    address.county ||
    address.state_district ||
    address.road ||
    "Unknown Area";
    
  const suggestedPinCode = address.postcode || "";
  
  return { suggestedName, suggestedPinCode };
}
