import { useState, useEffect } from "react";

interface HealthCheck {
  status: string;
  message?: string;
}

interface HealthResponse {
  status: string;
  service: string;
  version: string;
  timestamp: string;
  checks: {
    api: HealthCheck;
    postgres: HealthCheck;
    redis: HealthCheck;
  };
}

function isHealthCheck(data: unknown): data is HealthCheck {
  if (typeof data !== "object" || data === null) return false;
  const obj = data as Record<string, unknown>;
  if (typeof obj.status !== "string") return false;
  if (obj.message !== undefined && typeof obj.message !== "string") return false;
  return true;
}

function isHealthResponse(data: unknown): data is HealthResponse {
  if (typeof data !== "object" || data === null) return false;
  const obj = data as Record<string, unknown>;
  if (typeof obj.status !== "string") return false;
  if (typeof obj.service !== "string") return false;
  if (typeof obj.version !== "string") return false;
  if (typeof obj.timestamp !== "string") return false;
  if (typeof obj.checks !== "object" || obj.checks === null) return false;

  const checks = obj.checks as Record<string, unknown>;
  if (!isHealthCheck(checks.api)) return false;
  if (!isHealthCheck(checks.postgres)) return false;
  if (!isHealthCheck(checks.redis)) return false;

  return true;
}

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch("/api/health");
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const raw: unknown = await response.json();
        if (!isHealthResponse(raw)) {
          throw new Error("Invalid health response format");
        }
        setHealth(raw);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch health");
      } finally {
        setLoading(false);
      }
    };

    void fetchHealth();
    const interval = setInterval(() => {
      void fetchHealth();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ok":
        return "#22c55e";
      case "error":
        return "#ef4444";
      case "degraded":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case "ok":
        return "✅";
      case "error":
        return "❌";
      case "degraded":
        return "⚠️";
      default:
        return "❓";
    }
  };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
      <h1>drowl</h1>
      <p style={{ color: "#666", marginTop: "0.5rem" }}>
        DevRel ROI Visualization Platform
      </p>

      <div
        style={{
          marginTop: "2rem",
          padding: "1.5rem",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          backgroundColor: "#f9fafb",
        }}
      >
        <h2 style={{ marginTop: 0, fontSize: "1.25rem" }}>System Health</h2>

        {loading && <p>Loading health status...</p>}

        {error && (
          <div
            style={{
              padding: "1rem",
              backgroundColor: "#fee2e2",
              border: "1px solid #ef4444",
              borderRadius: "4px",
              color: "#991b1b",
            }}
          >
            <strong>Error:</strong> {error}
          </div>
        )}

        {health && (
          <div>
            <div
              style={{
                padding: "1rem",
                marginBottom: "1rem",
                backgroundColor: "#fff",
                border: `2px solid ${getStatusColor(health.status)}`,
                borderRadius: "4px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <strong>Overall Status:</strong>
                <span
                  style={{
                    color: getStatusColor(health.status),
                    fontWeight: "bold",
                  }}
                >
                  {getStatusEmoji(health.status)} {health.status.toUpperCase()}
                </span>
              </div>
            </div>

            <div style={{ display: "grid", gap: "0.75rem" }}>
              {Object.entries(health.checks).map(([key, check]) => (
                <div
                  key={key}
                  style={{
                    padding: "1rem",
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "4px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.25rem",
                    }}
                  >
                    <strong style={{ textTransform: "capitalize" }}>
                      {key}:
                    </strong>
                    <span style={{ color: getStatusColor(check.status) }}>
                      {getStatusEmoji(check.status)} {check.status}
                    </span>
                  </div>
                  {check.message && (
                    <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                      {check.message}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: "1rem",
                fontSize: "0.75rem",
                color: "#9ca3af",
              }}
            >
              Last updated: {new Date(health.timestamp).toLocaleString()}
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: "2rem", color: "#666", fontSize: "0.875rem" }}>
        <p>🚀 drowl UI v0.1.0</p>
        <p>⚛️ React + TypeScript + Vite</p>
      </div>
    </div>
  );
}

export default App;
