const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const { app, ensureMongoConnected } = require("./app");

async function start() {
  await ensureMongoConnected();

  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Task Manager running at http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server:", err);
  process.exit(1);
});

