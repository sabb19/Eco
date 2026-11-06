// Eco Fidato: one photo + one request -> a short spoken answer in Italian.
// The Gemini key lives only here, as the Supabase secret GEMINI_API_KEY. Never in the app or on GitHub.
// Used only by Esplora (Leggi / Descrivi / Chiedi). Hazard detection never goes through here.
const MODEL = Deno.env.get("GEMINI_MODEL") ?? "gemini-flash-latest";
const ALLOWED = ["https://sabb19.github.io", "http://localhost:8765"];

const BASE = "Rispondi in italiano a una persona cieca che sta usando la fotocamera del telefono. " +
  "Frasi brevi e semplici, adatte alla sintesi vocale: niente elenchi puntati, niente markdown, niente emoji. " +
  "Di' solo quello che vedi davvero. Se non sei sicuro dillo con parole come 'forse' o 'sembra'. " +
  "Se l'immagine è buia, mossa o tagliata, dillo e suggerisci come inquadrare meglio (più vicino, più luce, più a sinistra).";
const PROMPTS: Record<string, string> = {
  read: "Leggi il testo visibile nell'immagine, parola per parola, nell'ordine in cui si legge. " +
    "Se ci sono molti testi, prima il più grande o importante. Se non c'è testo leggibile, dillo in una frase.",
  describe: "Descrivi la scena in 2 o 3 frasi: prima cosa c'è davanti e quanto è vicino, poi il resto. " +
    "Segnala subito eventuali ostacoli o pericoli.",
  ask: "Rispondi alla domanda dell'utente sull'immagine in 1 o 2 frasi. Domanda: ",
};

function cors(origin: string | null) {
  const o = origin && ALLOWED.includes(origin) ? origin : ALLOWED[0];
  return { "Access-Control-Allow-Origin": o, "Access-Control-Allow-Headers": "authorization, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS", "Vary": "Origin" };
}

Deno.serve(async (req) => {
  const h = cors(req.headers.get("origin"));
  if (req.method === "OPTIONS") return new Response("ok", { headers: h });
  const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...h, "Content-Type": "application/json" } });
  if (req.method !== "POST") return json({ error: "solo POST" }, 405);
  const key = Deno.env.get("GEMINI_API_KEY");
  if (!key) return json({ error: "chiave mancante sul server" }, 500);
  let body: { mode?: string; question?: string; image?: string };
  try { body = await req.json(); } catch { return json({ error: "richiesta non valida" }, 400); }
  const mode = body.mode ?? "describe";
  if (!PROMPTS[mode] || typeof body.image !== "string" || body.image.length > 2_500_000) return json({ error: "richiesta non valida" }, 400);
  const text = BASE + " " + PROMPTS[mode] + (mode === "ask" ? (body.question ?? "").slice(0, 300) : "");
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      contents: [{ parts: [{ inline_data: { mime_type: "image/jpeg", data: body.image } }, { text }] }],
      generationConfig: { maxOutputTokens: 400, temperature: 0.2 },
    }),
  });
  if (!r.ok) return json({ error: "AI non disponibile (" + r.status + ")" }, r.status === 429 ? 429 : 502);
  const j = await r.json();
  const out = (j?.candidates?.[0]?.content?.parts ?? []).map((p: { text?: string }) => p.text ?? "").join(" ").trim();
  return json({ text: out || "Non riesco a capire l'immagine. Prova a inquadrare di nuovo." });
});
