import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
// import react from "@vitejs/plugin-react";

declare module "@remix-run/node" {
	interface Future {
		v3_singleFetch: true;
	}
}

export default defineConfig({
	css: {
		preprocessorOptions: {
			scss: {
				quietDeps: true,
			},
			sass: {
				silenceDeprecation: ["slash-dev"],
			},
		},
	},
	plugins: [
		remix({
			future: {
				v3_fetcherPersist: true,
				v3_relativeSplatPath: true,
				v3_throwAbortReason: true,
				v3_singleFetch: true,
				v3_lazyRouteDiscovery: true,
				// @ts-ignore
				v7_skipActionErrorRevalidation: true,
			},
			ignoredRouteFiles: ["**/*.scss"],
			serverDependenciesToBundle: [/^react-icons/],
		}),
		tsconfigPaths(),
		// react(),
	],
	optimizeDeps: { esbuildOptions: { target: "esnext" } },
	build: {
		target: "esnext",
	},
});
