import express, { Request, Response } from "express";
import cors from "cors";
import { firestoreDB } from "./firestore.js";

const db = firestoreDB;
let currentState: AppState | null = null;

const app = express();
app.use(cors());
app.use(express.json());
const PORT = 3000;

const STATE_DOC = "appState/state";

// Escucha cambios en Firestore en tiempo real
db.doc(STATE_DOC).onSnapshot(
	(docSnapshot) => {
		if (docSnapshot.exists) {
			currentState = docSnapshot.data() as AppState;
			console.log("🔄 Estado actualizado desde Firestore:", currentState);
		} else {
			console.log("⚠️ Documento de estado no existe.");
		}
	},
	(error) => {
		console.error("❌ Error al escuchar cambios en Firestore:", error);
	}
);

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

	if (!currentState) {
		// Si todavía no hay datos en memoria, intentar obtenerlos de Firestore
		try {
			const state = await readState();
			currentState = state;
			res.json(state);
		} catch (error) {
			console.error("❌ Error al leer el estado desde Firestore:", error);
			res
				.status(500)
				.json({ error: "Error al leer el estado desde Firestore." });
		}
	} else {
		res.json(currentState);
	}
});

app.post("/state", async (req: Request, res: Response) => {
	console.log("POST /state body:", req.body);
	try {
		const { shareId, isOpenWebSite, user } = req.body;
		const newState: AppState = { shareId, isOpenWebSite, user };
		await writeState(newState);
		currentState = newState; // Actualizar el estado en memoria
		res.json(newState);
	} catch (error) {
		res.status(500).json({ error: "Error al guardar el estado en Firestore." });
	}
});

app.patch("/state", async (req: Request, res: Response) => {
	try {
		const current = await readState();
		const updatedState: AppState = { ...current, ...req.body };
		await writeState(updatedState);
		currentState = updatedState;
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
