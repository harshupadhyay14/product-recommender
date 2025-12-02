import React, { useState } from "react";

export default function App() {
  const products = [
    { id: "p1", title: "Pixel 6a", price: 349, tags: ["android", "camera"] },
    { id: "p2", title: "iPhone SE 2022", price: 429, tags: ["ios", "compact"] },
    { id: "p3", title: "Samsung A54", price: 399, tags: ["android", "battery"] },
    { id: "p4", title: "OnePlus Nord 2", price: 449, tags: ["android", "performance"] },
    { id: "p5", title: "Moto G Power", price: 199, tags: ["android", "battery"] }
  ];

  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function getRecommendations() {
    setLoading(true);
    const res = await fetch("/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ preferences: input, products })
    });

    const data = await res.json();
    setResult(data);
    setLoading(false);
  }

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>AI Product Recommendation System</h1>

      <textarea
        rows="3"
        style={{ width: "100%", marginTop: 10 }}
        placeholder="Example: I want a phone under $400 with good battery"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <br /><br />
      <button
        onClick={getRecommendations}
        disabled={loading}
        style={{
          background: "blue", color: "white", padding: "10px 20px",
          borderRadius: 8, cursor: "pointer"
        }}
      >
        {loading ? "Getting recommendations..." : "Recommend"}
      </button>

      <h2 style={{ marginTop: 30 }}>Available Products</h2>
      <ul>
        {products.map(p => (
          <li key={p.id}>
            {p.title} — ${p.price} — Tags: {p.tags.join(", ")}
          </li>
        ))}
      </ul>

      {result && (
        <>
          <h2 style={{ marginTop: 30 }}>AI Recommendations</h2>
          <p><b>AI Explanation:</b> {result.explanation}</p>

          <ul>
            {result.recommendedIds.map(id => {
              const prod = products.find(p => p.id === id);
              return (
                <li key={id} style={{ color: "green" }}>
                  {prod?.title} — ${prod?.price}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
