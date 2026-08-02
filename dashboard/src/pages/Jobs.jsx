import { usePolling } from '../hooks/usePolling';
import client from '../api/client';
import JobsTable from '../components/JobsTable';

const getAllJobs = () => client.get('/jobs').then((r) => r.data.jobs);

export default function Jobs() {
  const { data: jobs, loading, error } = usePolling(getAllJobs, 2000);

  if (loading) return <div className="text-neutral-400">Loading jobs...</div>;
  if (error) return <div className="text-red-400">Failed to load jobs.</div>;

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Jobs</h1>
      <JobsTable jobs={jobs} />
    </div>
  );
}