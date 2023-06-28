import { define } from 'bundt/config';

const is_node = (condition: string) => !~condition.indexOf('.');

export default define((input, options) => {
	options.treeShaking = true;

	if (input.export === '.') {
		const target = is_node(input.condition)
			? 'node'
			: input.condition.split('.')[0];

		options.define = {
			__TARGET__: `"${target}"`,
		};

		if (target === 'node') {
			options.banner = {
				js: "import { format as _FORMAT } from 'util';",
			};
		}
	}

	return options;
});
