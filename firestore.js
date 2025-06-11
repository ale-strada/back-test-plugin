import * as dotenv from "dotenv";
import admin from "firebase-admin";
dotenv.config();
console.log(process.env.TEST, "ENV");
console.log(process.env.FIREBASE_CONNECTION, "ENV");
var serviceAccount = JSON.parse(process.env.FIREBASE_CONNECTION);
if (admin.apps.length == 0) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}
const firestoreDB = admin.firestore();
export { firestoreDB, admin };
