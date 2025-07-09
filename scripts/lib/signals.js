import { uuidv4 } from "./crypto.js";
const buffer = new Map();
/**
 * Set a new signal
 */
export function setSignal() {
    const id = uuidv4();
    buffer.set(id, []);
    return id;
}
/**
 * Connect a function to a signal
 * @param id The signal id
 * @param handler The signal handler function
 */
export function connectToSignal(id, handler) {
    if (false == buffer.has(id)) {
        console.error(`Error connecting: The signal ${id} does not exist.`);
        return;
    }
    buffer.get(id).push(handler);
}
export function disconnectSignal(id) {
    if (false == buffer.has(id)) {
        console.error(`Error connecting: The signal ${id} does not exist.`);
        return;
    }
    buffer.set(id, []);
}
/**
 * Emit a signal with the given dat
 */
export async function emitSignal(id, data) {
    if (false == buffer.has(id))
        return;
    const targets = buffer.get(id);
    for (const target of targets) {
        target(data);
    }
}
