#!/usr/bin/env node

import program from 'commander'
import { handleErrors } from './utils'
import Config from './Config'
import List from './List'


program
	.version('0.1.1')
	.description('System backup manager')
	.option('-d, --dry-run', 'simulate the command but do not write any file')
	.option('-c, --config <path>', 'set config path. defaults to /root/.backup/config.json');

program
	.command('backup [type]')
	.description('perform a backup of the system')
	.action(handleErrors((type, options) => {
		const config = new Config(options.config);
		console.log(type, 'backup', config, options.dryRun);
	}));

program
	.command('restore [date]')
	.description('restore the system')
	.action(handleErrors((date, options) => {
		console.log('restore @', date, options.config, options.dryRun);
	}));

program
	.command('list')
	.description('list all availbale backups')
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
