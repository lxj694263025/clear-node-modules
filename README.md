# @junerlee/clear-node-modules

递归扫描指定目录（含）及其所有子目录，删除目录名为 `.eden-mono` 或 `node_modules` 的目录。

命中目标目录时会使用 `rm -rf` 执行删除；如果某个目录删除或遍历失败，会先跳过并记录，等全部任务结束后统一输出异常结果。

## 使用方式

### 安装

```shell
npm install -g @junerlee/clear-node-modules
```

### 运行

删除当前目录下命中的目标目录。

```shell
clear-node-modules
```

删除指定目录下命中的目标目录。

```shell
clear-node-modules /Users/xxx/xxx
```

### 扫描目标

- `.eden-mono`
- `node_modules`
