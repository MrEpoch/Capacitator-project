"use client";
// import { App } from "@capacitor/app";
import { Dialog } from "@capacitor/dialog";
import { Geolocation, Position } from "@capacitor/geolocation";
import { createContext, useContext, useEffect, useRef, useState } from "react";

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
  const [readedTimes, setReadedTimes] = useState<number>(0);
  const [watchRunned, setWatchRunned] = useState<number>(0);
  // no any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const codeStack = useRef<null | any>(null);
  const watchRef = useRef<string | null>(null);
  const restartPromiseRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    if (codeStack.current === null) {
      codeStack.current = initialGPSHandler();
    }
    return () => {
      if (typeof watchRef.current === "string") {
        Geolocation.clearWatch({ id: watchRef.current ?? "" });
        watchRef.current = null;
      }
      codeStack.current = null;
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
        await startWatchingPosition();
      }
    } catch {
      console.error("Yep, it happened in startWatchingPosition");
      await GPSwarning();
      setGPSenabled(false);
      await restartWatchingPosition();
    }
  }

  type watchError = {
    error: string;
  };
  async function restartWatchingPosition() {
    if (restartPromiseRef.current) return;
    
    restartPromiseRef.current = new Promise((resolve) => setTimeout(resolve, 5000))
    .then(() => {
      restartPromiseRef.current = null;
      if (watchRef.current !== null) {
        Geolocation.clearWatch({ id: watchRef.current });
        watchRef.current = null;
      }
      return startWatchingPosition();
    });
  }

  function WatchCallback(position: Position | null, err: watchError | null) {
    // If error is present
    if (err) {
      // If errors is because of denied access to GPS
        setReadedTimes((prev) => prev + 1);
        console.error("warning happened in WatchCallback", watchRef.current);
        setGPSenabled(false);
        (async() => await restartWatchingPosition())();
    } else {
      setGPSenabled(true);
    }
    setLoadedTimes((prev) => prev + 1);

    console.log("Position = ", position, "Error = ", err);
  }

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
      <p>watch runned: {watchRunned}</p>
      <p>current watch: {watchRef.current}</p>
      {children}
    </NativeContext.Provider>
  );
}
