# Build stage
FROM golang:1.23-alpine AS builder

WORKDIR /app
COPY realm-backend/go.mod realm-backend/go.sum ./
RUN go mod download

COPY realm-backend .
RUN CGO_ENABLED=0 GOOS=linux go build -o server cmd/server/main.go

# Runtime stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates
WORKDIR /root/

COPY --from=builder /app/server .

EXPOSE 8080

CMD ["./server"]