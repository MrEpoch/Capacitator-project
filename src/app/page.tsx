"use client";
import dynamic from "next/dynamic";

const GeoMap = dynamic(() => import("@/components/shared/geolocation"), {
  ssr: false,
});

export default async function Home() {
  return (
    <div className="h-view-container">
      <div className="max-w-container text-main-100">
        <GeoMap />
      </div>
    </div>
  );
}
