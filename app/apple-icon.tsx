import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

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
          background: "linear-gradient(145deg, #2a6f82 0%, #3a8fad 100%)",
          borderRadius: 40,
        }}
      >
        <svg width="108" height="108" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 10.5C4 10.5 7 7 12 7C17 7 20 10.5 20 10.5"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <path
            d="M7 16L7 9.5L12 15.5L17 9.5V16"
            stroke="white"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
