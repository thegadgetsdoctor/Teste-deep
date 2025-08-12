// db.js - IndexedDB para Portaria
// Usuários, registros de visitas e logs de auditoria

const DB_NAME = 'portariaDB';
const DB_VERSION = 1;
let db = null;

function openDB() {
    return new Promise((resolve, reject) => {
        if (db) return resolve(db);
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => { db = request.result; resolve(db); };
        request.onupgradeneeded = (event) => {
            db = event.target.result;
            if (!db.objectStoreNames.contains('usuarios')) {
                const userStore = db.createObjectStore('usuarios', { keyPath: 'usuario' });
                userStore.createIndex('cpf', 'cpf', { unique: false });
                userStore.createIndex('tipo', 'tipo', { unique: false });
            }
            if (!db.objectStoreNames.contains('visitas')) {
                db.createObjectStore('visitas', { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains('logs')) {
                db.createObjectStore('logs', { keyPath: 'id', autoIncrement: true });
            }
        };
    });
}

// Usuários
async function dbAddUsuario(usuario) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('usuarios', 'readwrite');
        tx.objectStore('usuarios').add(usuario).onsuccess = resolve;
        tx.onerror = () => reject(tx.error);
    });
}
async function dbGetUsuario(usuario) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const req = db.transaction('usuarios').objectStore('usuarios').get(usuario);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}
async function dbGetAllUsuarios() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const req = db.transaction('usuarios').objectStore('usuarios').getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}
async function dbUpdateUsuario(usuario) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('usuarios', 'readwrite');
        tx.objectStore('usuarios').put(usuario).onsuccess = resolve;
        tx.onerror = () => reject(tx.error);
    });
}

// Visitas
async function dbAddVisita(visita) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('visitas', 'readwrite');
        tx.objectStore('visitas').add(visita).onsuccess = resolve;
        tx.onerror = () => reject(tx.error);
    });
}
async function dbGetAllVisitas() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const req = db.transaction('visitas').objectStore('visitas').getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

// Logs de auditoria
async function dbAddLog(log) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('logs', 'readwrite');
        tx.objectStore('logs').add(log).onsuccess = resolve;
        tx.onerror = () => reject(tx.error);
    });
}
async function dbGetAllLogs() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const req = db.transaction('logs').objectStore('logs').getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

// Exemplo de uso:
// await dbAddUsuario({usuario: 'admin', nome: 'Administrador', cpf: '', tipo: 'admin', senha: 'hash'});
// const admin = await dbGetUsuario('admin');
