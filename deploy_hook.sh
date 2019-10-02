#!/bin/bash

test -z "$1" && echo 'env name missing' && exit 1

ENV_NAME=$1

if [[ $ENV_NAME == 'staging' ]]; then
  git_pull_signcollector() {
    ssh-agent bash -c 'ssh-add /home/runner/.ssh/deploy; git pull origin master'
  }
  cd ~/deploy/signcollector-application/deployment/ || exit
  git_pull_signcollector

  ./deploy.sh staging --with-db

else
  # update configurations of a running campaign
  ./merge-deployment-configuration.sh $ENV_NAME --skip-credentials
fi