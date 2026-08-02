import { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { getMetrics } from '../api/client';

// Keeps a rolling history in memory (not persisted) so the chart shows a trend, not just one point.
export default function Metrics() {
  const [history, setHistory] = useState([]);
  const startTime = useRef(Date.now());

  useEffect(() => {
    async function poll() {
      const m = await getMetrics();
      setHistory((prev) => {
        const next = [...prev, {
          time: Math.round((Date.now() - startTime.current) / 1000) + 's',
          queueLength: m.queueLength,
          jobsCompleted: m.jobsCompleted,
          jobsFailed: m.jobsFailed,
          avgProcessingTimeMs: m.averageProcessingTimeMs,
        }];
        return next.slice(-30); // keep last 30 points
      });
    }
    poll();
    const interval = setInterval(poll, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold">Metrics</h1>

      <ChartBlock title="Queue Length" dataKey="queueLength" data={history} color="#60a5fa" />
      <ChartBlock title="Completed vs Failed" dataKey="jobsCompleted" data={history} color="#4ade80" secondaryKey="jobsFailed" secondaryColor="#f87171" />
      <ChartBlock title="Avg Processing Time (ms)" dataKey="avgProcessingTimeMs" data={history} color="#fbbf24" />
    </div>
  );
}

function ChartBlock({ title, dataKey, secondaryKey, color, secondaryColor, data }) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
      <div className="text-neutral-400 text-sm mb-2">{title}</div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="time" stroke="#888" fontSize={12} />
          <YAxis stroke="#888" fontSize={12} />
          <Tooltip contentStyle={{ background: '#171717', border: '1px solid #333' }} />
          <Line type="monotone" dataKey={dataKey} stroke={color} dot={false} strokeWidth={2} />
          {secondaryKey && <Line type="monotone" dataKey={secondaryKey} stroke={secondaryColor} dot={false} strokeWidth={2} />}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}