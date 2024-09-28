"use client";
// import { App } from "@capacitor/app";
import { Dialog } from "@capacitor/dialog";
import { Geolocation, Position } from "@capacitor/geolocation";
import { createContext, useContext, useEffect, useState } from "react";

const NativeContext = createContext({
  GPSenabled: false,
  loadedTimes: 0,
});

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
  const [GPSenabled, setGPSenabled] = useState<boolean>(false);
  const [loadedTimes, setLoadedTimes] = useState<number>(0);
  const [currentWatch, setCurrentWatch] = useState<string | null>(null);
  const [readedTimes, setReadedTimes] = useState<number>(0);

  useEffect(() => {
    initialGPSHandler();

    return () => {
      if (typeof currentWatch === "string") {
        Geolocation.clearWatch({ id: currentWatch });
        setCurrentWatch(null);
      }
    };
  }, []);

  function initialGPSHandler(): void {
      (async () => {
        // It should be listening for changes
        await startWatchingPosition();
      })();
  }

  async function startWatchingPosition() {
    try {
      const watchId = await Geolocation.watchPosition(
        {
          timeout: 500,
        },
        WatchCallback,
      );

      if (watchId && currentWatch === null) {
        setCurrentWatch(watchId);
      } else if (watchId && typeof currentWatch === "string") {
        Geolocation.clearWatch({ id: currentWatch });
        setCurrentWatch(watchId);
      }
    } catch {
      await GPSwarning();
      setGPSenabled(false);
    }
  }

  type watchError = {
    message: string;
  };
  async function restartWatchingPosition() {
    // Clear existing watch
    if (typeof currentWatch === "string") {
      await Geolocation.clearWatch({ id: currentWatch });
      setCurrentWatch(null);
      startWatchingPosition();
    }
  }

  function WatchCallback(position: Position | null, err: watchError | null) {
    // If error is present
    if (err) {
      // If errors is because of denied access to GPS
      (async () => {
        setReadedTimes((prev) => prev + 1);
        try {
          await Geolocation.checkPermissions();
          setGPSenabled(true);
        } catch {
          await GPSwarning();
          setGPSenabled(false);
        }
        await restartWatchingPosition();
      })();
    } else {
      setGPSenabled(true);
    }
    setLoadedTimes((prev) => prev + 1);

    console.log(position, err);
    // setWatchLat(position?.coords.latitude);
    // setWatchLong(position?.coords.longitude);
  }

  // It throws error in case GPS is not enabled
  /*async function CheckAndLoadGPS() {
     try {
      await Geolocation.checkPermissions();
      setGPSenabled(true);
      return true;
    } catch {
      await GPSwarning();
      setGPSenabled(false);
    }
    return false;
    }*/

  // Will make native alert
  async function GPSwarning() {
    await Dialog.alert({
      title: "GPS not enabled",
      message: "Please enable GPS in settings and reload app",
    });
  }

  return (
    <NativeContext.Provider value={{ GPSenabled, loadedTimes }}>
      <p>readed times: {readedTimes}</p>
      {children}
    </NativeContext.Provider>
  );
}
