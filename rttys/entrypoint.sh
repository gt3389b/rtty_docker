#!/usr/bin/env sh

if [ "${RTTYS_TOKEN}" == "" ]; then 
    RTTYS_TOKEN=$(date +%s%N | md5sum | head -c 32); 
fi 

# Generate config file
echo "token: ${RTTYS_TOKEN}" >> /etc/rttys.conf
echo "ssl-cacert: /etc/rttys/rttys.ca" >> /etc/rttys.conf
echo "ssl-cert: /etc/rttys/rtty.crt" >> /etc/rttys.conf
echo "ssl-key: /etc/rttys/rtty.key" >> /etc/rttys.conf

cat /etc/rttys.conf

# Execute rttys
exec rttys run -c /etc/rttys.conf
