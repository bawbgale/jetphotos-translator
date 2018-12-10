#!/bin/bash
if [ "$1" != "" ]; then
  echo "copying serverless-$1.yml to serverless.yml and running serverless deploy"
  cp serverless-$1.yml serverless.yml && sls deploy
else
    echo "Please append provider, like 'deploy.sh aws' or 'deploy.sh azure'"
fi