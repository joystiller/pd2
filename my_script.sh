#!/bin/sh -
echo "hello there"
echo "starting Pd..."
pd-l2ork /home/pi/Documents/pd2_repository/SVT.djungle3.pd &
sleep 10
node /home/pi/Documents/pd2_repository/gustavsnode.js
