'use client';
import React, { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { PhoneCall, Stethoscope, AlertTriangle, UploadCloud, MapPin, Image as ImageIcon, Bot, User, Shield, Eye } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { ScrollArea } from "@/components/ui/ScrollArea";

type ChatMessage = { role: "user" | "assistant"; content: string; };
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
Përgjigju gjithmonë me seksione të qarta dhe paragrafë të shkurtër:
1) PËRMBLEDHJE: Një paragraf i thjeshtë që përmbledh çfarë raporton pacienti.
2) SHENJA ALARMI: Lista me pika e shenjave të rrezikshme për 24–48 orët në vijim. Nëse ndonjë është i pranishëm tani, fillo me EMERGJENCË TANI dhe jep hapa të qartë.
3) SHKAQET MË TË MUNDSHME: Një listë e renditur (3–6) me nga një fjali arsyetimi bazuar në moshë, kohëzgjatje dhe kontekst.
4) ÇFARË TË BËSH TANI: Hapa praktikë në shtëpi (doza vetëm në intervale të përgjithshme OTC, pa udhëzime për barna me recetë). Përmend paralajmërime të përgjithshme/ndërveprime.
5) KUR/KU TË KËRKOSH NDIHMË: Zgjidh një: (a) Vetë-kujdes; (b) Vizitë jo-urgjente te mjeku/okulisti brenda 24–72h; (c) Urgjencë sot; (d) Emergjencë menjëherë. Jep arsyetimin.
6) PYETJE VIJUESE: 4–8 pyetje të shkurtra për ta ngushtuar diagnozën.
Ton i ngrohtë, njerëzor, pa frikësim. Mos përsërit njëjtat pika. Mos vendos diagnoza përfundimtare dhe mos jep udhëzime për barna me recetë.`, []);

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
    if (!resp.ok) {
      const msg = await resp.text();
      throw new Error(msg || "Gabim në shërbimin e mjekut");
    }
    return await resp.json();
  }

  const riskBadge = (r: RiskLevel | null) => {
    if (!r) return null;
    const map: Record<RiskLevel, { label: string; tone: string }> = {
      low: { label: "Rrezik i ulët", tone: "bg-emerald-100 text-emerald-700 border-emerald-200" },
      moderate: { label: "Rrezik i moderuar", tone: "bg-amber-100 text-amber-700 border-amber-200" },
      high: { label: "Rrezik i lartë", tone: "bg-orange-100 text-orange-700 border-orange-200" },
      emergency: { label: "Emergjencë", tone: "bg-red-100 text-red-700 border-red-200" },
    };
    const s = map[r];
    return <Badge className={s.tone + " font-medium"}>{s.label}</Badge>;
  };

  const onSubmit = async () => {
    if (!symptoms.trim()) return;
    setLoading(true);
    setMessages((m) => [...m, { role: "user", content: symptoms.trim() }]);
    try {
      const result = await callDoctorAI();
      setMessages((m) => [...m, { role: "assistant", content: result.reply }]);
      setRisk(result.risk);
    } catch (e: any) {
      setMessages((m) => [...m, { role: "assistant", content: "Më vjen keq — diçka shkoi keq. Provo përsëri." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selected].slice(0, 6));
  };
  const removeFile = (i: number) => setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const mapsHref = React.useMemo(() => {
    const specialtyHint = risk === "emergency" || risk === "high" ? "emergency" : "doctor";
    const q = `${specialtyHint} near ${location || "me"}`.trim();
    return `https://www.google.com/maps/search/${encodeURIComponent(q)}`;
  }, [risk, location]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
      <header className="sticky top-0 z-30 border-b bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <Stethoscope className="h-5 w-5"/>
            </div>
            <div>
              <div className="text-xl font-semibold">Doctor AI</div>
              <div className="text-xs text-slate-500">Triazhë simptomash & udhëzime</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href={`tel:${emergencyTel}`} className="hidden md:block">
              <Button variant="destructive" className="rounded-2xl"><PhoneCall className="mr-2 h-4 w-4"/> Emergjenca {emergencyTel}</Button>
            </a>
            {riskBadge(risk)}
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-2">
        <section>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg"><Shield className="h-5 w-5"/> Na trego çfarë ndjen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-slate-600">Mosha</label>
                  <Input inputMode="numeric" placeholder="p.sh. 32" value={age} onChange={(e) => setAge(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm text-slate-600">Gjinia (opsionale)</label>
                  <Input placeholder="femer / mashkull / tjetër" value={sex} onChange={(e) => setSex(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm text-slate-600">Kohëzgjatja</label>
                  <Input placeholder="p.sh. 2 ditë" value={duration} onChange={(e) => setDuration(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm text-slate-600">Temperatura/ethet</label>
                  <Input placeholder="p.sh. 38.2°C, ethe, asnjë" value={fever} onChange={(e) => setFever(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-600">Qyteti (për mjekë pranë jush)</label>
                <div className="flex gap-2">
                  <Input placeholder="p.sh. Tiranë" value={location} onChange={(e) => setLocation(e.target.value)} />
                  <a href={mapsHref} target="_blank" rel="noreferrer">
                    <Button variant="secondary" className="rounded-2xl"><MapPin className="mr-2 h-4 w-4"/> Gjej mjekë</Button>
                  </a>
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-600">Përshkruaj simptomat</label>
                <Textarea
                  placeholder="Dhimbje koke, sy të skuqur, të dridhura që nga mbrëmë. Më keq në dritë të fortë. Pa ndryshime në shikim."
                  className="min-h-[120px]"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm text-slate-600">Shto foto (sy, skuqje, etj.)</label>
                <div className="flex items-center gap-2">
                  <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={e => {
                    const selected = Array.from(e.target.files || []);
                    setFiles(prev => [...prev, ...selected].slice(0,6));
                  }} />
                  <Button type="button" variant="outline" className="rounded-2xl" onClick={() => fileInputRef.current?.click()}>
                    <UploadCloud className="mr-2 h-4 w-4"/> Ngarko (maks 6)
                  </Button>
                  <span className="text-xs text-slate-500">Fotot qëndrojnë në pajisjen tuaj derisa të dërgoni.</span>
                </div>
                {files.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {files.map((f, i) => (
                      <div key={i} className="relative overflow-hidden rounded-xl border">
                        <div className="flex h-24 items-center justify-center bg-slate-50 p-2 text-center text-xs">
                          <ImageIcon className="mr-1 h-4 w-4"/> {f.name}
                        </div>
                        <button className="absolute right-2 top-2 rounded-md bg-white/80 px-2 text-xs shadow" onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))}>Hiq</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button disabled={loading || !symptoms.trim()} onClick={onSubmit} className="rounded-2xl">
                  {loading ? "Po vlerësoj..." : "Vlerëso tani"}
                </Button>
                <a href={`tel:${emergencyTel}`}>
                  <Button variant="destructive" className="rounded-2xl"><AlertTriangle className="mr-2 h-4 w-4"/> Emergjenca {emergencyTel}</Button>
                </a>
              </div>

              <p className="text-xs leading-relaxed text-slate-500">
                Ky mjet jep udhëzime të përgjithshme triazhimi dhe nuk zëvendëson mjekun. Nëse shfaqen shenja alarmi, telefononi emergjencën.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="flex min-h-[560px] flex-col">
          <Card className="flex grow flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg"><Bot className="h-5 w-5"/> Biseda me Doctor AI</CardTitle>
            </CardHeader>
            <CardContent className="flex grow flex-col gap-4">
              <ScrollArea className="h-[520px] rounded-xl border p-3">
                <div className="space-y-4">
                  {messages.length === 0 && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border bg-slate-50 p-4 text-sm text-slate-600">
                      👉 Tregoni simptomat (kur nisën, çfarë i përkeqëson/përmirëson, nëse keni temperaturë, barna të provuara). Mund të shtoni foto të syve apo skuqjeve. Do t’ju kthej përmbledhje, shenja alarmi, shkaqe të mundshme, hapat e radhës dhe pyetje vijues.
                    </motion.div>
                  )}

                  {messages.map((m, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={`flex items-start gap-3 ${m.role === "assistant" ? "" : "flex-row-reverse"}`}>
                      <div className={`mt-1 rounded-full p-2 ${m.role === "assistant" ? "bg-slate-900 text-white" : "bg-slate-200"}`}>
                        {m.role === "assistant" ? <Bot className="h-4 w-4"/> : <User className="h-4 w-4"/>}
                      </div>
                      <div className={`max-w-[80%] whitespace-pre-wrap rounded-2xl border p-4 text-sm leading-relaxed ${m.role === "assistant" ? "bg-white" : "bg-slate-50"}`}>
                        {m.content}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>

              <div className="flex items-center gap-2">
                <Textarea placeholder="Përgjigjuni pyetjeve vijues këtu..." value={symptoms} onChange={(e) => setSymptoms(e.target.value)} />
                <Button disabled={loading || !symptoms.trim()} onClick={onSubmit} className="h-[62px] rounded-2xl px-6">Dërgo</Button>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <Eye className="h-3.5 w-3.5"/>
                Mos ndani emër të plotë, ID ose adresë. Fotot përdoren vetëm për vlerësimin tuaj.
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-4 pb-10 pt-2 text-xs text-slate-500">
        Ndërtuar me Next.js, Tailwind dhe GPT. Konfiguroni backend-in te <code>/api/doctor</code>.
      </footer>
    </div>
  );
}
