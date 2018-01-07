import path from 'path'
import fs from 'fs'
import { FileNotFoundError, InvalidJSONFileError, InvalidConfigurationError } from './errors'


const DEFAULT_CONFIG_PATH = './config.json';

export default class Config {

	constructor(configPath) {
		configPath = path.resolve(configPath || process.env.BACKUP_CONFIG || DEFAULT_CONFIG_PATH);

		try {
			const configRaw = fs.readFileSync(configPath, 'utf8');
			const config = JSON.parse(configRaw);
			Object.assign(this, config);
		}
		catch(e) {
			if (e.code === 'ENOENT') { throw new FileNotFoundError(e); }
			throw new InvalidJSONFileError(`Invalid configuration file: ${e}.`);
		}

		this.validate();
	}

	validate() {
		// mandatory keys
		['backupDir', 'target'].forEach(key => {
			if (!this[key]) {
				throw new InvalidConfigurationError(`Missing configuration entry: "${key}" is mandatory.`);
			}
		});

		// TODO finish this
	}
}
