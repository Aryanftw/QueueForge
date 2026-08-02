import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

const FILTERS = ['all', 'waiting', 'processing', 'retrying', 'completed', 'failed'];

export default function JobsTable({ jobs }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return jobs
      .filter((j) => filter === 'all' || j.status === filter)
      .filter((j) => !search || j.id.includes(search));
  }, [jobs, filter, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-sm border ${
              filter === f
                ? 'bg-neutral-100 text-neutral-900 border-neutral-100'
                : 'border-neutral-700 text-neutral-300'
            }`}
          >
            {f}
          </button>
        ))}
        <input
          placeholder="Search by Job ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ml-auto bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-sm text-neutral-100 outline-none focus:border-neutral-500"
        />
      </div>

      <div className="overflow-x-auto border border-neutral-800 rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-neutral-900 text-neutral-400 text-left">
            <tr>
              <th className="p-3">Job ID</th>
              <th className="p-3">Type</th>
              <th className="p-3">Priority</th>
              <th className="p-3">Status</th>
              <th className="p-3">Worker</th>
              <th className="p-3">Retries</th>
              <th className="p-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((job) => (
              <tr key={job.id} className="border-t border-neutral-800 hover:bg-neutral-900/60">
                <td className="p-3">
                  <Link to={`/jobs/${job.id}`} className="text-blue-400 hover:underline font-mono text-xs">
                    {job.id.slice(0, 8)}...
                  </Link>
                </td>
                <td className="p-3">{job.type}</td>
                <td className="p-3">{job.priority}</td>
                <td className="p-3"><StatusBadge status={job.status} /></td>
                <td className="p-3 text-neutral-400">{job.workerId || '-'}</td>
                <td className="p-3">{job.retryCount}/{job.maxRetries}</td>
                <td className="p-3 text-neutral-500 text-xs">
                  {new Date(job.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-neutral-500">
                  No jobs match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}