<script lang="ts">
	import type { Todo } from '$lib/db';

	let {
		todo,
		ontoggle,
		onedit,
		ondelete
	}: {
		todo: Todo;
		ontoggle: (id: string) => void;
		onedit: (id: string, text: string) => void;
		ondelete: (id: string) => void;
	} = $props();

	let editing = $state(false);
	let draft = $state('');
	let inputEl: HTMLInputElement | undefined = $state();

	function startEdit() {
		draft = todo.text;
		editing = true;
	}

	function commitEdit() {
		if (!editing) return;
		editing = false;
		const trimmed = draft.trim();
		if (trimmed && trimmed !== todo.text) {
			onedit(todo.id, trimmed);
		}
	}

	function cancelEdit() {
		editing = false;
		draft = todo.text;
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') commitEdit();
		if (e.key === 'Escape') cancelEdit();
	}

	$effect(() => {
		if (editing) inputEl?.focus();
	});
</script>

<li class="item" class:done={todo.done}>
	<input
		type="checkbox"
		checked={todo.done}
		onchange={() => ontoggle(todo.id)}
		aria-label={`Marquer "${todo.text}" comme ${todo.done ? 'à faire' : 'terminée'}`}
	/>

	{#if editing}
		<input
			class="edit-input"
			type="text"
			bind:value={draft}
			bind:this={inputEl}
			onblur={commitEdit}
			onkeydown={onKeydown}
		/>
	{:else}
		<span
			class="text"
			role="button"
			tabindex="0"
			ondblclick={startEdit}
			onkeydown={(e) => {
				if (e.key === 'Enter') startEdit();
			}}
		>
			{todo.text}
		</span>
	{/if}

	<button class="delete" onclick={() => ondelete(todo.id)} aria-label="Supprimer">✕</button>
</li>

<style>
	.item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid var(--border);
	}

	.item:last-child {
		border-bottom: none;
	}

	input[type='checkbox'] {
		width: 1.15rem;
		height: 1.15rem;
		accent-color: var(--accent);
		flex-shrink: 0;
		cursor: pointer;
	}

	.text {
		flex: 1;
		cursor: text;
		word-break: break-word;
	}

	.done .text {
		text-decoration: line-through;
		color: var(--text-muted);
	}

	.edit-input {
		flex: 1;
		font: inherit;
		color: inherit;
		background: transparent;
		border: 1px solid var(--accent);
		border-radius: 6px;
		padding: 0.2rem 0.4rem;
	}

	.delete {
		flex-shrink: 0;
		border: none;
		background: transparent;
		color: var(--text-muted);
		cursor: pointer;
		font-size: 1rem;
		line-height: 1;
		padding: 0.25rem;
		border-radius: 6px;
	}

	.delete:hover {
		color: var(--danger);
		background: color-mix(in srgb, var(--danger) 12%, transparent);
	}
</style>
