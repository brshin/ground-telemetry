"use client";

import { useState, useEffect } from "react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";


export default function Home() {

  const [points, setPoints] = useState<any[]>([]);
  const [metric, setMetric] = useState("temp");
  const [error, setError] = useState(false);

  useEffect(() => {

    const fetchPoints = async () => {
      const to = new Date();
      const from = new Date(to.getTime() - 15 * 60 * 1000);

      const fromStr = from.toISOString();
      const toStr = to.toISOString();

      try {
        const res = await fetch(`/api/telemetry?vehicle=sat-1&metric=${metric}&from=${fromStr}&to=${toStr}`);
        if (!res.ok) {
          setError(true);
          return;
        }
        
        const data = await res.json();
        setError(false);

        setPoints(data.points);

      } catch (error) {
        setError(true);
      }
    };

    fetchPoints();

    const interval = setInterval(fetchPoints, 2000);

    return () => clearInterval(interval);
  }, [metric]);



  return (
    <main>
      <div>
        <h1> Telemetry Dashboard </h1>
        <select value={metric} onChange={(e) => setMetric(e.target.value)}>
          <option value="temp">Temperature</option>
          <option value="bus_voltage">Bus Voltage</option>
          <option value="cabin_pressure">Cabin Pressure</option>
        </select>
        {error && <p>Error fetching data</p>}
        {!error && points.length === 0 && <p>No data</p>}
        {points.map((point) => (
          <p>
            {point.time} - {point.value}
          </p>
        ))}
        {!error && points.length > 0 && (
        <div style={{ width: "100%", height: 320 }}>
          <ResponsiveContainer>
            <LineChart data={points}>
              <CartesianGrid />
              <XAxis dataKey="time" />
              <YAxis dataKey="value" />
              <Tooltip />
              <Line type="monotone" dataKey="value" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
        
      </div>
    </main>
  );
}
