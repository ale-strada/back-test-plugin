import express from "express";
import cors from "cors";
import admin from "firebase-admin";
const serviceAccount = await import("./firebase-service-account.json", {
    assert: { type: "json" },
});
console.log(serviceAccount);
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount.default),
});
const db = admin.firestore();
const app = express();
app.use(cors());
app.use(express.json());
const PORT = 3000;
const STATE_DOC = "appState/state"; // Colección: appState, Documento: state
// Firestore: leer estado
const readState = async () => {
    const doc = await db.doc(STATE_DOC).get();
    if (!doc.exists) {
        throw new Error("No state found");
    }
    return doc.data();
};
// Firestore: escribir estado
const writeState = async (state) => {
    await db.doc(STATE_DOC).set(state);
};
// Endpoints
app.get("/state", async (_req, res) => {
    console.log("GET /state");
    try {
        const state = await readState();
        res.json(state);
    }
    catch (error) {
        console.log(error, "error Firestore");
        res.status(500).json({ error: "Error al leer el estado desde Firestore." });
    }
});
app.post("/state", async (req, res) => {
    console.log("POST /state body:", req.body);
    try {
        const { shareId, isOpenWebSite, user } = req.body;
        const newState = { shareId, isOpenWebSite, user };
        await writeState(newState);
        res.json(newState);
    }
    catch (error) {
        res.status(500).json({ error: "Error al guardar el estado en Firestore." });
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
        res
            .status(500)
            .json({ error: "Error al actualizar el estado en Firestore." });
    }
});
app.listen(PORT, () => {
    console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});
