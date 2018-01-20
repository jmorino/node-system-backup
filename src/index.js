#!/usr/bin/env node

import program from 'commander'
import { handleErrors } from './utils'
import Config from './Config'
import List from './List'
import BackupCreator from './BackupCreator'
import BackupRestorer from './BackupRestorer'
import BackupInspector from './BackupInspector'
import { CONFIG_PATH_TEXT } from './defaults'
import { getStorage } from './storage/factory'


program
	.version('0.1.0')
	.description('System backup manager');

program
	.command('backup')
	.description('perform a backup of the system')
	.option('-c, --config <file>', `set config file (default: ${CONFIG_PATH_TEXT})`)
	.option('-d, --dry-run', 'simulate the command but do not change anything')
	.option('-i, --incr', 'perform an incremental backup')
	.action(handleErrors((options) => {
		const config = new Config(options.config);
		const storage = getStorage(config.storage);

		storage.prepare(options);
		
		const backupCreator = new BackupCreator({ config, storage, options });
		backupCreator.backup();

		storage.clean(options);
	}));

program
	.command('restore <date>')
	.description('restore the system')
	.option('-c, --config <file>', `set config file (default: ${CONFIG_PATH_TEXT})`)
	.option('-d, --dry-run', 'simulate the command but do not change anything')
	.action(handleErrors((date, options) => {
		const config = new Config(options.config);
		const storage = getStorage(config.storage);

		storage.prepare(options);
		
		const backupRestorer = new BackupRestorer({ config, storage, options });
		backupRestorer.restore(date);

		storage.clean(options);
	}));

program
	.command('list')
	.description('list all available backups')
	.option('-c, --config <file>', `set config file (default: ${CONFIG_PATH_TEXT})`)
	.action(handleErrors((options) => {
		const config = new Config(options.config);
		const storage = getStorage(config.storage);

		storage.prepare(options);
		
		const list = new List(config, storage, options);
		list.display();

		storage.clean(options);
	}));

	program
	.command('inspect <date>')
	.description('inspect a backup')
	.option('-c, --config <file>', `set config file (default: ${CONFIG_PATH_TEXT})`)
	.action(handleErrors((date, options) => {
		const config = new Config(options.config);
		const storage = getStorage(config.storage);

		storage.prepare(options);
		
		const backupInspector = new BackupInspector({ config, storage, options });
		backupInspector.inspect(date);

		storage.clean(options);
	}));


program.parse(process.argv);

// default: no command
if (!process.argv.slice(2).length) {
	program.help();
}
