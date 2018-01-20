import path from 'path'
import fs from 'fs'
import SimpleSchema from 'simpl-schema'
import { FileNotFoundError, InvalidJSONFileError, InvalidConfigurationError } from './errors'
import { CONFIG_PATH } from './defaults'

export default class Config {

	constructor(configPath) {
		configPath = path.resolve(configPath || process.env.BACKUP_CONFIG || CONFIG_PATH);

		try {
			const configRaw = fs.readFileSync(configPath, 'utf8');
			const config = JSON.parse(configRaw);
			Object.assign(this, this.validate(config));
		}
		catch(e) {
			if (e.code === 'ENOENT') { throw new FileNotFoundError(e); }
			throw new InvalidJSONFileError(`Invalid configuration file: ${e}.`);
		}

	}

	//=================================================================================================================

	validate(config) {
		const schema = new SimpleSchema({
			'compress': { type: Boolean, defaultValue: true },
			'verbose': { type: Boolean, defaultValue: false },

			'includes': { type: Array, defaultValue: [], minCount: 1 },
			'includes.$': { type: String, custom() {
				if (!path.isAbsolute(this.value)) {
					return 'Paths in "includes" field should be absolute';
				}
			}},
			'excludes': { type: Array, defaultValue: [] },
			'excludes.$': String,
			
			'storage': Object,
			'storage.type': { type: String, allowedValues: ['fs','nfs'] },
			'storage.path': String,
			'storage.server': { type: String, optional: true },
			'storage.user': { type: String, optional: true },
			'storage.mountPoint': { type: String, optional: true },
		});

		const validationContext = schema.newContext();
		const cleanConfig = schema.clean(config);
		validationContext.validate(cleanConfig);

		if (!validationContext.isValid()) {
			throw new InvalidConfigurationError(JSON.stringify(validationContext.validationErrors()));
		}

		return cleanConfig;
	}
}
