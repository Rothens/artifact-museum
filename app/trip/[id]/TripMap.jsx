"use client";
import { useEffect, useRef, useState } from "react";

export default function TripMap({ items, labels }) {
  const mapElRef = useRef(null);
  const leafletRef = useRef(null); // { map, markers, L }
  const intervalRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [idx, setIdx] = useState(0);

  const itemsWithCoords = items.filter((i) => i.location_lat);

  useEffect(() => {
    if (!mapElRef.current || itemsWithCoords.length === 0) return;
    if (leafletRef.current) return; // already initialized

    // Inject Leaflet CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    import("leaflet").then((L) => {
      // Fix webpack mangling of default icon paths
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const coords = itemsWithCoords.map((i) => [i.location_lat, i.location_lng]);

      const map = L.map(mapElRef.current).fitBounds(coords, { padding: [32, 32] });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",
        maxZoom: 19,
      }).addTo(map);

      // Faint dashed polyline connecting markers chronologically
      if (coords.length > 1) {
        L.polyline(coords, { color: "#6c757d", weight: 2, opacity: 0.5, dashArray: "5 7" }).addTo(map);
      }

      const defaultIcon = L.icon({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      const activeIcon = L.divIcon({
        html: '<div style="width:18px;height:18px;background:#0d6efd;border:2.5px solid white;border-radius:50%;box-shadow:0 0 6px rgba(0,0,0,.45)"></div>',
        className: "",
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      const markers = itemsWithCoords.map((item, i) => {
        const thumb = item.photo_data_url
          ? `<img src="${item.photo_data_url}" style="width:90px;height:68px;object-fit:cover;border-radius:4px;margin-top:6px;display:block"/>`
          : "";
        const date = item.collected_at
          ? `<div style="font-size:0.75rem;color:#6c757d;margin-top:2px">${new Date(item.collected_at).toLocaleDateString()}</div>`
          : "";
        const popup = `<a href="/item/${item.id}" style="font-weight:600;text-decoration:none">${item.label || item.code_name || "Item"}</a>${date}${thumb}`;

        return L.marker([item.location_lat, item.location_lng], {
          icon: i === 0 ? activeIcon : defaultIcon,
        })
          .addTo(map)
          .bindPopup(popup, { maxWidth: 160 });
      });

      if (markers[0]) markers[0].openPopup();

      leafletRef.current = { map, markers, L, defaultIcon, activeIcon };
    });

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function jumpTo(newIdx) {
    const { map, markers, defaultIcon, activeIcon } = leafletRef.current ?? {};
    if (!markers) return;
    markers.forEach((m, i) => {
      m.setIcon(i === newIdx ? activeIcon : defaultIcon);
      m.setZIndexOffset(i === newIdx ? 1000 : 0);
    });
    const item = itemsWithCoords[newIdx];
    map.panTo([item.location_lat, item.location_lng], { animate: true, duration: 0.35 });
    markers[newIdx].openPopup();
    setIdx(newIdx);
  }

  function handleScrub(e) {
    const newIdx = Number(e.target.value);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setPlaying(false);
    }
    jumpTo(newIdx);
  }

  function togglePlay() {
    if (playing) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setPlaying(false);
      return;
    }
    setPlaying(true);
    let cur = idx;
    intervalRef.current = setInterval(() => {
      cur = cur + 1 >= itemsWithCoords.length ? 0 : cur + 1;
      jumpTo(cur);
      if (cur === itemsWithCoords.length - 1) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setPlaying(false);
      }
    }, 900);
  }

  if (itemsWithCoords.length === 0) return null;

  const currentItem = itemsWithCoords[idx];

  return (
    <div>
      <div
        ref={mapElRef}
        style={{ height: 420, borderRadius: 8, overflow: "hidden" }}
        className="border shadow-sm mb-3"
      />

      {/* Timeline scrubber */}
      <div className="d-flex align-items-center gap-3">
        <button
          type="button"
          className="btn btn-sm btn-outline-primary flex-shrink-0"
          onClick={togglePlay}
          aria-label={playing ? labels.pause : labels.play}
        >
          <i className={`bi ${playing ? "bi-pause-fill" : "bi-play-fill"}`}></i>
          <span className="ms-1 d-none d-sm-inline">{playing ? labels.pause : labels.play}</span>
        </button>

        <input
          type="range"
          className="form-range flex-grow-1"
          min={0}
          max={itemsWithCoords.length - 1}
          value={idx}
          onChange={handleScrub}
        />
      </div>

      <div className="text-muted small text-center mt-1">
        {idx + 1} / {itemsWithCoords.length}
        {currentItem && (
          <>
            {" — "}
            <span className="fw-semibold">{currentItem.label || currentItem.code_name}</span>
            {currentItem.collected_at && (
              <> &middot; {new Date(currentItem.collected_at).toLocaleDateString()}</>
            )}
          </>
        )}
      </div>
    </div>
  );
}
