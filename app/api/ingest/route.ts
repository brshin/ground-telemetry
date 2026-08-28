import { pool } from "@/lib/db";

export async function POST(request: Request) {
    try {
        let body;
        try {
            body = await request.json();
        } catch (error) {
            return Response.json(
                { error: "invalid JSON" },
                { status: 400 }
            );
        }
        const points = body.points;

        // Check for required fields - reject if incorrect
            //If points is not an array
            if (!Array.isArray(points)) {
                return Response.json(
                    { error: "invalid payload" },
                    { status: 400 }
                );
            }
            //If points length is 0
            if (points.length === 0) {
                return Response.json(
                    { error: "invalid payload" },
                    { status: 400 }
                );
            }
            
            for (const point of points) {
                //If any point is missing a field
                if (point.time == null || point.vehicle_id == null || point.metric == null || point.value == null) {
                    return Response.json(
                        { error: "invalid payload" },
                        { status: 400 }
                    );
                }

                //If time is not a usable timestamp
                if (typeof point.time !== "string" || Number.isNaN(Date.parse(point.time))) {
                    return Response.json(
                        { error: "invalid payload" },
                        { status: 400 }
                    );
                }

                //If value is not a number
                if (typeof point.value !== "number" || !Number.isFinite(point.value)) {
                    return Response.json(
                        { error: "invalid payload" },
                        { status: 400 }
                    );
                }

                //If metric is not one of the three
                if (!["temp", "bus_voltage", "cabin_pressure"].includes(point.metric)) {
                    return Response.json(
                        { error: "invalid payload" },
                        { status: 400 }
                    );

                }
           
            }
            
        for (const point of points) {
            // Insert into database
            await pool.query(
                `INSERT INTO telemetry (time, vehicle_id, metric, value)
                VALUES ($1, $2, $3, $4)`,
                [point.time, point.vehicle_id, point.metric, point.value]
            );
        }
        
        // return success response
        return Response.json(
            { inserted: points.length },
            { status: 201 }
        );

    } catch (error) {
        // failure
        return Response.json(
            {error: "database unavailable"},
            {status: 503}
        );
    }

}