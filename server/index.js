import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

function buildPrompt(preferences, products) {
  return `
Available products:
${products.map(p => `${p.id}: ${p.title} ($${p.price}, tags: ${p.tags.join(", ")})`).join("\n")}

User preferences: ${preferences}

Return ONLY JSON:
{"recommendedIds":["p1","p3"], "explanation":"short reason"}
`;
}

app.post("/recommend", async (req, res) => {
  try {
    const { preferences, products } = req.body;
    const prompt = buildPrompt(preferences, products);

    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "Return only JSON." },
        { role: "user", content: prompt }
      ],
      max_tokens: 200,
      temperature: 0.2
    });

    let text = response.choices[0].message.content;

    let parsed = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
    }

    if (!parsed || !parsed.recommendedIds) {
      return res.json({
        recommendedIds: [],
        explanation: "Groq returned invalid JSON. Using fallback.",
      });
    }

    res.json(parsed);

  } catch (err) {
    console.error("SERVER ERROR:", err);
    return res.status(500).json({
      recommendedIds: [],
      explanation: "Server Error: " + err.message,
    });
  }
});

app.listen(3000, () => console.log("Groq Server ON → http://localhost:3000"));
