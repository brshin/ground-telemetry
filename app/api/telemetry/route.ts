import { pool } from "@/lib/db"

export async function GET(request: Request) {

    try {
        // Read query parameters
        const { searchParams } = new URL(request.url);
        const vehicleId = searchParams.get("vehicle");
        const metric = searchParams.get("metric");
        const from = searchParams.get("from");
        const to = searchParams.get("to");

        // Validate query parameters
        //validate they exist/are not empty
        if (!vehicleId || !metric || !from || !to) {
            return Response.json(
                { error: "missing required parameters" },
                { status: 400 }
            );
        }

        //validate they are the right format
        if (metric !== "temp" && metric !== "bus_voltage" && metric !== "cabin_pressure") {
            return Response.json(
                { error: "invalid metric" },
                { status: 400 }
            );
        }

        if (Number.isNaN(Date.parse(from)) || Number.isNaN(Date.parse(to))) {
            return Response.json({ error: "invalid payload" }, { status: 400 });
        }
        
        //validate FROM is before TO
        if (new Date(from) > new Date(to)) {
            return Response.json({ error: "invalid payload" }, { status: 400 });
        }

        // search database
        const result = await pool.query(
            `SELECT *
            FROM telemetry
            WHERE vehicle_id = $1 AND metric = $2
                AND time BETWEEN $3 AND $4
            ORDER BY time
            LIMIT $5`,
            [vehicleId, metric, from, to, 5000]
        );

        // return response
        return Response.json({ points: result.rows }, { status: 200 })

    } catch (error) {
        //error Response 
        return Response.json({ error: "database unavailable" }, { status: 503 });
    }

}