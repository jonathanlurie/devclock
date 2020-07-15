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


const cwd = process.cwd()
const projectPkg = path.join(cwd, 'package.json')
const gitHEAD = path.join(cwd, '.git', 'HEAD')
let usesGit = false

if (fs.existsSync(gitHEAD)) {
  usesGit = true
}


function getGitInfo() {
  if (!usesGit) {
    return 'null'
  }
  
  const HEADfile = fs.readFileSync(gitHEAD, 'utf8').trim()
  const branchName = HEADfile.split('/').pop()
  const commitHashFilePath = path.join(cwd, '.git', HEADfile.split(' ').pop())
  const commitHash = fs.readFileSync(commitHashFilePath, 'utf8').trim()
  return `${branchName}/${commitHash}`
}


function appendLog(filepath, editType) {
  // take info from package.json
  const pkg = JSON.parse(fs.readFileSync(projectPkg))

  // take info from
  let gitInfo = getGitInfo() 

  fs.appendFileSync(devclockLogPath, `${shortid.generate()}\t${Date.now()}\t${getIso8601z()}\t${pkg.name}\t${pkg.version}\t${filepath}\t${editType}\t${gitInfo}\n`)
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
  fs.appendFileSync(devclockLogPath, '# edit_id\ttimestamp\tiso8601\tpackage_name\tpackage_version\tfilepath\tedit_type\tgit_branch_and_last_commit_hash\n')
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

console.log('Watching', path.join(cwd, pattern), ' ...')
