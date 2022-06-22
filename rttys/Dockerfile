FROM node:12 AS ui
WORKDIR /rttys
RUN git clone https://github.com/zhaojh329/rttys.git 
RUN cd /rttys/rttys/ui/ && npm install && npm run build

FROM golang:latest AS rttys
WORKDIR /rttys-build
COPY --from=ui /rttys/rttys/ /rttys-build
RUN CGO_ENABLED=0 \
    VersionPath="rttys/version" \
    GitCommit=$(git log --pretty=format:"%h" -1) \
    BuildTime=$(date +%FT%T%z) \
    go build -ldflags="-s -w -X $VersionPath.gitCommit=$GitCommit -X $VersionPath.buildTime=$BuildTime"

FROM alpine:latest
LABEL maintainer="Russell Leake <mail@gt3389b@gmail.com>"
COPY --from=rttys /rttys-build/rttys /usr/bin/rttys
RUN apk update && apk upgrade
RUN apk add --no-cache sqlite

ENV RTTYS_USERNAME="admin"
ENV RTTYS_PASSWORD="admin"
ENV RTTYS_TOKEN=""

EXPOSE 5912 5913

COPY entrypoint.sh /
COPY ca.crt /rttys/ca.crt
COPY server.crt /rttys/rttys.crt
COPY server.key /rttys/rttys.key
RUN chmod u+x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
