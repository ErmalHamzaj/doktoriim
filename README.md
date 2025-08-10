# Doctor AI — Triazhë simptomash (Next.js, Shqip)

Asistent triazhimi që përmbledh simptomat, thekson shenjat e rrezikut, liston shkaqet e mundshme dhe jep hapat e radhës — pa u përsëritur.

## Nisja e shpejtë

```bash
npm i   # ose pnpm/yarn
npm run dev
```
Hapni http://localhost:3000

## Konfigurimi

Krijo `.env.local`:

```
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-5-think
NEXT_PUBLIC_EMERGENCY_TEL=112
```

## Deploy

- **Vercel**: dërgo kodin në repo, vendos `OPENAI_API_KEY` si env var, Deploy.
- **Docker**:
  ```bash
  docker build -t doctor-ai-sq .
  docker run -p 3000:3000 -e OPENAI_API_KEY=sk-... -e NEXT_PUBLIC_EMERGENCY_TEL=112 doctor-ai-sq
  ```

## Shënime

- Ngarkimi i fotove përfshihet në prompt si base64; për vizion të vërtetë mund të kaloni te inputi i imazhit në API.
- Zëvendësoni heuristikën e thjeshtë të rrezikut me një tool/function që kthen JSON `{ risk, specialty, reply }` nëse dëshironi.
- Ky nuk është pajisje mjekësore dhe nuk zëvendëson mjekun.
- 
