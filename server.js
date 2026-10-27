const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 5900;

const UPSTREAM = "https://vpn-gateway--im7548631.replit.app";

app.use(express.json());

app.use("/api", async (req, res) => {
    const target = UPSTREAM + req.originalUrl;

    try {
        const response = await axios({
            method: req.method,
            url: target,
            headers: {
                "Content-Type":
                    req.headers["content-type"] || "application/json",
                "Accept":
                    req.headers.accept || "application/json"
            },
            data: ["GET", "HEAD"].includes(req.method)
                ? undefined
                : req.body,
            timeout: 30000,
            validateStatus: () => true,
            responseType: "arraybuffer"
        });

        res.status(response.status);

        if (response.headers["content-type"]) {
            res.setHeader(
                "Content-Type",
                response.headers["content-type"]
            );
        }

        res.send(Buffer.from(response.data));
    } catch (error) {
        console.error("Proxy error:", error.message);

        res.status(
            error.code === "ECONNABORTED" ? 504 : 502
        ).json({
            error: "VPN upstream request failed",
            message: error.message
        });
    }
});

app.get("/", (req, res) => {
    res.json({
        name: "VPN API Axios Proxy",
        port: PORT,
        upstream: UPSTREAM,
        endpoints: [
            "/api/vpn/countries",
            "/api/vpn/connect",
            "/api/vpn/status",
            "/api/vpn/ip",
            "/api/vpn/logs",
            "/api/vpn/version",
            "/api/vpn/test/sleep?ms=1000",
            "/api/vpn/disconnect"
        ]
    });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`VPN proxy running on port ${PORT}`);
});
