#!/usr/bin/env bash
bin=`readlink "$0"`
if [ "$bin" == "" ]; then
 bin=$0
fi
bin=`dirname "$bin"`
bin=`cd "$bin"; pwd`

. "$bin"/chorus-config.sh

MAX_WAIT_TIME=$1

if [ -f $SCHEDULER_PID_FILE ]; then
  if kill -0 `cat $SCHEDULER_PID_FILE` > /dev/null 2>&1; then
    log_inline "stopping scheduler "
    kill `cat $SCHEDULER_PID_FILE` && rm $SCHEDULER_PID_FILE
    wait_for_stop_or_force $SCHEDULER_PID_FILE $MAX_WAIT_TIME
    rm -f $SCHEDULER_PID_FILE
  else
    log "could not stop scheduler. check that process `cat $SCHEDULER_PID_FILE` exists"
    exit 0
  fi
else
  log "no scheduler to stop"
fi
