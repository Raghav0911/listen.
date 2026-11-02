// A small local server for Listen. - no extra packages required
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const DATA_FILE = path.join(DATA_DIR, "submissions.json");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]", "utf8");

const contentTypes = {
    ".html": "text/html", ".css": "text/css", ".js": "application/javascript",
    ".json": "application/json", ".mp3": "audio/mpeg", ".png": "image/png",
    ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml"
};

const server = http.createServer(function (req, res) {
    if (req.method === "POST" && req.url === "/submit") {
        let body = "";
        req.on("data", chunk => body += chunk);
        req.on("end", function () {
            try {
                const submission = JSON.parse(body);
                if (!["feedback", "song-request"].includes(submission.type)) {
                    res.writeHead(400, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ message: "Invalid form type." }));
                    return;
                }
                const savedForms = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
                savedForms.push(submission);
                fs.writeFileSync(DATA_FILE, JSON.stringify(savedForms, null, 2), "utf8");
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ message: "Form saved successfully." }));
            } catch (error) {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ message: "Please send valid form data." }));
            }
        });
        return;
    }

    const requestedPath = req.url === "/" ? "/index.html" : decodeURIComponent(req.url.split("?")[0]);
    const filePath = path.resolve(ROOT, "." + requestedPath);
    if (filePath !== ROOT && !filePath.startsWith(ROOT + path.sep)) {
        res.writeHead(403); res.end("Forbidden"); return;
    }
    fs.readFile(filePath, function (error, content) {
        if (error) { res.writeHead(404); res.end("Page not found"); return; }
        const type = contentTypes[path.extname(filePath)] || "application/octet-stream";
        res.writeHead(200, { "Content-Type": type });
        res.end(content);
    });
});
server.listen(PORT, function () {
    console.log("Listen. is running at http://localhost:" + PORT);
});