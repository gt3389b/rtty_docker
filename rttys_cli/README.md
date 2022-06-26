# RTTYS Commandline Interface

## Build rttys_cli executable
```
npm -i -g pkg
npm run build
```

## Get a list of devices (JSON) and process with JQ
```
./rttys_cli -s client.localhost -u admin -w admin list | jq .
```

## Connect to e45f01ace467
```
./rttys_cli -s localhost -p 5913 -u admin -w admin connect -d "docker_test_client"
```

## Send a command to 
```
% ./rttys_cli -s localhost -p 5913 -u admin -w admin command -d "docker_test_client" -c 'ls' -r '["-la"]' -x root  -y root  | jq ".stdout" | tr -d "\"" | base64 -d
```


## Receive a file
```
% ./rttys_cli -s localhost -p 5913 -u admin -w admin receive -d "docker_test_client" -i '~/TEST2' -o '/tmp'
```

## Send a file
```
% ./rttys_cli -s localhost -p 5913 -u admin -w admin send -d "docker_test_client" -i '/tmp/TEST' -o '/tmp/me'
```
