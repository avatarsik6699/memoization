import { fileURLToPath, URL } from 'node:url';

import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
	plugins: [
		reactRouter(),
		tailwindcss(),
		VitePWA({
			registerType: 'autoUpdate',
			includeAssets: ['offline.html', 'robots.txt'],
			manifest: {
				name: 'memoization',
				short_name: 'memoization',
				description: 'Offline-first local document editor',
				start_url: '/',
				scope: '/',
				display: 'standalone',
				background_color: '#f8fafc',
				theme_color: '#1f2937',
				icons: [
					{
						src: '/icon.svg',
						sizes: 'any',
						type: 'image/svg+xml',
						purpose: 'any maskable',
					},
				],
			},
			workbox: {
				navigateFallback: '/offline.html',
				globPatterns: ['**/*.{js,css,html,svg,png,ico,txt,woff2}'],
			},
		}),
	],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./app', import.meta.url)),
			'@shared': fileURLToPath(new URL('./app/shared', import.meta.url)),
			'@entities': fileURLToPath(new URL('./app/entities', import.meta.url)),
			'@widgets': fileURLToPath(new URL('./app/widgets', import.meta.url)),
		},
	},
	server: {
		port: 3000,
		host: '0.0.0.0',
	},
});
