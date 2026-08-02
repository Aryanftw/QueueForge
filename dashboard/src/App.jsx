import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Overview from './pages/Overview';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import DeadLetterQueue from './pages/DeadLetterQueue';
import Workers from './pages/Workers';
import Metrics from './pages/Metrics';

const NAV = [
  { to: '/', label: 'Overview', end: true },
  { to: '/jobs', label: 'Jobs' },
  { to: '/dlq', label: 'Dead Letter Queue' },
  { to: '/workers', label: 'Workers' },
  { to: '/metrics', label: 'Metrics' },
];

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex">
        <aside className="w-56 border-r border-neutral-800 p-4 space-y-1">
          <div className="text-lg font-bold mb-6">QueueForge</div>
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm ${
                  isActive ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-neutral-200'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </aside>

        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:id" element={<JobDetails />} />
            <Route path="/dlq" element={<DeadLetterQueue />} />
            <Route path="/workers" element={<Workers />} />
            <Route path="/metrics" element={<Metrics />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}