#!/bin/bash

git_pull_digiges_collector() {
  ssh-agent bash -c 'ssh-add /home/runner/.ssh/deploy; git pull origin master'
}
cd ~/deploy/digiges-collector/deployment/
git_pull_digiges_collector
./deploy.sh staging