// Credit @lukeed https://github.com/lukeed/empathic/blob/main/scripts/build.ts

import oxc from 'npm:oxc-transform@^0.25';
import { join, resolve } from '@std/path';

import denoJson from '../deno.json' with { type: 'json' };

const outdir = resolve('npm');

let Inputs;
if (typeof denoJson.exports === 'string') Inputs = { '.': denoJson.exports };
else Inputs = denoJson.exports;

async function transform(name: string, filename: string) {
	if (name === '.') name = 'mod';
	name = name.replace(/^\.\//, '');

	let entry = resolve(filename);
	let source = await Deno.readTextFile(entry);

	let xform = oxc.transform(entry, source, {
		typescript: {
			onlyRemoveTypeImports: true,
			declaration: true,
		},
	});

	if (xform.errors.length > 0) bail('transform', xform.errors);

	let outfile = `${outdir}/${name}.d.ts`;
	console.log('> writing "%s" file', outfile);
	let outsource = xform.declaration!.replaceAll(/\.ts/g, '.js');
	await Deno.writeTextFile(outfile, outsource);

	outfile = `${outdir}/${name}.js`;
	console.log('> writing "%s" file', outfile);
	outsource = xform.sourceText.replaceAll(/\.ts/g, '.js');
	await Deno.writeTextFile(outfile, outsource);
}

if (exists(outdir)) {
	console.log('! removing "npm" directory');
	await Deno.remove(outdir, { recursive: true });
}
await Deno.mkdir(outdir);

for (let [name, filename] of Object.entries(Inputs)) await transform(name, filename);

await copy('package.json');
await copy('readme.md');
await copy('license');

// ---

function bail(label: string, errors: string[]): never {
	console.error('[%s] error(s)\n', label, errors.join(''));
	Deno.exit(1);
}

function exists(path: string) {
	try {
		Deno.statSync(path);
		return true;
	} catch (_) {
		return false;
	}
}

function copy(file: string) {
	if (exists(file)) {
		let outfile = join(outdir, file);
		console.log('> writing "%s" file', outfile);
		return Deno.copyFile(file, outfile);
	}
}
