// Minimal Gemini client shared by server features (blog summaries, etc.).
// Uses the free-tier key in GEMINI_API_KEY; callers must fail soft when it
// is missing or the model is busy.

const MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';

export const geminiEnabled = () => !!process.env.GEMINI_API_KEY;

export async function geminiGenerate({
  system,
  prompt,
  maxOutputTokens = 600,
  temperature = 0.3,
  json = false,
}: {
  system?: string;
  prompt: string;
  maxOutputTokens?: number;
  temperature?: number;
  json?: boolean;
}): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY is not set');
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({
      ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature,
        maxOutputTokens,
        thinkingConfig: { thinkingLevel: 'minimal' },
        ...(json ? { responseMimeType: 'application/json' } : {}),
      },
    }),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text().catch(() => '')).slice(0, 200)}`);
  const data = await res.json();
  const text: string =
    data?.candidates?.[0]?.content?.parts
      ?.filter((p: { text?: string; thought?: boolean }) => !p.thought)
      .map((p: { text?: string }) => p.text ?? '')
      .join('')
      .trim() || '';
  if (!text) throw new Error('Gemini returned no text');
  return text;
}
