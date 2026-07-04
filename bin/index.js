#!/usr/bin/env node

const path = require('path');
const fs = require('fs');

const nodeModulesFilename = 'node_modules';

function clear(dir) {
  fs.readdirSync(dir).forEach((filename) => {
    const filepath = path.resolve(dir, filename);
    const stat = fs.statSync(filepath);
    if (!stat.isDirectory()) {
      return;
    }
    if (filename !== nodeModulesFilename) {
      clear(filepath);
      return;
    }
    console.log(`Deleting "${filepath}"...`);
    fs.rmdirSync(filepath, {
      recursive: true,
    });
  });
}

function getRootDir() {
  const [, , customPath] = process.argv;
  let root;
  if (customPath) {
    root = path.resolve(customPath);
    try {
      const stat = fs.statSync(root);
      if (!stat.isDirectory()) {
        throw new Error();
      }
    } catch (err) {
      console.error(`Directory "${customPath}" is not exist!`);
      process.exit(1);
    }
  } else {
    root = process.cwd();
  }
  return root;
}

clear(getRootDir());

console.log('Done!');
