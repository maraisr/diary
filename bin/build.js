const pkg = require('../package.json');
const esbuild = require('esbuild');

const externals = ['diary/utils'];

/**
 * @param {string} input
 * @param {Record<'import'|'require', string>} files
 */
async function bundle(input, files) {
	await esbuild.build({
		entryPoints: [input],
		bundle: true,
		format: 'esm',
		platform: 'neutral',
		outfile: files.import,
		external: externals,
	});

	await esbuild.build({
		entryPoints: [input],
		bundle: true,
		format: 'cjs',
		platform: 'neutral',
		outfile: files.require,
		external: externals,
	});
}

Promise.all([
	bundle('src/diary.ts', pkg.exports['.']),
	bundle('src/json.ts', pkg.exports['./json']),
	bundle('src/utils.ts', pkg.exports['./utils']),
	esbuild.build({
		entryPoints: ['src/diary.ts'],
		bundle: true,
		format: 'cjs',
		platform: 'browser',
		outfile: 'diary/index.min.js',
		minify: true,
		external: externals,
	}),
]);
