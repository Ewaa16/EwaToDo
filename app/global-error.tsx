"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error(error);

  return (
    <html lang="id">
      <body style={{ margin: 0, background: "#f1f5f9", color: "#0f172a" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            textAlign: "center",
            fontFamily: "sans-serif",
          }}
        >
          <p style={{ fontSize: "3rem", margin: 0 }}>😅</p>
          <h1 style={{ fontSize: "1.5rem", margin: "1rem 0 0.5rem" }}>
            Terjadi kesalahan
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
            Ada yang tidak beres. Coba lagi, ya.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              padding: "0.625rem 1.25rem",
              borderRadius: "0.5rem",
              border: "none",
              background: "#4f46e5",
              color: "#fff",
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Coba Lagi
          </button>
        </div>
      </body>
    </html>
  );
}
