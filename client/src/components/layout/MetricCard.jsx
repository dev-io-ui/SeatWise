import Card from "../ui/Card.jsx";

export default function MetricCard({ label, value, tone = "blue", caption }) {
  const theme =
    tone === "orange"
      ? "from-accentSoft to-white"
      : tone === "ink"
        ? "from-[#dfe9f1] to-white"
        : "from-primarySoft to-white";

  return (
    <Card className={`bg-gradient-to-br ${theme}`}>
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">{label}</p>
      <p className="mt-4 text-4xl font-bold text-ink">{value}</p>
      <p className="mt-2 text-sm text-muted">{caption}</p>
    </Card>
  );
}

