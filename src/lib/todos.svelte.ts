// Reactive store wrapping the fake db. UI components read `todosStore.items`
// and call its methods; nobody outside this file talks to `db.ts` directly.

import * as db from './db';
import type { Todo } from './db';

function createTodosStore() {
	let items = $state<Todo[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	async function load() {
		loading = true;
		error = null;
		try {
			items = await db.listTodos();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load todos';
		} finally {
			loading = false;
		}
	}

	async function add(text: string) {
		if (!text.trim()) return;
		try {
			await db.addTodo(text);
			items = await db.listTodos();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to add todo';
		}
	}

	async function toggle(id: string) {
		// Optimistic update so the checkbox feels instant despite the fake latency.
		const todo = items.find((t) => t.id === id);
		if (!todo) return;
		todo.done = !todo.done;
		try {
			await db.toggleTodo(id);
		} catch (e) {
			todo.done = !todo.done; // revert on failure
			error = e instanceof Error ? e.message : 'Failed to update todo';
		}
	}

	async function updateText(id: string, text: string) {
		if (!text.trim()) return;
		try {
			await db.updateTodoText(id, text);
			const todo = items.find((t) => t.id === id);
			if (todo) todo.text = text.trim();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to update todo';
		}
	}

	async function remove(id: string) {
		const previous = items;
		items = items.filter((t) => t.id !== id);
		try {
			await db.deleteTodo(id);
		} catch (e) {
			items = previous; // revert on failure
			error = e instanceof Error ? e.message : 'Failed to delete todo';
		}
	}

	async function clearCompleted() {
		const previous = items;
		items = items.filter((t) => !t.done);
		try {
			await db.clearCompleted();
		} catch (e) {
			items = previous;
			error = e instanceof Error ? e.message : 'Failed to clear completed todos';
		}
	}

	return {
		get items() {
			return items;
		},
		get loading() {
			return loading;
		},
		get error() {
			return error;
		},
		load,
		add,
		toggle,
		updateText,
		remove,
		clearCompleted
	};
}

export const todosStore = createTodosStore();
