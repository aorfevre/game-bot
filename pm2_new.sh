#!/bin/bash
git reset --hard
git pull
pm2 delete ablock-tg-bot
pm2 start index.js --name ablock-tg-bot --max-memory-restart 1600M --log-date-format 'DD-MM HH:mm:ss.SSS'
