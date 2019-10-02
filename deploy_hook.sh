#!/bin/bash
set -e

test -z "$1" && echo 'env name missing' && exit 1

git_pull_signcollector() {
  ssh-agent bash -c 'ssh-add /home/runner/.ssh/deploy; git pull origin master'
}

ENV_NAME=$1

cd ~/deploy/signcollector-application/deployment/ || exit
git_pull_signcollector

if [[ "$ENV_NAME" == 'staging' ]]; then
  # complete redeploy of staging env
  ./deploy.sh staging --with-db
else
  # update configurations of a running campaign
  ./merge-deployment-configuration.sh $ENV_NAME --skip-credentials
fi