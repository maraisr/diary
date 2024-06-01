import { build, emptyDir } from '@deno/dnt';

await emptyDir('./npm');

await build({
	entryPoints: [
		'./lib/mod.ts',
		{
			name: './stream',
			path: './lib/stream.ts',
		},
		{
			name: './using',
			path: './lib/using.ts',
		},
		{
			name: './output.console',
			path: './lib/output.console.ts',
		},
		{
			name: './utils',
			path: './lib/utils.ts',
		},
	],
	outDir: './npm',
	shims: {
		deno: 'dev',
	},

	esModule: true,
	scriptModule: 'cjs',

	declaration: 'inline',
	declarationMap: false,

	typeCheck: 'both',
	skipSourceOutput: true,
	test: true,

	importMap: 'deno.json',

	package: {
		name: 'diary',
		version: Deno.args[0],
		description: 'Fast effective logging library for just about everything.',
		repository: 'maraisr/diary',
		license: 'MIT',
		author: {
			name: 'Marais Rososuw',
			email: 'me@marais.dev',
			url: 'https://marais.io',
		},
		sideEffects: false,
		keywords: [
			'fast',
			'logging',
			'utility',
			'middleware',
			'debug',
			'logger',
		],
	},

	compilerOptions: {
		target: 'ES2022',
		lib: ['ES2022', 'WebWorker'],
	},

	filterDiagnostic(diag) {
		let txt = diag.messageText.toString();
		// ignore type error for missing Deno built-in information

		return (
			!/Type 'ReadableStream<.*>' must have a/.test(txt) &&
			!txt.includes(`Type 'Timeout' is not assignable to type 'number'.`)
		);
	},

	async postBuild() {
		await Deno.copyFile('license', 'npm/license');
		await Deno.copyFile('readme.md', 'npm/readme.md');
	},
});
