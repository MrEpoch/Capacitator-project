"use client";
import { nativeContextType, useNative } from "@/contexts/NativeContext";
import { useEffect, useState } from "react";
import { GeoJSON, MapContainer, TileLayer, useMapEvent } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css"; // Re-uses images from ~leaflet package

import testJSON from "./test.json";

function AnimatedPanningElement() {
  const map = useMapEvent("click", (e) => {
    map.setView(e.latlng, map.getZoom(), {
      animate: true,
    });
  });
  return null;
}

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
      {GPSenabled &&
        isWindow &&
        typeof coordinates?.coords.latitude === "number" && (
          <MapContainer
            className="min-h-screen w-full"
            zoom={13}
            scrollWheelZoom={false}
            center={[
              coordinates?.coords.latitude,
              coordinates?.coords.longitude,
            ]}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <AnimatedPanningElement />
            <GeoJSON data={testJSON} />
          </MapContainer>
        )}
    </div>
  );
}
