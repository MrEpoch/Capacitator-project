"use client";
import { nativeContextType, useNative } from "@/contexts/NativeContext";
import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
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
      {GPSenabled && isWindow && (typeof coordinates?.coords.latitude === "number") && (
        <MapContainer
          className="min-h-screen w-full"
          zoom={13}
          scrollWheelZoom={false}
          center={[coordinates?.coords.latitude, coordinates?.coords.longitude]}
        >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
          <Marker
            position={[
              coordinates?.coords.latitude,
              coordinates?.coords.longitude
            ]}
          >
            <Popup>
              A pretty CSS3 popup. <br /> Easily customizable.
            </Popup>
          </Marker>
        </MapContainer>
      )}
    </div>
  );
}
