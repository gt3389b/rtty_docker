
## Build the container
```
docker build -t rtty .  
```

## Run the container pointing to the rttys server
```
docker run -it --rm rtty -v -I test -h rttys -f root
```
