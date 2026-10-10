# Exercise: Graceful shutdown with an active request

## Setup
- One Node.js process managed by PM2 in fork mode.
- Development-only /slow endpoint with a five-second response delay.
- Application shutdown deadline: eight seconds.
- PM2 kill timeout: ten seconds.

## Procedure
Started a request to /slow and requested a PM2 restart while it was active.

## Observed server logs
1. slow_request_started
2. shutdown_started
3. slow_response_sent
4. shutdown_complete
5. server_started

## Verification
The server finished sending the active response before shutdown completed.
The application health endpoint returned {"status":"ok"} after restart.
Client HTTP status and curl exit code for the overlapping request
have not yet been recorded in this report.

## Limitations
This does not demonstrate zero downtime.
New connections may fail while the single process restarts.
The response finish event alone does not prove client receipt.
