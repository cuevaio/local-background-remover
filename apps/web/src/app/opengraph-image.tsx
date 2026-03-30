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
          background:
            "linear-gradient(145deg, rgb(244, 252, 247) 0%, rgb(226, 242, 234) 55%, rgb(214, 235, 224) 100%)",
          padding: "56px",
          color: "rgb(24, 36, 32)",
          fontFamily: "Arial",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, fontWeight: 700, letterSpacing: "0.02em" }}>
          Local Background Remover
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 960 }}>
          <div style={{ display: "flex", fontSize: 72, lineHeight: 1.05, fontWeight: 800 }}>
            Offline background remover for private, on-device workflows.
          </div>
          <div style={{ display: "flex", fontSize: 34, lineHeight: 1.25, color: "rgb(44, 83, 68)" }}>
            App and CLI. Public downloads. License-gated runtime. Works offline after activation.
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
