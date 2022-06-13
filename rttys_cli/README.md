# RTTYS Commandline Interface

## Build rttys_cli executable
```
npm -i -g pkg
npm run build
```

## Get a list of devices (JSON) and process with JQ
```
./rttys_cli -l -s rttys -p 5913 -u admin -w admin | jq .
```

## Connect to e45f01ace467
```
./rttys_cli -d "e45f01ace467" -s rttys -p 5913 -u admin -w admin 
```

## Send a command to 
```
./rttys_cli -d "e45f01ace467" -s $HOST -p 5913 -u admin -w admin -c 'ls' -r '["-la"]' -x root  -y root | jq ".stdout" | tr -d "\"" | base64 -d
```
