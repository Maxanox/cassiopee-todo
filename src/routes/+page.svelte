<script lang="ts">
	import { onMount } from 'svelte';
	import { todosStore } from '$lib/todos.svelte';
	import TodoItem from '$lib/components/TodoItem.svelte';

	type Filter = 'all' | 'active' | 'done';

	let newText = $state('');
	let filter = $state<Filter>('all');

	onMount(() => {
		todosStore.load();
	});

	let filtered = $derived(
		todosStore.items.filter((t) => {
			if (filter === 'active') return !t.done;
			if (filter === 'done') return t.done;
			return true;
		})
	);

	let remaining = $derived(todosStore.items.filter((t) => !t.done).length);
	let hasCompleted = $derived(todosStore.items.some((t) => t.done));

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		const text = newText;
		newText = '';
		todosStore.add(text);
	}
</script>

<svelte:head>
	<title>Todo</title>
</svelte:head>

<main>
	<h1>Todo</h1>

	<form onsubmit={handleSubmit} class="add-form">
		<input
			type="text"
			placeholder="Que faut-il faire ?"
			bind:value={newText}
			aria-label="Nouvelle tâche"
		/>
		<button type="submit" disabled={!newText.trim()}>Ajouter</button>
	</form>

	{#if todosStore.error}
		<p class="error">{todosStore.error}</p>
	{/if}

	<div class="card">
		{#if todosStore.loading}
			<p class="empty">Chargement…</p>
		{:else if filtered.length === 0}
			<p class="empty">
				{todosStore.items.length === 0 ? 'Aucune tâche pour le moment.' : 'Rien à afficher ici.'}
			</p>
		{:else}
			<ul class="list">
				{#each filtered as todo (todo.id)}
					<TodoItem
						{todo}
						ontoggle={todosStore.toggle}
						onedit={todosStore.updateText}
						ondelete={todosStore.remove}
					/>
				{/each}
			</ul>
		{/if}

		{#if todosStore.items.length > 0}
			<div class="footer">
				<span class="count">{remaining} restante{remaining === 1 ? '' : 's'}</span>

				<div class="filters">
					<button class:active={filter === 'all'} onclick={() => (filter = 'all')}>Toutes</button>
					<button class:active={filter === 'active'} onclick={() => (filter = 'active')}
						>Actives</button
					>
					<button class:active={filter === 'done'} onclick={() => (filter = 'done')}
						>Terminées</button
					>
				</div>

				<button
					class="clear"
					disabled={!hasCompleted}
					onclick={() => todosStore.clearCompleted()}
				>
					Effacer terminées
				</button>
			</div>
		{/if}
	</div>

	<p class="hint">Double-cliquez sur une tâche pour la modifier. Tout est sauvegardé dans votre navigateur.</p>
</main>

<style>
	main {
		max-width: 32rem;
		margin: 0 auto;
		padding: 3rem 1.25rem 4rem;
	}

	h1 {
		font-size: 1.75rem;
		margin: 0 0 1.5rem;
	}

	.add-form {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1.25rem;
	}

	.add-form input {
		flex: 1;
		font: inherit;
		padding: 0.65rem 0.9rem;
		border-radius: var(--radius);
		border: 1px solid var(--border);
		background: var(--surface);
		color: var(--text);
	}

	.add-form input:focus {
		outline: 2px solid var(--accent);
		outline-offset: 1px;
	}

	.add-form button {
		font: inherit;
		font-weight: 600;
		padding: 0.65rem 1.1rem;
		border-radius: var(--radius);
		border: none;
		background: var(--accent);
		color: var(--accent-contrast);
		cursor: pointer;
	}

	.add-form button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.error {
		color: var(--danger);
		font-size: 0.9rem;
		margin: -0.5rem 0 1rem;
	}

	.card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		overflow: hidden;
	}

	.empty {
		margin: 0;
		padding: 2rem 1rem;
		text-align: center;
		color: var(--text-muted);
	}

	.list {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 0.65rem 1rem;
		border-top: 1px solid var(--border);
		flex-wrap: wrap;
		font-size: 0.85rem;
	}

	.count {
		color: var(--text-muted);
		white-space: nowrap;
	}

	.filters {
		display: flex;
		gap: 0.25rem;
	}

	.filters button,
	.clear {
		font: inherit;
		font-size: 0.85rem;
		padding: 0.3rem 0.6rem;
		border-radius: 6px;
		border: 1px solid transparent;
		background: transparent;
		color: var(--text-muted);
		cursor: pointer;
	}

	.filters button:hover,
	.clear:hover:not(:disabled) {
		color: var(--text);
	}

	.filters button.active {
		border-color: var(--border);
		color: var(--accent);
	}

	.clear:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.hint {
		margin-top: 1.25rem;
		font-size: 0.8rem;
		color: var(--text-muted);
		text-align: center;
	}
</style>
