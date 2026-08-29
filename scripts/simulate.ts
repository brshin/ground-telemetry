const INGEST_URL = "http://localhost:3000/api/ingest";

function tick() {
    const time = new Date().toISOString();
    const points = [
        { time, vehicle_id: "sat-1", metric: "temp", value: 22 + (Math.random() - 0.5) },
        { time, vehicle_id: "sat-1", metric: "bus_voltage", value: 28 + (Math.random() - 0.5) },
        { time, vehicle_id: "sat-1", metric: "cabin_pressure", value: 14.7 + (Math.random() - 0.5) * 0.5 },
    ];

    fetch(INGEST_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify( { points } ),
    })
    .then(async (res) => {
        const body = await res.json();
        console.log(res.status, body);
    })
    .catch((err) => {
        console.error("ingest failed", err);
    });
}

tick();
setInterval(tick, 1000);