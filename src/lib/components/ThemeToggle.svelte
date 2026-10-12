<script lang="ts">
	import { onMount } from 'svelte';

	let theme = $state<'light' | 'dark'>('light');

	onMount(() => {
		const set = document.documentElement.dataset.theme;
		theme =
			set === 'light' || set === 'dark'
				? set
				: matchMedia('(prefers-color-scheme: dark)').matches
					? 'dark'
					: 'light';
	});

	function toggle() {
		theme = theme === 'dark' ? 'light' : 'dark';
		document.documentElement.dataset.theme = theme;
		try {
			localStorage.setItem('theme', theme);
		} catch {}
	}
</script>

<button
	class="toggle"
	onclick={toggle}
	aria-label={theme === 'dark' ? 'Passer au thème clair' : 'Passer au thème sombre'}
	title={theme === 'dark' ? 'Thème clair' : 'Thème sombre'}
>
	{theme === 'dark' ? '☀️' : '🌙'}
</button>

<style>
	.toggle {
		font-size: 1.1rem;
		line-height: 1;
		padding: 0.45rem 0.55rem;
		border-radius: var(--radius);
		border: 1px solid var(--border);
		background: var(--surface);
		cursor: pointer;
	}
</style>
