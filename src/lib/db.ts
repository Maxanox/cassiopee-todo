// Fake DB layer: mimics an async persistence API (list / add / update / delete)
// but actually reads and writes to localStorage under the hood.
//
// The point is that `src/lib/todos.svelte.ts` (the store) only ever talks to
// this module's async functions. Swapping this file for a real HTTP client
// later would require no changes anywhere else.

export interface Todo {
	id: string;
	text: string;
	done: boolean;
	createdAt: number;
}

const STORAGE_KEY = 'todos-db';

// Simulate real-world network/db latency so the store's loading states are exercised.
const FAKE_LATENCY_MS = 120;

function delay<T>(value: T): Promise<T> {
	return new Promise((resolve) => setTimeout(() => resolve(value), FAKE_LATENCY_MS));
}

function isBrowser(): boolean {
	return typeof localStorage !== 'undefined';
}

function seedData(): Todo[] {
	const now = Date.now();
	return [
		{ id: crypto.randomUUID(), text: 'Découvrir SvelteKit', done: true, createdAt: now - 3000 },
		{ id: crypto.randomUUID(), text: 'Construire une todo app', done: false, createdAt: now - 2000 },
		{ id: crypto.randomUUID(), text: 'Se prendre un café ☕', done: false, createdAt: now - 1000 }
	];
}

function readAll(): Todo[] {
	if (!isBrowser()) return [];

	const raw = localStorage.getItem(STORAGE_KEY);
	if (raw === null) {
		const seeded = seedData();
		writeAll(seeded);
		return seeded;
	}

	try {
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) throw new Error('corrupt todos payload');
		return parsed as Todo[];
	} catch {
		// Corrupt/unreadable storage: reset instead of crashing the app.
		const seeded = seedData();
		writeAll(seeded);
		return seeded;
	}
}

function writeAll(todos: Todo[]): void {
	if (!isBrowser()) return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

export async function listTodos(): Promise<Todo[]> {
	const todos = readAll();
	return delay([...todos].sort((a, b) => a.createdAt - b.createdAt));
}

export async function addTodo(text: string): Promise<Todo> {
	const trimmed = text.trim();
	if (!trimmed) throw new Error('Todo text cannot be empty');

	const todo: Todo = {
		id: crypto.randomUUID(),
		text: trimmed,
		done: false,
		createdAt: Date.now()
	};

	const todos = readAll();
	todos.push(todo);
	writeAll(todos);

	return delay(todo);
}

export async function toggleTodo(id: string): Promise<void> {
	const todos = readAll();
	const todo = todos.find((t) => t.id === id);
	if (todo) {
		todo.done = !todo.done;
		writeAll(todos);
	}
	return delay(undefined);
}

export async function updateTodoText(id: string, text: string): Promise<void> {
	const trimmed = text.trim();
	if (!trimmed) throw new Error('Todo text cannot be empty');

	const todos = readAll();
	const todo = todos.find((t) => t.id === id);
	if (todo) {
		todo.text = trimmed;
		writeAll(todos);
	}
	return delay(undefined);
}

export async function deleteTodo(id: string): Promise<void> {
	const todos = readAll().filter((t) => t.id !== id);
	writeAll(todos);
	return delay(undefined);
}

export async function clearCompleted(): Promise<void> {
	const todos = readAll().filter((t) => !t.done);
	writeAll(todos);
	return delay(undefined);
}
