import * as dotenv from "dotenv";
import admin from "firebase-admin";

dotenv.config();

var serviceAccount = JSON.parse(process.env.FIREBASE_CONNECTION as string);
if (admin.apps.length == 0) {
	admin.initializeApp({
		credential: admin.credential.cert(serviceAccount),
	});
}

const firestoreDB = admin.firestore();
export { firestoreDB, admin };
