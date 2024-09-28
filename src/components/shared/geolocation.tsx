"use client";
import { useNative } from "@/contexts/NativeContext";

export default function GeoLocationComponent() {
  const { GPSenabled, loadedTimes } = useNative() as {
    GPSenabled: boolean;
    loadedTimes: number;
  };

  return (
    <div>
      <p>Loaded times: {loadedTimes}</p>
      {GPSenabled ? (
        <>
          <p>GPS enabled</p>
        </>
      ) : (
        <p>GPS not enabled</p>
      )}
    </div>
  );
}
