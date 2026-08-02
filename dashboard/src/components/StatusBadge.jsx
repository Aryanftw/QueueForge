const COLORS = {
  waiting: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
  processing: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
  completed: 'bg-green-500/20 text-green-400 border-green-500/40',
  retrying: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
  failed: 'bg-red-500/20 text-red-400 border-red-500/40',
};

export default function StatusBadge({ status }) {
  const style = COLORS[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/40';
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${style}`}>
      {status}
    </span>
  );
}