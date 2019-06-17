#!/usr/bin/env node

const program = require('commander')

program.option('--debug', 'debug mode', false)

program
  .command('fetch <areacode> <keyword> [site]')
  .description('爬取指定网站相关信息')
  .action(require('../lib'))

program.parse(process.argv)
