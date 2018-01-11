export class FileNotFoundError         extends Error { get ERRNO() { return 1 }}
export class InvalidJSONFileError      extends Error { get ERRNO() { return 2 }}
export class InvalidConfigurationError extends Error { get ERRNO() { return 3 }}

export class BackupNotFoundError       extends Error { get ERRNO() { return 4 }}
export class NoFullBackupFoundError    extends Error { get ERRNO() { return 5 }}
