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