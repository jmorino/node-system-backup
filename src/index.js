#!/usr/bin/env node

import program from 'commander'


program
	.version('0.1.1')
	.description('System backup manager')
	.option('-d, --dry-run', 'simulate the command but do not write any file')
	.option('-c, --config <path>', 'set config path. defaults to /root/.backup/config.json');

program
	.command('backup [type]')
	.description('perform a backup of the system')
	.action((type, options) => {
		console.log(type, 'backup', options.config, options.dryRun);
	});

program
	.command('restore [date]')
	.description('restore the system')
	.action((date, options) => {
		console.log('restore @', date, options.config, options.dryRun);
	});

program
	.command('list')
	.description('list all availbale backups')
	.action((options) => {
		console.log('run list', options.config, options.dryRun);
	});


program.parse(process.argv);

// default: no command
if (!process.argv.slice(2).length) {
	program.help();
}
