"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// کامپوننت برای زوم روی محدوده GeoJSON
function FitBoundary({ geojsonData }) {
  const map = useMap();

  useEffect(() => {
    if (geojsonData?.features?.length > 0) {
      const bounds = L.geoJSON(geojsonData).getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [20, 20] });
      } else {
        map.setView([46.42, -63.68], 12);
      }
    }
  }, [geojsonData, map]);

  return null;
}

export default function MapWithTableLimited() {
  const [geojsonData, setGeojsonData] = useState(null);

  // بارگذاری GeoJSON
  useEffect(() => {
    fetch("/data/PEI_Test.geojson")
      .then((res) => res.json())
      .then((data) => setGeojsonData(data))
      .catch((err) => console.error("Error loading GeoJSON:", err));
  }, []);

  // آرایه رنگ ثابت برای FIELDID
  const colors = [
    "#1f78b4", "#33a02c", "#e31a1c", "#ff7f00",
    "#6a3d9a", "#b15928", "#a6cee3", "#fb9a99",
    "#fdbf6f", "#cab2d6"
  ];

  const getFeatureColor = (feature) => {
    const id = feature?.properties?.FIELDID;
    if (id !== undefined && id !== null) {
      return colors[id % colors.length];
    }
    return "#3b82f6";
  };

  const onEachFeature = (feature, layer) => {
    if (feature?.properties?.FIELDID !== undefined) {
      layer.bindPopup(`<b>FIELDID:</b> ${feature.properties.FIELDID}`);
    }
  };

  // داده‌های جدول: فقط ستون‌های FIELDID, Land Use, HECTARRES
  const tableData = geojsonData?.features?.map((f) => ({
    fieldName: f.properties.FIELDID,
    landUse: f.properties["Land Use"],
    area: f.properties.HECTARRES
  })) || [];

  return (
    <div style={{ display: "flex", gap: "20px" }}>
      {/* بخش نقشه */}
      <div style={{ flex: 2, height: "600px" }}>
        <MapContainer
          center={[46.42, -63.68]}
          zoom={12}
          style={{ width: "100%", height: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {geojsonData && (
            <>
              <GeoJSON
                data={geojsonData}
                style={(feature) => ({
                  color: "#000",
                  weight: 1,
                  fillColor: getFeatureColor(feature),
                  fillOpacity: 0.6
                })}
                onEachFeature={onEachFeature}
              />
              <FitBoundary geojsonData={geojsonData} />
            </>
          )}
        </MapContainer>
      </div>

      {/* بخش جدول */}
      <div style={{ flex: 1 }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left"
          }}
        >
          <thead>
            <tr>
              <th style={{ border: "1px solid #000", padding: "8px" }}>
                Field Name
              </th>
              <th style={{ border: "1px solid #000", padding: "8px" }}>
                Land Use
              </th>
              <th style={{ border: "1px solid #000", padding: "8px" }}>
                Area (ha)
              </th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr key={index}>
                <td style={{ border: "1px solid #000", padding: "8px" }}>
                  {row.fieldName}
                </td>
                <td style={{ border: "1px solid #000", padding: "8px" }}>
                  {row.landUse}
                </td>
                <td style={{ border: "1px solid #000", padding: "8px" }}>
                  {row.area}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
