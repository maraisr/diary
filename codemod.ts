// @deno-types="npm:@types/jscodeshift"
import {
    API,
    ASTPath,
    CallExpression,
    FileInfo,
    ImportSpecifier,
    ObjectExpression
} from "npm:jscodeshift";

let DIARY_LEVELS = ["debug", "log", "info", "warn", "error", "fatal"];

export default function transform(file: FileInfo, api: API, options: any) {
	let j = api.jscodeshift;
	let root = j(file.source);

	let diary_imports = root.find(j.ImportDeclaration, {
		source: {
			type: "Literal",
			value: "diary",
		},
	});

	let log_ident = j.identifier("log");

	for (let path of diary_imports.paths()) {
		let specifiers = path.node.specifiers!;

		for (let specifier of specifiers) {
			if (specifier.type !== "ImportSpecifier") continue;

			if (DIARY_LEVELS.includes(specifier.imported.name)) {
				process_level_import(specifier);
			}
		}
	}

    diary_imports.at(-1).insertBefore(
        j.template.statements`
        import { diary } from 'diary';
        import { plain } from 'diary/output.console';
        `
    );

    diary_imports.remove();

	let body_start = root.find(j.ImportDeclaration).at(-1);

	body_start.insertAfter(j.template.statement`const ${log_ident} = diary(plain);`);

	return root.toSource();

	// ---

	function process_level_import(specifier: ImportSpecifier) {
		let level = specifier.imported.name;

		let log_callers = root.find(j.CallExpression, {
			callee: {
				name: specifier.local?.name ?? specifier.imported.name,
				type: "Identifier",
			},
		});

		for (let log_caller of log_callers.paths()) {
			create_diary_call(log_caller, level);
		}
	}

	function create_diary_call(path: ASTPath<CallExpression>, level: string) {
		let args = path.node.arguments;
		path.node.callee = log_ident;

		if (args.length === 1) {
			if (
				args[0].type === "NewExpression" &&
				args[0].callee.type === "Identifier" &&
				args[0].callee.name === "Error"
			) {
				path.node.arguments = [
					j.literal(level),
					j.literal("{error}"),
					j.template.statement`{error: ${args[0]}}`,
				];
			} else if (args[0].type === "Identifier") {
				path.node.arguments = [j.literal(level), j.literal("{message}"), args[0]];
			} else {
				path.node.arguments = [j.literal(level), ...args];
			}
		} else {
			let [message, ...props] = args;
			if (message.type !== "Literal")
				throw new Error("Message must be a literal");

			let new_message = j.stringLiteral("");
			let new_props = j.objectExpression.from({
				properties: [],
			});

			let segs = (message.value as string).split(/\%([oOifs])/g);
			for (var i = 0; i < segs.length; i += 2) {
				let s = segs[i];
				new_message.value += s;

				if (i === segs.length - 1) break;
				let prop_index = i / 2;
				let prop = props[prop_index];

				let name = diary_set_log_member_object(
					new_props,
					prop,
					prop_index
				);
				new_message.value += `{${name}}`;
			}

			for (let j = i / 2; j < props.length; j++) {
				let prop = props[j];
				diary_set_log_member_object(new_props, prop, j);
			}

			let all_numbers = new_props.properties.every((p) => {
				if (p.type !== "ObjectProperty") return false;
				if (p.key.type !== "Literal") return false;

				return typeof p.key.value == "number";
			});

			if (all_numbers) {
				new_props = j.arrayExpression(
					new_props.properties.map((p) => {
						return p.value;
					})
				);
			}

			path.node.arguments = [j.literal(level), new_message, new_props];
		}
	}

	function diary_set_log_member_object(
		target: ObjectExpression,
		prop: any,
		props_index: number
	) {
        if (prop.type === 'SpreadElement') {
            throw new Error('Spread elements are not supported');
        }
        
		switch (prop.type) {
			case "Identifier": {
				target.properties.push(
					j.objectProperty.from({
						key: prop,
						value: prop,
						shorthand: true,
					})
				);
				return prop.name;
			}
			default:
				target.properties.push(
					j.objectProperty(j.literal(props_index), prop)
				);
				return String(props_index);
		}
	}
}

function find_parent<T>(node: ASTPath<any>, type: T): T | undefined {
    console.log(node, type);
	if (!node.parent) return undefined;
	if (node.parent.type === type) return node.parent;

	return find_parent(node.parent, type);
}
