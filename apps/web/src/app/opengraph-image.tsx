import { ImageResponse } from "next/og";

export const alt = "Local Background Remover";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#fafafa",
          backgroundImage:
            "linear-gradient(to right, rgba(229,229,229,0.7) 1px, transparent 1px), linear-gradient(to bottom, rgba(229,229,229,0.7) 1px, transparent 1px)",
          backgroundSize: "96px 96px",
          padding: "56px",
          color: "#171717",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div style={{
          display: "flex",
          width: "100%",
          alignItems: "center",
          justifyContent: "space-between",
          border: "1px solid #e5e5e5",
          borderRadius: 16,
          background: "rgba(255,255,255,0.92)",
          padding: "14px 20px",
          fontSize: 24,
          fontWeight: 600,
          letterSpacing: "0.02em",
        }}>
          <span>local.backgroundrm</span>
          <span style={{ color: "#525252", fontSize: 20 }}>App + CLI</span>
        </div>
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: 22,
          maxWidth: 980,
          border: "1px solid #e5e5e5",
          background: "rgba(255,255,255,0.92)",
          borderRadius: 22,
          padding: "34px",
        }}>
          <div style={{ display: "flex", fontSize: 68, lineHeight: 1.02, fontWeight: 600 }}>
            Clean backgrounds fast.
          </div>
          <div style={{ display: "flex", fontSize: 31, lineHeight: 1.25, color: "#525252" }}>
            Private processing, one-time pricing, and workflows built for creators.
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
