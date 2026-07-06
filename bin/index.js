#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');

const targetDirnames = new Set([
  '.eden-mono',
  'node_modules',
]);

function formatError(error) {
  if (!error) {
    return '未知错误';
  }
  if (error.message) {
    return error.message;
  }
  return String(error);
}

function removeDir(dir, failedDirs) {
  console.log(`正在删除 "${dir}"...`);
  const result = spawnSync('rm', ['-rf', dir], {
    encoding: 'utf8',
  });

  if (result.error || result.status !== 0) {
    const errorMessage = result.error
      ? formatError(result.error)
      : (result.stderr || result.stdout || `rm 退出码为 ${result.status}`).trim();
    failedDirs.push({
      dir,
      reason: errorMessage,
    });
  }
}

function clear(dir, failedDirs) {
  const currentDir = path.resolve(dir);

  // 命中目标目录后直接删除，避免继续遍历已匹配目录的子目录。
  if (targetDirnames.has(path.basename(currentDir))) {
    removeDir(currentDir, failedDirs);
    return;
  }

  let dirEntries;
  try {
    dirEntries = fs.readdirSync(currentDir, {
      withFileTypes: true,
    });
  } catch (error) {
    failedDirs.push({
      dir: currentDir,
      reason: `遍历目录失败：${formatError(error)}`,
    });
    return;
  }

  dirEntries.forEach((dirEntry) => {
    if (!dirEntry.isDirectory()) {
      return;
    }
    clear(path.join(currentDir, dirEntry.name), failedDirs);
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
      console.error(`目录 "${customPath}" 不存在或不可访问。`);
      process.exit(1);
    }
  } else {
    root = process.cwd();
  }
  return root;
}

function printFailedDirs(failedDirs) {
  if (failedDirs.length === 0) {
    console.log('执行完成，未发现异常。');
    return;
  }

  console.error('\n以下目录处理失败：');
  failedDirs.forEach(({ dir, reason }) => {
    console.error(`- ${dir}`);
    console.error(`  原因：${reason}`);
  });
  process.exitCode = 1;
}

const failedDirs = [];
clear(getRootDir(), failedDirs);
printFailedDirs(failedDirs);
