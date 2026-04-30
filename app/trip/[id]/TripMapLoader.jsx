"use client";
import dynamic from "next/dynamic";

const TripMap = dynamic(() => import("./TripMap.jsx"), {
  ssr: false,
  loading: () => (
    <div
      className="bg-light border rounded d-flex align-items-center justify-content-center text-muted mb-3"
      style={{ height: 420 }}
    >
      <i className="bi bi-map fs-1"></i>
    </div>
  ),
});

export default function TripMapLoader(props) {
  return <TripMap {...props} />;
}
