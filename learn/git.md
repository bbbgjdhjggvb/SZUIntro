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