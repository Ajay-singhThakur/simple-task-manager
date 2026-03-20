const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const Task = require("./models/Task");

const frontendDir = path.join(__dirname, "..", "frontend");

const app = express();
app.use(express.json());
app.use(cors());

let mongoConnPromise = null;
async function ensureMongoConnected() {
  const uri = process.env.MONGODB_URI || "";
  if (!uri) throw new Error("Missing MONGODB_URI. Set it in your environment before starting the server.");

  if (mongoose.connection.readyState === 1) return;
  if (!mongoConnPromise) {
    mongoConnPromise = mongoose.connect(uri);
  }
  await mongoConnPromise;
}

function normalizeTitle(value) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function normalizeDescription(value) {
  if (value === undefined || value === null) return "";
  if (typeof value !== "string") return "";
  return value.trim();
}

function normalizeStatus(value) {
  if (typeof value !== "string") return undefined;
  const s = value.toLowerCase().trim();
  if (s !== "pending" && s !== "completed") return undefined;
  return s;
}

// --------- API ----------

app.get("/api/tasks", async (req, res) => {
  await ensureMongoConnected();
  const tasks = await Task.find({}).sort({ created_at: -1 }).lean(false);
  res.json({ tasks });
});

app.post("/api/tasks", async (req, res) => {
  await ensureMongoConnected();

  const title = normalizeTitle(req.body?.title);
  if (!title) return res.status(400).json({ error: "Title must not be empty." });

  const description = normalizeDescription(req.body?.description);
  const status =
    normalizeStatus(req.body?.status) ?? (req.body?.status === undefined ? "pending" : undefined);

  if (!status) return res.status(400).json({ error: "Invalid status. Use 'pending' or 'completed'." });

  const task = await Task.create({ title, description, status });
  res.status(201).json({ task });
});

app.put("/api/tasks/:id", async (req, res) => {
  await ensureMongoConnected();

  const title = normalizeTitle(req.body?.title);
  if (!title) return res.status(400).json({ error: "Title must not be empty." });

  const description = normalizeDescription(req.body?.description);
  const requestedStatus = req.body?.status;
  const status = requestedStatus === undefined ? undefined : normalizeStatus(requestedStatus);
  if (requestedStatus !== undefined && !status)
    return res.status(400).json({ error: "Invalid status. Use 'pending' or 'completed'." });

  const update = { title, description };
  if (status) update.status = status;

  const updated = await Task.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
  if (!updated) return res.status(404).json({ error: "Task not found." });
  res.json({ task: updated });
});

app.patch("/api/tasks/:id/status", async (req, res) => {
  await ensureMongoConnected();

  const status = normalizeStatus(req.body?.status);
  if (!status) return res.status(400).json({ error: "Invalid status. Use 'pending' or 'completed'." });

  const updated = await Task.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );
  if (!updated) return res.status(404).json({ error: "Task not found." });
  res.json({ task: updated });
});

app.delete("/api/tasks/:id", async (req, res) => {
  await ensureMongoConnected();

  const removed = await Task.findByIdAndDelete(req.params.id);
  if (!removed) return res.status(404).json({ error: "Task not found." });
  res.json({ deleted: removed });
});

// --------- Frontend (static) ----------

app.get("/", (req, res) => {
  res.sendFile(path.join(frontendDir, "index.html"));
});

app.use(express.static(frontendDir));
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendDir, "index.html"));
});

module.exports = { app, ensureMongoConnected };

