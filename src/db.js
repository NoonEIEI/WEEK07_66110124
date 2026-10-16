import Dexie from "dexie"

export const db = new Dexie('MyinventoryDB');

db.version(1).stores({
    items: "++id, text, done"
});