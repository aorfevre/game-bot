#!/bin/bash
git add .
git commit -m "update"
git push origin master


keypath=`pwd`"/../pem/aor-ohio-ec2-t2small.pem"
userEC2="ubuntu"
instanceEC2="3.12.222.35"
appname="rpartners-bot"


ssh -i $keypath $userEC2@$instanceEC2 -t -t './_pm2_'$appname'.sh'
# ssh -i $keypath $userEC2@$instanceEC2 -t -t 'sudo .'$appdir'/pm2_new.sh'


# docker run --restart always --name mongo -p 27017:27017 -d mongo

#
# keypath=`pwd`"/../pem/SnapDash.pem"
# userEC2="ubuntu"
# instanceEC2="3.16.150.176"
# ssh -i $keypath $userEC2@$instanceEC2
