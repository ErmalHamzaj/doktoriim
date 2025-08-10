import { NextRequest } from "next/server";
import { z } from "zod";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({ system: z.string().min(10), user: z.string().min(5) });

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const { system, user } = Body.parse(json);
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-5-think",
      temperature: 0.3,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });
    const text = completion.choices[0]?.message?.content || "Më vjen keq, nuk munda të gjeneroj përgjigje.";
    const lowered = text.toLowerCase();
    const risk = lowered.includes("emergjencë tani") || lowered.includes("humbje shikimi") || lowered.includes("qafë e shtangur") ? "high" : "moderate";
    return new Response(JSON.stringify({ reply: text, risk }), { headers: { "Content-Type": "application/json" } });
  } catch (err: any) {
    const msg = err?.message || "Kërkesë e pavlefshme";
    return new Response(msg, { status: 400 });
  }
}
