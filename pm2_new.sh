#!/bin/bash
git reset --hard
git pull
pm2 delete rpartners-bot
pm2 start index.js --name rpartners-bot --max-memory-restart 500M --log-date-format 'DD-MM HH:mm:ss.SSS'
