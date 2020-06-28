#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const chokidar = require('chokidar')
const meow = require('meow')
const shortid = require('shortid');
const getIso8601z = require('../src/iso8601datetime')

const EDIT_TYPES = {
  ADD: 'ADD',
  CHANGE: 'CHANGE',
  REMOVE: 'REMOVE'
}


function appendLog(filepath, editType) {
  fs.appendFileSync(devclockLogPath, `${shortid.generate()}\t${Date.now()}\t${getIso8601z()}\t${filepath}\t${editType}\n`)
}

const cli = meow(`
    Usage
      $ devclock --watch src/**/*
 
    Options
      --watch, -w, the glob pattern of the files the watch

`, {
  flags: {
    watch: {
        type: 'string',
        alias: 'w',
        default: '**/*',
        isMultiple: false,
        isRequired: false
    }
  }
})

const cwd = process.cwd()
const projectPkg = path.join(cwd, 'package.json')

if (!fs.existsSync(projectPkg)) {
  console.log('Devclock must be launched from a NodeJS project that contains a package.json file.');
  process.exit()
}

const devclockFolderPath = path.join(cwd, 'devclock')
const devclockLogPath = path.join(devclockFolderPath, 'devclocklog.tsv')

// we create the devclock folder if it does not exist
if (!fs.existsSync(devclockFolderPath)) {
  fs.mkdirSync(devclockFolderPath)
}

// init the devclog log
if (!fs.existsSync(devclockLogPath)) {
  fs.appendFileSync(devclockLogPath, '# edit_id\ttimestamp\tiso8601\tfilepath\tedit_type\n')
}


// console.log(getIso8601z())
// console.log(shortid.generate())


const pattern = cli.flags.watch 

const watcher = chokidar.watch(pattern, {
  ignored: [
    /(^|[\/\\])\../,  // ignore dotfiles, node
    'node_modules',
    'devclock'
  ],
  persistent: true,
  ignoreInitial: true,
  cwd: process.cwd()
})


watcher
  .on('add', filepath => appendLog(filepath, EDIT_TYPES.ADD))
  .on('change', filepath => appendLog(filepath, EDIT_TYPES.CHANGE))
  .on('unlink', filepath => appendLog(filepath, EDIT_TYPES.REMOVE)) 