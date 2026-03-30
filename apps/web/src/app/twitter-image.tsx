import { ImageResponse } from "next/og";

export const alt = "Local Background Remover";
export const size = {
  width: 1200,
  height: 600,
};
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          backgroundColor: "#fafafa",
          backgroundImage:
            "linear-gradient(to right, rgba(229,229,229,0.7) 1px, transparent 1px), linear-gradient(to bottom, rgba(229,229,229,0.7) 1px, transparent 1px)",
          backgroundSize: "96px 96px",
          padding: "48px",
          color: "#171717",
          fontFamily: "Inter, sans-serif",
          gap: "18px",
        }}
      >
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          maxWidth: 960,
          border: "1px solid #e5e5e5",
          background: "rgba(255,255,255,0.92)",
          borderRadius: 20,
          padding: "30px",
        }}>
          <div style={{ display: "flex", fontSize: 54, lineHeight: 1.08, fontWeight: 600 }}>
            Offline background remover
          </div>
          <div style={{ display: "flex", fontSize: 30, lineHeight: 1.25, color: "#525252" }}>
            Private local processing with App and CLI workflows.
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
