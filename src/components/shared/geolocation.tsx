"use client";
import { nativeContextType, useNative } from "@/contexts/NativeContext";
import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function GeoLocationComponent() {
  const { GPSenabled, coordinates } = useNative() as nativeContextType;
  const [isWindow, setIsWindow] = useState(false);

  useEffect(() => {
    setIsWindow(typeof window !== "undefined");
    console.log(coordinates?.coords.latitude);
    console.log(coordinates?.coords.longitude);
  }, [coordinates]);

  return (
    <div>
      {GPSenabled && coordinates && isWindow && (
        <MapContainer className="min-h-screen w-full" zoom={13} scrollWheelZoom={false} center={[coordinates?.coords.latitude, coordinates?.coords.longitude]}>
          <Marker position={[coordinates?.coords.latitude, coordinates?.coords.longitude]}>
    <Popup>
      A pretty CSS3 popup. <br /> Easily customizable.
    </Popup>
  </Marker>
        </MapContainer>
      )}
    </div>
  );
}
