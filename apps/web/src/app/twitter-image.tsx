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
          background:
            "linear-gradient(160deg, rgb(246, 252, 248) 0%, rgb(232, 245, 238) 60%, rgb(218, 237, 227) 100%)",
          padding: "48px",
          color: "rgb(24, 36, 32)",
          fontFamily: "Arial",
          gap: "18px",
        }}
      >
        <div style={{ display: "flex", fontSize: 56, lineHeight: 1.1, fontWeight: 800 }}>
          Offline background remover
        </div>
        <div style={{ display: "flex", fontSize: 30, lineHeight: 1.25, color: "rgb(44, 83, 68)" }}>
          Private local processing with App and CLI workflows.
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
