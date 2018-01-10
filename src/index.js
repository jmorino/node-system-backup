#!/usr/bin/env node

import program from 'commander'
import { handleErrors } from './utils'
import Config from './Config'
import List from './List'
import BackupCreator from './BackupCreator'
import { CONFIG_PATH_TEXT } from './defaults'


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
		const backupCreator = new BackupCreator({ config, options });
		backupCreator.backup();
	}));

program
	.command('restore <date>')
	.description('restore the system')
	.option('-c, --config <file>', `set config file (default: ${CONFIG_PATH_TEXT})`)
	.option('-d, --dry-run', 'simulate the command but do not change anything')
	.action(handleErrors((date, options) => {
		console.log('restore @', date, options.config, options.dryRun);
	}));

program
	.command('list')
	.description('list all available backups')
	.option('-c, --config <file>', `set config file (default: ${CONFIG_PATH_TEXT})`)
	.option('-d, --dry-run', 'simulate the command but do not change anything')
	.action(handleErrors((options) => {
		const config = new Config(options.config);
		const list = new List(config, options);
		list.display();
	}));


program.parse(process.argv);

// default: no command
if (!process.argv.slice(2).length) {
	program.help();
}
