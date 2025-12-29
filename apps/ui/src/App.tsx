import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
      <h1>drowl</h1>
      <p>DevRel ROI Visualization Platform</p>

      <div style={{ marginTop: "2rem" }}>
        <button
          onClick={() => setCount((count) => count + 1)}
          style={{
            padding: "0.5rem 1rem",
            fontSize: "1rem",
            cursor: "pointer",
          }}
        >
          Count: {count}
        </button>
      </div>

      <div style={{ marginTop: "2rem", color: "#666" }}>
        <p>🚀 drowl UI is running</p>
        <p>📦 Version: 0.1.0</p>
        <p>⚛️ React + TypeScript + Vite</p>
      </div>
    </div>
  );
}

export default App;
