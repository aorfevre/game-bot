#!/bin/bash


keypath=`pwd`"/../pem/aor-ohio-ec2-t2small.pem"
userEC2="ubuntu"
instanceEC2="3.12.222.35"

### LTO NODE
# instanceEC2="18.225.22.181"

ssh -i $keypath $userEC2@$instanceEC2


## ARNIE node
# PWD : 5$YpaF=PL4WSz4*=
# ssh root@95.179.232.24
