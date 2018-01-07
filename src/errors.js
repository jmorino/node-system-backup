export class FileNotFoundError    extends Error { get ERRNO() { return 1 }}
export class InvalidJSONFileError extends Error { get ERRNO() { return 2 }}
