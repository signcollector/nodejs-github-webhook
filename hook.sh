#!/bin/bash

git_pull_signcollector() {
  ssh-agent bash -c 'ssh-add /home/runner/.ssh/deploy; git pull origin master'
}
cd ~/deploy/signcollector/deployment/
git_pull_signcollector
./deploy.sh staging