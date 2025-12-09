# git分支管理
```bash
# 查看分支
git branch

# 创建并切换到新的分支
# 在新分支上进行添加内容和修改bug
git switch -c new-branch

# 切换分支
git switch other-branch

# 在主分支合并改好代码的分支
# 1. 先切换到主分支
git switch main
git merge other-branch
```

# git提交远程仓库
```bash
# 将修改，添加的文件提交到暂存区
git add changedfile newfile
# 将暂存区中的东西提交到本地仓库
git commit -m "提交内容简单介绍"
# 将主分支推送到远程仓库
git push https://github.com/bbbgjdhjggvb/SZUIntro.git main
```

# 远程仓库
```bash
# 给远程仓库连接起别名
git remote add szuintro https://github.com/bbbgjdhjggvb/SZUIntro.git
# 以后推送仓库就可以使用别名
git push szuintro main
# 从远程仓库中拉去同步
git pull szuintro
```

# 和远程仓库出现冲突时如何解决问题
1. 永远保持主分支是最新的，在合并新的功能分支之前，通过 `git pull szuintro main`保持主分支的最新

# 没有保持main分支最新并合并了功能分支，并删除了功能分支，要如何解决
1. 利用`reflag`找到在功能分支的最近一次提交的hash值(05fb1a3)
```sh
075e84e (HEAD -> main) HEAD@{0}: merge Distribution: Merge made by the 'ort' strategy.
6627280 HEAD@{1}: checkout: moving from Distribution to main
05fb1a3 HEAD@{2}: commit: 给校友分布会分布页面添加跳转功能
3f97eed HEAD@{3}: commit: 添加新的文件读取api
0c686f1 HEAD@{4}: checkout: moving from main to Distribution
```
2. 根据找到的hash值重建分支
```sh
git branch Distribution 05fb1a3
```
3. 撤销main分支的合并，将本地main分支重置到和远程分支一样
```sh
git reset --hard szuintro/main
```
4. 合并Distribution分支
```sh
git merge Distribution
```
5. 推送到远程仓库
```sh
git push szuintro main
```