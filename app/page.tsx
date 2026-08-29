"use client";

import { useState, useEffect } from "react";
export default function Home() {

  const [points, setPoints] = useState<any[]>([]);
  const [metric, setMetric] = useState("temp");

  useEffect(() => {
    const interval = setInterval(() => {
      const to = new Date();
      const from = new Date(to.getTime() - 15 * 60 * 1000);

      const fromStr = from.toISOString();
      const toStr = to.toISOString();
      
      const fetchPoints = async () => {
        const res = await fetch(`/api/telemetry?vehicle=sat-1&metric=${metric}&from=${fromStr}&to=${toStr}`);
        const data = await res.json();

        setPoints(data.points);
      }

      fetchPoints();

    }, 2000);
    
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
        {points.map((point) => (
          <p>
            {point.time} - {point.value}
          </p>
        ))}
      </div>
    </main>
  );
}
