#!/bin/bash
INFO=`./client get-certifications`
# CERTID=`./client get-certifications | jq -s "[.[] | .certificateId]"`
#ATTRIBUTES=`echo $INFO | jq .schema | jq keys[]`
#ATTR_LENGTH=`echo $INFO | jq .schema | jq length`

APP_DIR=$PWD/tmp/app

apps=[]

for f in $APP_DIR/*; do
  apps=(${apps[@]} "$f")
done

i=0
for row in $(echo "$INFO" | jq -r '@base64'); do
  CERTID=`echo $row | base64 --decode | jq -r .certificateId`
  ./client register --application="$APP_DIR/$CERTID.json" $CERTID
  ((i++))
done
