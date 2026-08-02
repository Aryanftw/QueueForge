export default function StatCard({ label, value, accent = 'text-white' }) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col gap-1">
      <span className="text-neutral-400 text-sm">{label}</span>
      <span className={`text-2xl font-semibold ${accent}`}>{value}</span>
    </div>
  );
}