import app from "./src/app.js";

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`server running on ${PORT}`);
    console.log("Actual address:", server.address());


    // Self-ping every 5 minutes to prevent Render free tier from sleeping
    const backendUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
    setInterval(async () => {
        try {
            await fetch(`${backendUrl}/health`);
            console.log(`[Keep-Alive] Pinged at ${new Date().toISOString()}`);
        } catch (err) {
            console.error(`[Keep-Alive] Failed:`, err.message);
        }
    }, 5 * 60 * 1000);
});