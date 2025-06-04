import express, { Request, Response } from "express";
import cors from "cors";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Para simular __dirname en ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors()); // <-- Agrega esta línea
app.use(express.json());
const PORT = 3000;
const STATE_PATH = path.join(__dirname, "state.json");

app.use(express.json());

// Tipos
type AppState = {
	shareId: string;
	isOpenWebSite: boolean;
	user: string;
};

// Helpers
const readState = async (): Promise<AppState> => {
	const data = await fs.readFile(STATE_PATH, "utf-8");
	return JSON.parse(data);
};

const writeState = async (state: AppState): Promise<void> => {
	await fs.writeFile(STATE_PATH, JSON.stringify(state, null, 3));
};

// ngrok http http://localhost:3000
// Endpoints
app.get("/state", async (_req: Request, res: Response) => {
	console.log("GET /state");

	try {
		const state = await readState();
		res.json(state);
	} catch (error) {
		res.status(500).json({ error: "Error al leer el estado." });
	}
});
app.post("/state", async (req: Request, res: Response) => {
	console.log("POST /state body:", req.body);
	try {
		const { shareId, isOpenWebSite, user } = req.body;
		const newState: AppState = { shareId, isOpenWebSite, user };
		await writeState(newState);
		res.json(newState);
	} catch (error) {
		res.status(500).json({ error: "Error al guardar el estado." });
	}
});

app.patch("/state", async (req: Request, res: Response) => {
	try {
		const currentState = await readState();
		const updatedState: AppState = { ...currentState, ...req.body };
		await writeState(updatedState);
		res.json(updatedState);
	} catch (error) {
		res.status(500).json({ error: "Error al actualizar el estado." });
	}
});

app.listen(PORT, () => {
	console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});
