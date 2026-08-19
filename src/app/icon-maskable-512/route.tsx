import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

// Maskable icons are cropped into arbitrary shapes by the OS, so the
// background must be full-bleed (no pre-rounded corners) and the glyph
// must stay inside the ~80%-diameter safe zone.
export function GET() {
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
        <span style={{ fontSize: 220, fontWeight: 700, color: "#ffffff" }}>W</span>
      </div>
    ),
    { ...size },
  );
}
