import { homedir } from 'os'
import path from 'path'


export const BACKUP_EXT = 'tar.gz';
export const CONFIG_PATH = path.resolve(homedir(), '.backup');
export const CONFIG_PATH_TEXT = '~/.backup';
