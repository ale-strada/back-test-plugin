import express, { Request, Response } from "express";
import cors from "cors";
import { firestoreDB } from "./firestore.js";

const db = firestoreDB;

const app = express();
app.use(cors());
app.use(express.json());
const PORT = 3000;

const STATE_DOC = "appState/state";

// Tipos
type AppState = {
	shareId: string;
	isOpenWebSite: boolean;
	user: string;
};

// Firestore: leer estado
const readState = async (): Promise<AppState> => {
	const doc = await db.doc(STATE_DOC).get();
	if (!doc.exists) {
		throw new Error("No state found");
	}
	return doc.data() as AppState;
};

// Firestore: escribir estado
const writeState = async (state: AppState): Promise<void> => {
	await db.doc(STATE_DOC).set(state);
};

// Endpoints

app.get("/state", async (_req: Request, res: Response) => {
	console.log("GET /state");

	try {
		const state = await readState();
		res.json(state);
	} catch (error) {
		console.log(error, "error Firestore");
		res.status(500).json({ error: "Error al leer el estado desde Firestore." });
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
		res.status(500).json({ error: "Error al guardar el estado en Firestore." });
	}
});

app.patch("/state", async (req: Request, res: Response) => {
	try {
		const currentState = await readState();
		const updatedState: AppState = { ...currentState, ...req.body };
		await writeState(updatedState);
		res.json(updatedState);
	} catch (error) {
		res
			.status(500)
			.json({ error: "Error al actualizar el estado en Firestore." });
	}
});

app.listen(PORT, () => {
	console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});
