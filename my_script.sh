#!/bin/sh -
echo "hello there"
echo "starting Pd..."
cd /home/pi/Downloads/pd-0.51-2/bin
echo pwd
pkill node
pd -nogui -rt /home/pi/Documents/pd2_repository/SVT.djungle3.pd &
sleep 10
node /home/pi/Documents/pd2_repository/gustavsnode.js
