"use client";
import { useEffect, useRef, useState } from "react";
import { GeoJSON, MapContainer, TileLayer, useMapEvent } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css"; // Re-uses images from ~leaflet package

import testJSON from "./test.json";
import { Geolocation, Position } from "@capacitor/geolocation";
import { Dialog } from "@capacitor/dialog";
import TreeModal from "./TreeModal";

function AnimatedPanningElement() {
  const map = useMapEvent("click", (e: unknown) => {
    map.setView(e.latlng, map.getZoom(), {
      animate: true,
    });
  });
  return null;
}

// currentRequest = current one request, with geojson data, photos and more
// It should represent one instance for dendrologic mapping

export default function GeoLocationComponent() {
  const [coordinates, setCoordinates] = useState<Position | null>(null);
  // no any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const codeStack = useRef<null | any>(null);
  const watchRef = useRef<string | null>(null);
  const GPSenabledRef = useRef<boolean>(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [modalData, setModalData] = useState<any>(null);

  async function validateGPS() {
    const status = await checkIfGPSEnabled();
    if (status === false) {
      codeStack.current = null;
      await GPSwarning();
      GPSenabledRef.current = status;
    } else if (status === true && status !== GPSenabledRef.current) {
      codeStack.current = null;
      if (watchRef.current) {
        Geolocation.clearWatch({ id: watchRef.current });
        watchRef.current = null;
      }
      codeStack.current = await startWatchingPosition();
      GPSenabledRef.current = status;
    }
  }

  useEffect(() => {
    const interval = setInterval(validateGPS, 5000);

    return () => {
      if (typeof watchRef.current === "string") {
        Geolocation.clearWatch({ id: watchRef.current ?? "" });
        watchRef.current = null;
      }
      codeStack.current = null;

      clearInterval(interval);
    };
  }, []);

  async function startWatchingPosition() {
    try {
      if (watchRef.current === null) {
        const watchId = await Geolocation.watchPosition(
          {
            timeout: 500,
            enableHighAccuracy: true,
          },
          WatchCallback,
        );

        watchRef.current = watchId;
      } else {
        await Geolocation.clearWatch({ id: watchRef.current });
        watchRef.current = null;
      }
    } catch {
      console.error("Yep, it happened in startWatchingPosition");
      await GPSwarning();
      GPSenabledRef.current = false;
    }
  }

  type watchError = {
    error: string;
  };

  function WatchCallback(position: Position | null, err: watchError | null) {
    // If error is present
    if (position) {
      setCoordinates(position);
    }

    console.log("Position = ", position, "Error = ", err);
  }

  async function checkIfGPSEnabled() {
    try {
      await Geolocation.checkPermissions();
      return true;
    } catch {
      console.error("No GPS available");
      return false;
    }
  }

  // Will make native alert
  async function GPSwarning() {
    await Dialog.alert({
      title: "GPS not enabled",
      message: "Please enable GPS in settings and reload app",
    });
  }

  return (
    <div>
      <TreeModal modalData={modalData}>
        <button ref={btnRef} />
      </TreeModal>
      {GPSenabledRef.current &&
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
            <GeoJSON
              eventHandlers={{
                onEachFeature: (feature: unknown, layer: unknown) => {
                  layer.on("click", () => {
                    setModalData(feature?.properties);
                    btnRef.current?.click();
                  });
                },
              }}
              data={testJSON}
            />
          </MapContainer>
        )}
    </div>
  );
}
