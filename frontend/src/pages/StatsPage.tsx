import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const WEEKLY_VOLUME = [
  { label: "Mon", kg: 4200 },
  { label: "Tue", kg: 0 },
  { label: "Wed", kg: 5100 },
  { label: "Thu", kg: 0 },
  { label: "Fri", kg: 4800 },
  { label: "Sat", kg: 3600 },
  { label: "Sun", kg: 0 },
];

export function StatsPage() {
  return (
    <div className="panel graph-shell-panel">
      <div className="panel-head">
        <h1 className="panel-title">Weekly volume</h1>
        <p className="panel-hint">
          Sample chart (Recharts) — placeholder for future API-backed data.
        </p>
      </div>
      <div className="graph-shell">
        <p className="graph-shell-status pill">Σ kg × reps (mock)</p>
        <div className="volume-chart-region">
          <div className="volume-chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={WEEKLY_VOLUME}
                margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  stroke="rgba(255,255,255,0.08)"
                  strokeDasharray="4 4"
                />
                <XAxis
                  dataKey="label"
                  stroke="rgba(255,255,255,0.45)"
                  tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.45)"
                  tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
                  width={44}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(10, 12, 16, 0.92)",
                    border: "1px solid rgba(255,255,255,0.14)",
                    borderRadius: 12,
                    color: "rgba(255,255,255,0.92)",
                  }}
                  labelStyle={{ color: "rgba(255,207,90,0.95)" }}
                />
                <Line
                  type="monotone"
                  dataKey="kg"
                  name="Volume"
                  stroke="#ffcf5a"
                  strokeWidth={2}
                  dot={{ fill: "#ff8e5a", strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
