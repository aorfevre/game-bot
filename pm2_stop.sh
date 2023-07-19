#!/bin/bash
keypath=`pwd`"/../pem/aor-ohio-ec2-t2small.pem"
userEC2="ubuntu"
instanceEC2="3.12.222.35"
project="rpartners-bot"
appname=$project

ssh -i $keypath $userEC2@$instanceEC2 -t -t 'sudo pm2 stop '$appname
npm restart
