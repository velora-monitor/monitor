FROM golang:1.27.4-bookworm AS build

WORKDIR /src

COPY apps/worker/go.mod apps/worker/go.sum ./
RUN go mod download

COPY apps/worker/ ./
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/worker ./cmd/worker

FROM gcr.io/distroless/static-debian12:nonroot

ENV PROBE_MODE=off

COPY --from=build /out/worker /worker

USER nonroot:nonroot
ENTRYPOINT ["/worker"]
