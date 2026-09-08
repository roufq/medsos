FROM golang:alpine AS builder

ENV GO111MODULE=on \
    CGO_ENABLED=0

WORKDIR /build
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build --ldflags "-s -w -extldflags -static" -o main .

FROM alpine:latest

WORKDIR /www

COPY --from=builder /build/main /www/
COPY --from=builder /build/resources/ /www/resources/
COPY --from=builder /build/frontend/dist/ /www/frontend/dist/

RUN addgroup -S app && adduser -S app -G app && mkdir -p /www/uploads /www/storage && chown -R app:app /www
USER app

ENTRYPOINT ["/www/main"]
