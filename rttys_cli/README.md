


## Get a list of devices (JSON) and process with JQ
```
./rtty_cli -l -s rttys -p 5913 -u admin -w admin | jq .
```

## Connect to e45f01ace467
```
./rtty_cli -d "e45f01ace467" -s rtts -p 5913 -u admin -w admin 
```
