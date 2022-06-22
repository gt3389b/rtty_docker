#!/usr/bin/env sh

if [ "${RTTYS_TOKEN}" == "" ]; then 
    RTTYS_TOKEN=$(date +%s%N | md5sum | head -c 32); 
fi 

# Generate config file
echo "token: ${RTTYS_TOKEN}" >> /etc/rttys.conf
echo "ssl-cacert: /rttys/ca.crt" >> /etc/rttys.conf
echo "ssl-cert: /rttys/rttys.crt" >> /etc/rttys.conf
echo "ssl-key: /rttys/rttys.key" >> /etc/rttys.conf

cat /etc/rttys.conf

# Execute rttys
exec rttys run -c /etc/rttys.conf
