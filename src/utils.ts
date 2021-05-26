export const sprintf = (message: string, ...extra: unknown[]) =>
	message.replace(/(\s+)(%[Oodifs](?=[^a-z0-9A-Z]|$))/g, (_, ws, pattern) => {
		let v = extra.shift() as string | undefined;

		if (/[Oo]/.test(pattern) && typeof v === 'object') v = JSON.stringify(v);
		else if (/[di]/.test(pattern) && v) v = v.toString().replace(/\..*$/, '');

		return ws + v;
	});
