# build stage
FROM alpine:3.7 

RUN \
    apk add --no-cache cmake autoconf make musl-dev linux-headers gcc g++ openssl openssl-dev git cunit cunit-dev automake libtool util-linux-dev libev-dev && \
    apk add shadow && \
    mkdir -p /build

WORKDIR /

RUN usermod --unlock root

RUN cd /build && \
    git clone --recursive https://github.com/zhaojh329/rtty.git && \
    cd rtty && \
    mkdir build && \
    cd build && \
    cmake .. && \ 
    make && \
    make install

RUN cp /build/rtty/build/src/rtty /usr/bin

ENTRYPOINT [ "rtty" ]
