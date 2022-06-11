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
./rttys_cli -d "e45f01ace467" -s rtts -p 5913 -u admin -w admin 
```
