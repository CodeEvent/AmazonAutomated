import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS applies its own corner rounding to apple-touch-icon, so this stays
// full-bleed (no pre-rounded corners) to avoid a double-rounded look.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ff385c",
        }}
      >
        <span style={{ fontSize: 104, fontWeight: 700, color: "#ffffff" }}>W</span>
      </div>
    ),
    { ...size },
  );
}
