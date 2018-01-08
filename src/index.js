#!/usr/bin/env node

import program from 'commander'
import { handleErrors } from './utils'
import Config from './Config'
import List from './List'
import BackupCreator from './BackupCreator'


program
	.version('0.1.0')
	.description('System backup manager');

program
	.command('backup')
	.description('perform a backup of the system')
	.option('-c, --config <path>', 'set config path. defaults to /root/.backup/config.json')
	.option('-d, --dry-run', 'simulate the command but do not write any file')
	.option('-i, --incr', 'perform an incremental backup')
	.action(handleErrors((options) => {
		const config = new Config(options.config);
		const backupCreator = new BackupCreator({ config, options });
		backupCreator.backup();
	}));

program
	.command('restore <date>')
	.description('restore the system')
	.option('-c, --config <path>', 'set config path. defaults to /root/.backup/config.json')
	.option('-d, --dry-run', 'simulate the command but do not write any file')
	.action(handleErrors((date, options) => {
		console.log('restore @', date, options.config, options.dryRun);
	}));

program
	.command('list')
	.description('list all availbale backups')
	.option('-c, --config <path>', 'set config path. defaults to /root/.backup/config.json')
	.option('-d, --dry-run', 'simulate the command but do not write any file')
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
