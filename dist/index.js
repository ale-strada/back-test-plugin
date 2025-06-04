import express from "express";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
// Para simular __dirname en ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = 3000;
const STATE_PATH = path.join(__dirname, "state.json");
app.use(express.json());
// Helpers
const readState = async () => {
    const data = await fs.readFile(STATE_PATH, "utf-8");
    return JSON.parse(data);
};
const writeState = async (state) => {
    await fs.writeFile(STATE_PATH, JSON.stringify(state, null, 2));
};
// Endpoints
app.get("/state", async (_req, res) => {
    try {
        const state = await readState();
        res.json(state);
    }
    catch (error) {
        res.status(500).json({ error: "Error al leer el estado." });
    }
});
app.post("/state", async (req, res) => {
    try {
        const { shareId, isOpenWebSite } = req.body;
        const newState = { shareId, isOpenWebSite };
        await writeState(newState);
        res.json(newState);
    }
    catch (error) {
        res.status(500).json({ error: "Error al guardar el estado." });
    }
});
app.patch("/state", async (req, res) => {
    try {
        const currentState = await readState();
        const updatedState = { ...currentState, ...req.body };
        await writeState(updatedState);
        res.json(updatedState);
    }
    catch (error) {
        res.status(500).json({ error: "Error al actualizar el estado." });
    }
});
app.listen(PORT, () => {
    console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});
