import { useParams, Link } from 'react-router-dom';
import { usePolling } from '../hooks/usePolling';
import { getJob } from '../api/client';
import StatusBadge from '../components/StatusBadge';

export default function JobDetails() {
  const { id } = useParams();
  const { data: job, loading, error } = usePolling(() => getJob(id), 2000, [id]);

  if (loading) return <div className="text-neutral-400">Loading job...</div>;
  if (error) return <div className="text-red-400">Job not found.</div>;

  return (
    <div className="max-w-3xl space-y-4">
      <Link to="/jobs" className="text-blue-400 text-sm hover:underline">&larr; Back to Jobs</Link>
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold font-mono">{job.id}</h1>
        <StatusBadge status={job.status} />
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <Field label="Type" value={job.type} />
        <Field label="Priority" value={job.priority} />
        <Field label="Worker" value={job.workerId || '-'} />
        <Field label="Retries" value={`${job.retryCount} / ${job.maxRetries}`} />
        <Field label="Created At" value={new Date(job.createdAt).toLocaleString()} />
        <Field label="Started At" value={job.startedAt ? new Date(job.startedAt).toLocaleString() : '-'} />
        <Field label="Completed At" value={job.completedAt ? new Date(job.completedAt).toLocaleString() : '-'} />
      </div>

      {job.lastError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-300 text-sm">
          {job.lastError}
        </div>
      )}

      <div>
        <div className="text-neutral-400 text-sm mb-1">Payload</div>
        <pre className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 text-xs overflow-x-auto">
          {JSON.stringify(job.payload, null, 2)}
        </pre>
      </div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <div className="text-neutral-500 text-xs">{label}</div>
      <div className="text-neutral-100">{value}</div>
    </div>
  );
}