# Incident exercise: Node.js process recovery

## Environment
Local WSL lab; one Node.js process managed by PM2 in fork mode.
Application address: http://127.0.0.1:3001

## Failure simulation
Abruptly terminated the application process to simulate a crash.

## Expected behaviour
PM2 restarts the application after the configured restart delay.

## Observed evidence
- PM2 restart count increased from 0 to 1.
- Application returned to online status.
- Post-recovery PID: 183368.
- GET /health returned {"status":"ok"}.
- GET /version returned {"version":"local-dev"}.

## Limitations
- Exact recovery duration was not measured.
- Requests during recovery were not measured.
- One process means a temporary interruption is possible.
- This exercise tested process recovery, not server failure or reboot recovery.

## Learning
PM2 can recover an application process while the host and PM2 remain running.
