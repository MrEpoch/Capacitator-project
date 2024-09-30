"use client";
// import { App } from "@capacitor/app";
import { Dialog } from "@capacitor/dialog";
import { Geolocation, Position } from "@capacitor/geolocation";
import { createContext, useContext, useEffect, useRef, useState } from "react";

export type nativeContextType = {
  GPSenabled: boolean;
  loadedTimes: number;
  coordinates: Position | null;
};

const NativeContext = createContext({
  GPSenabled: false,
  loadedTimes: 0,
  coordinates: null,
} as nativeContextType);

export const useNative = () => {
  const context = useContext(NativeContext);
  if (context === undefined || context === null) {
    return {};
  }
  return context;
};

export default function NativeContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loadedTimes, setLoadedTimes] = useState<number>(0);
  const [watchRunned, setWatchRunned] = useState<number>(0);
  const [coordinates, setCoordinates] = useState<Position | null>(null);
  // no any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const codeStack = useRef<null | any>(null);
  const watchRef = useRef<string | null>(null);
  const GPSenabledRef = useRef<boolean>(false);

  async function validateGPS() {
    await checkIfGPSEnabled();
    if (GPSenabledRef.current) {
      codeStack.current = await startWatchingPosition();
    } else {
      codeStack.current = null;
      await GPSwarning();
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
        setWatchRunned((prev) => prev + 1);
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
    setLoadedTimes((prev) => prev + 1);
    if (position) {
      setCoordinates(position);
    }

    console.log("Position = ", position, "Error = ", err);
  }

  
  async function checkIfGPSEnabled() {
    try {
      await Geolocation.checkPermissions();
      GPSenabledRef.current = true;
    } catch {
      console.error("No GPS available");
      GPSenabledRef.current = false;
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
    <NativeContext.Provider value={{ GPSenabled: GPSenabledRef.current, loadedTimes, coordinates }}>
      <p>watch runned: {watchRunned}</p>
      <p>current watch: {watchRef.current}</p>
      {children}
    </NativeContext.Provider>
  );
}
