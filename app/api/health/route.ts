import { pool } from "@/lib/db"

// Checking the health of the database
export async function GET() {
    try {
        // Run tiny query
        const result = await pool.query(
            'SELECT 1'
        );

        // If it succeeds, return 200
        return Response.json(
            {ok: true},
            {status: 200}
        );
    } catch (error) {
        // If it throws, return 503 + error JSON
        return Response.json(
            {error: "database unavailable"},
            {status: 503}
        );
    }

}