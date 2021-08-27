const pkg = require('../package.json');
const esbuild = require('esbuild');

const externals = ['diary/utils', 'diary'];

const targets = ['browser', 'worker'];

async function bundle(input, files, env, neutral) {
	const is_neutral_block = Object.keys(files).some(i => targets.includes(i));

	for (let target of Object.keys(files)) {
		const is_neutral = neutral === undefined
			? !targets.includes(target)
			: neutral;

		if (!is_neutral && typeof files[target] === 'object') {
			await bundle(input, files[target], target, is_neutral);

			continue;
		}

		if (!env && is_neutral_block) env = 'node';

		const format = target === 'import' ? 'esm' : 'cjs';
		const platform = is_neutral ? 'neutral' : ((env === 'worker' ? 'browser' : env) || 'neutral');
		const trg = env || 'neutral';

		console.log('~> [%s] format: %s platform: %s target: %s', input, format, platform, trg);

		await esbuild.build({
			entryPoints: [input],
			bundle: true,
			format,
			platform,
			outfile: files[target],
			external: externals,
			minifySyntax: true,
			define: {
				__TARGET__: `"${trg}"`,
			},
		});
	}
}

Promise.all([
	bundle('src/index.ts', pkg.exports['.']),
	bundle('src/json.ts', pkg.exports['./json']),
	bundle('src/utils.ts', pkg.exports['./utils']),
	esbuild.build({
		entryPoints: ['src/index.ts'],
		bundle: true,
		format: 'cjs',
		platform: 'browser',
		outfile: 'diary/index.min.js',
		minify: true,
		external: externals,
		define: {
			__TARGET__: '"browser"',
		},
	}),
]);
