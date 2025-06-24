import { ImageResponse } from "next/og";

// Image metadata
export const alt = "LockIn - Focus & Productivity App";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8fafc",
          backgroundImage: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          fontSize: 32,
          fontWeight: 600,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderRadius: "24px",
            padding: "60px 80px",
            margin: "40px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            textAlign: "center",
          }}
        >
          {/* Logo/Brand */}
          <div
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: "#1e40af",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
            }}
          >
            🔒 LockIn
          </div>

          {/* Main Headline */}
          <div
            style={{
              fontSize: 36,
              fontWeight: 600,
              color: "#1f2937",
              marginBottom: "16px",
              lineHeight: 1.2,
            }}
          >
            AI-Powered Task Scheduling
          </div>

          {/* Subheadline */}
          <div
            style={{
              fontSize: 24,
              color: "#6b7280",
              marginBottom: "32px",
              lineHeight: 1.3,
            }}
          >
            Turn your to-do list into an organized calendar in seconds
          </div>

          {/* Features */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "40px",
              fontSize: 18,
              color: "#4b5563",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              📅 Smart Calendar
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              🤖 AI Scheduling
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              ⚡ Instant Setup
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
