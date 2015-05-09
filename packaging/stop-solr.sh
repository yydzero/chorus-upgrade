#!/usr/bin/env bash
bin=`readlink "$0"`
if [ "$bin" == "" ]; then
 bin=$0
fi
bin=`dirname "$bin"`
bin=`cd "$bin"; pwd`

. "$bin"/chorus-config.sh

MAX_WAIT_TIME=$1

if [ -f $SOLR_PID_FILE ]; then
  if kill -0 `cat $SOLR_PID_FILE` > /dev/null 2>&1; then
    log_inline "stopping solr "
    kill `cat $SOLR_PID_FILE` && rm $SOLR_PID_FILE
    wait_for_stop_or_force $SOLR_PID_FILE $MAX_WAIT_TIME
    rm -f $SOLR_PID_FILE
  else
    log "could not stop solr. check that process `cat $SOLR_PID_FILE` exists"
    exit 0
  fi
else
  log "no solr to stop"
fi
