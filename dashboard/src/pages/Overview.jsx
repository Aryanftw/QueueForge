import { usePolling } from '../hooks/usePolling';
import { getMetrics } from '../api/client';
import StatCard from '../components/StatCard';

export default function Overview() {
  const { data: metrics, loading, error } = usePolling(getMetrics, 2000);

  if (loading) return <div className="text-neutral-400">Loading metrics...</div>;
  if (error) return <div className="text-red-400">Failed to load metrics.</div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <StatCard label="Queue Length" value={metrics.queueLength} />
      <StatCard label="Waiting Jobs" value={metrics.jobsWaiting} accent="text-yellow-400" />
      <StatCard label="Processing Jobs" value={metrics.jobsProcessing} accent="text-blue-400" />
      <StatCard label="Completed Jobs" value={metrics.jobsCompleted} accent="text-green-400" />
      <StatCard label="Failed Jobs" value={metrics.jobsFailed} accent="text-red-400" />
      <StatCard label="Delayed Jobs" value={metrics.delayedJobs} />
      <StatCard label="Dead Letter Queue" value={metrics.deadLetterQueueLength} accent="text-red-400" />
      <StatCard label="Workers Running" value={metrics.workersRunning} />
      <StatCard label="Avg Processing Time" value={`${metrics.averageProcessingTimeMs} ms`} />
    </div>
  );
}