import DoctorAIApp from "@/components/DoctorAIApp";

export default function Page() {
  return (
    <div>
      {/* CANARY: if you can see this text on the site, the new build is live */}
      <div className="sticky top-0 z-50 w-full bg-emerald-600/90 text-white text-center text-xs py-1">
        ✅ UI TEST — build: {process.env.NEXT_PUBLIC_EMERGENCY_TEL || "no-env"} — {new Date().toISOString()}
      </div>

      <DoctorAIApp />
    </div>
  );
}
