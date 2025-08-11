'use client';
import React, { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { PhoneCall, Stethoscope, AlertTriangle, UploadCloud, MapPin, Image as ImageIcon, Bot, User, Shield, Eye, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { ScrollArea } from "@/components/ui/ScrollArea";

type ChatMessage = { role: "user" | "assistant"; content: string };
type RiskLevel = "low" | "moderate" | "high" | "emergency";

export default function DoctorAIApp() {
  const [symptoms, setSymptoms] = useState("");
  const [duration, setDuration] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("");
  const [fever, setFever] = useState("");
  const [location, setLocation] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [risk, setRisk] = useState<RiskLevel | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emergencyTel = process.env.NEXT_PUBLIC_EMERGENCY_TEL || "112";

  const promptSystem = useMemo(() => `Je Doctor AI, një mjek triazhues i kujdesshëm, i përmbledhur dhe miqësor.
Përgjigju me seksione të qarta: 1) PËRMBLEDHJE 2) SHENJA ALARMI 3) SHKAQET MË TË MUNDSHME 4) ÇFARË TË BËSH TANI 5) KUR/KU TË KËRKOSH NDIHMË 6) PYETJE VIJUESE.
Mos jep diagnoza përfundimtare dhe mos udhëzo barna me recetë.`, []);

  const guessMime = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.endsWith(".png")) return "image/png";
    if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
    if (lower.endsWith(".webp")) return "image/webp";
    return "application/octet-stream";
  };

  const buildUserPrompt = async () => {
    const b64Images: {name: string; data: string}[] = [];
    for (const f of files) {
      const buf = await f.arrayBuffer();
      const b64 = Buffer.from(buf).toString("base64");
      b64Images.push({ name: f.name, data: b64 });
    }
    const meta = {
      age: age || "panjohur",
      sex: sex || "paspecifikuar",
      duration: duration || "paspecifikuar",
      fever: fever || "panjohur",
      location: location || "paspecifikuar",
      images_attached: b64Images.map(i => ({ name: i.name, mime: guessMime(i.name) })),
    };
    return `KONTEKSTI I PACIENTIT\n${JSON.stringify(meta, null, 2)}\n\nRAPORTIMI I PACIENTIT\n${symptoms.trim()}`;
  };

  async function callDoctorAI(): Promise<{ reply: string; risk: RiskLevel; specialty?: string }> {
    const userPrompt = await buildUserPrompt();
    const resp = await fetch("/api/doctor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ system: promptSystem, user: userPrompt }),
    });
    if (!resp.ok) throw new Error(await resp.text() || "Gabim");
    return await resp.json();
  }

  const riskBadge = (r: RiskLevel | null) => {
    if (!r) return null;
    const map: Record<RiskLevel, { label: string; tone: string }> = {
      low:       { label: "Rrezik i ulët",     tone: "bg-teal-50 text-teal-700 border-teal-200" },
      moderate:  { label: "Rrezik i moderuar", tone: "bg-amber-50 text-amber-700 border-amber-200" },
      high:      { label: "Rrezik i lartë",    tone: "bg-orange-50 text-orange-700 border-orange-200" },
      emergency: { label: "Emergjencë",        tone: "bg-rose-50 text-rose-700 border-rose-200" },
    };
    const s = map[r];
    return <Badge className={`${s.tone} font-medium`}>{s.label}</Badge>;
  };

  const onSubmit = async () => {
    if (!symptoms.trim()) return;
    setLoading(true);
    setMessages(m => [...m, { role: "user", content: symptoms.trim() }]);
    try {
      const result = await callDoctorAI();
      setMessages(m => [...m, { role: "assistant", content: result.reply }]);
      setRisk(result.risk);
      setSymptoms("");
    } catch {
      setMessages(m => [...m, { role: "assistant", content: "Më vjen keq — diçka shkoi keq. Provo përsëri." }]);
    } finally {
      setLoading(false);
    }
  };

  const mapsHref = React.useMemo(() => {
    const specialtyHint = risk === "emergency" || risk === "high" ? "emergency" : "doctor";
    const q = `${specialtyHint} near ${location || "me"}`.trim();
    return `https://www.google.com/maps/search/${encodeURIComponent(q)}`;
  }, [risk, location]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/70 bg-white/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-sm">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xl font-semibold tracking-tight">Doctor AI</div>
              <div className="text-xs text-slate-500">Triage modern klinik</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href={`tel:${emergencyTel}`} className="hidden md:block">
              <Button variant="destructive" className="rounded-3xl animate-[pulse_2s_ease-in-out_infinite]">
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-white/90" />
                Emergjenca {emergencyTel}
              </Button>
            </a>
            {riskBadge(risk)}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-8 md:grid-cols-[380px_1fr]">
        {/* Left column: compact form */}
        <section>
          <Card className="rounded-3xl border-white/60 bg-white/70 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-5 w-5 text-teal-600" />
                Të dhënat & Simptomat
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-slate-600">Mosha</label>
                  <Input inputMode="numeric" placeholder="p.sh. 32" value={age} onChange={e => setAge(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-600">Gjinia</label>
                  <Input placeholder="femer / mashkull / tjetër" value={sex} onChange={e => setSex(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-600">Kohëzgjatja</label>
                  <Input placeholder="p.sh. 2 ditë" value={duration} onChange={e => setDuration(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-600">Temperatura/Ethet</label>
                  <Input placeholder="p.sh. 38.2°C, ethe, asnjë" value={fever} onChange={e => setFever(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs text-slate-600">Qyteti (për mjekë pranë jush)</label>
                <div className="flex gap-2">
                  <Input placeholder="p.sh. Tiranë" value={location} onChange={e => setLocation(e.target.value)} />
                  <a href={mapsHref} target="_blank" rel="noreferrer">
                    <Button variant="secondary" className="rounded-3xl">
                      <MapPin className="mr-2 h-4 w-4" /> Gjej mjekë
                    </Button>
                  </a>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs text-slate-600">Përshkruaj simptomat</label>
                <Textarea
                  placeholder="Dhimbje koke, sy të skuqur, të dridhura që nga mbrëmë..."
                  className="min-h-[120px]"
                  value={symptoms}
                  onChange={e => setSymptoms(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-slate-600">Shto foto (sy, skuqje, etj.)</label>
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      const selected = Array.from(e.target.files ||
