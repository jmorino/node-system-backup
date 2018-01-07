export function handleErrors(callback) {
	return function(...args) {
		try { callback(...args); }
		catch(e) {
			console.log(e.message);
			process.exit(e.ERRNO || 999);
		}
	}
}
