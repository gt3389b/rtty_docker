## Introduction

rttys - Access your device's terminal from anywhere via the web. Client solution is at: https://github.com/zhaojh329/rtty.

This repo is to build rttys docker image.

## Volumes
- rttys.crt, rttys.key are certs, keys for SSL communication between client, server

## Ports

- Port 5912: listening to `rtty` client. This port should be exposed outside of your network to let clients connect to.
- Port 5913: web interface port where use can do remote to client. This should be routed via Nginx proxy if you want to login to domain.

## Environment

- RTTYS_USERNAME: username to login RTTYS web
- RTTYS_PASSWORD: password of `RTTYS_USERNAME` user
- RTTYS_TOKEN: RTTYS token - client needs to have this token, in order to connect to RTTYS.

## Usage

Docker-compose file:

```
version: '3.1'
services:
  rttys:
    image: bacnh85/rttys
    container_name: rttys
    restart: unless-stopped
    ports:
      - 5912:5912
      - 5913:5913
    environment:
      - RTTYS_USERNAME=admin
      - RTTYS_PASSWORD=4wjSYTEDrxb2dX4f
      - RTTYS_TOKEN=0bc51b8495a39d6b8bcfc149deac5289
    volumes:
      - ./rttys/rttys.crt:/etc/rttys.crt
      - ./rttys/rttys.key:/etc/rttys.key
      - /etc/localtime:/etc/localtime:ro
```