import GeoLocationComponent from "@/components/shared/geolocation";

export default async function Home() {
  return (
    <div className="h-view-container">
      <div className="max-w-container text-main-100">
        <GeoLocationComponent />
      </div>
    </div>
  );
}
