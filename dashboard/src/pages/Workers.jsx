import { useState } from 'react';
import { usePolling } from '../hooks/usePolling';
import { getDlqList, getDlqJob, replayJob } from '../api/client';

export default function DeadLetterQueue() {
  const { data, loading, error } = usePolling(async () => {
    const { jobIds } = await getDlqList();
    const jobs = await Promise.all(jobIds.map((id) => getDlqJob(id)));
    return jobs;
  }, 2000);

  const [replaying, setReplaying] = useState(null);
  const [message, setMessage] = useState('');

  async function handleReplay(id) {
    setReplaying(id);
    try {
      await replayJob(id);
      setMessage(`Job ${id.slice(0, 8)}... re-queued.`);
    } catch {
      setMessage(`Failed to replay ${id.slice(0, 8)}...`);
    } finally {
      setReplaying(null);
    }
  }

  if (loading) return <div className="text-neutral-400">Loading DLQ...</div>;
  if (error) return <div className="text-red-400">Failed to load DLQ.</div>;

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Dead Letter Queue</h1>
      {message && <div className="mb-3 text-sm text-green-400">{message}</div>}

      <div className="overflow-x-auto border border-neutral-800 rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-neutral-900 text-neutral-400 text-left">
            <tr>
              <th className="p-3">Job ID</th>
              <th className="p-3">Last Error</th>
              <th className="p-3">Retries</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {data.map((job) => (
              <tr key={job.id} className="border-t border-neutral-800">
                <td className="p-3 font-mono text-xs">{job.id.slice(0, 8)}...</td>
                <td className="p-3 text-red-300 text-xs">{job.lastError}</td>
                <td className="p-3">{job.retryCount}</td>
                <td className="p-3">
                  <button
                    onClick={() => handleReplay(job.id)}
                    disabled={replaying === job.id}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs px-3 py-1.5 rounded-lg"
                  >
                    {replaying === job.id ? 'Replaying...' : 'Replay'}
                  </button>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan={4} className="p-6 text-center text-neutral-500">DLQ is empty.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}