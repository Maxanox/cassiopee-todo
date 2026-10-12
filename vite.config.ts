import adapter from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	// Build metadata injected by the Dockerfile / CI (see APP_COMMIT, APP_TAG).
	define: {
		__APP_COMMIT__: JSON.stringify(process.env.APP_COMMIT ?? ''),
		__APP_TAG__: JSON.stringify(process.env.APP_TAG ?? '')
	},
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			// Standalone Node server, built into a production Docker image.
			// See https://svelte.dev/docs/kit/adapter-node for more information.
			adapter: adapter()
		})
	]
});
