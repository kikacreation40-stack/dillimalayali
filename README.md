# Delhi Malayali World

A tiny low-poly Delhi where Malayalis can meet. The MVP includes the nine development phases: a procedural world, live multiplayer, guest profiles, proximity text chat, vehicles, touch controls, and basic community tools. No account, real-world location, phone number, email, voice, or video is required.

## Install and run

Use Node.js 22.12+ and npm.

```sh
npm install
cp .env.example .env
```

Start the frontend and backend in separate terminals:

```sh
npm run dev
```

```sh
npm run server:dev
```

Open http://localhost:5173. Enter a display name and Kerala district, or choose “Prefer not to show hometown.” Each browser connection has its own server-generated player ID, so two tabs can join with different names. A guest identifier and the most recently used profile are saved locally; they are not authentication credentials. Choose a Male or Female avatar before entering; the low-poly hairstyle and outfit change accordingly. You can change it later in the menu with Save settings. The choice is remembered locally and synchronized to other players. Joining spawns you in Community Park.

Both processes are required. When the server is unavailable, movement stops and the interface shows connection status. The client automatically reconnects after a network interruption; the menu also has a Reconnect button. A reconnect creates a new temporary player session at the park.

## Controls

| Action | Desktop | Touch |
| --- | --- | --- |
| Walk | WASD / arrow keys | Left joystick |
| Run | Hold Shift | Extend joystick fully |
| Camera | Drag scene; wheel to zoom | Drag scene on the right |
| Talk | E or TALK button, within 5 units | TALK button |
| Type | Enter | Chat button |
| Drive / exit | F or button | DRIVE / EXIT button |
| Accelerate / reverse | W / S | Joystick up / down |
| Steer | A / D | Joystick left / right |
| Menu | Esc | Menu button |

Click the world to leave the chat input and walk while chatting. A conversation ends beyond 8 units or when a participant disconnects, disables talk, mutes, or blocks the other person. There is no global chat. Enter does not send an unsolicited message; TALK must open a nearby conversation first.

Touch controls appear automatically on touch devices and can also be enabled in the menu. Losing focus or opening the menu clears movement input and stops a driven vehicle. The world itself continues for other players.

## Teleport between landmarks

Use the **Teleport** button beside Map, then choose Community Park, India Gate, Connaught Place, Chandni Chowk, Red Fort, or Delhi Metro. For example, choose Red Fort, then choose India Gate to travel directly between them. Arrival points are fixed, walkable positions near each landmark. Teleporting ends nearby chat, exits your vehicle (leaving it parked at the departure point), and updates your position for all players. A one-second cooldown prevents repeated requests. Normal movement resumes at the destination.

## World and social features

- India Gate, Red Fort, Connaught Place, Chandni Chowk, Delhi Metro, and Malayali Community Park are fictionalized primitive geometry connected by avenues.
- The compact 600-unit boundary takes roughly 3–5 minutes to cross on foot, depending on route. Walk speed is 2.6 units/second; running and driving are faster.
- The map marks landmarks and your **virtual** position. Signs and location notifications help navigation. No browser geolocation API is used.
- Online guests have randomized clothing colors, interpolated motion, and privacy-aware name tags.
- Name and hometown visibility are stripped from server broadcasts when disabled. The online panel and chat title use only these public fields.
- Text messages are limited to 280 characters and rate-limited. Messages are rendered as text, not HTML. Optional sound is a short chat notification, off by default.
- Auto-rickshaws and cars have one driver each. Ownership is enforced on the server and released when the driver exits or disconnects.
- Online panel: Mute, Block, and Report. Mute and Block are **connection-scoped** and end direct chat with that guest. Reconnection clears them. Guest-only identity cannot prevent someone rejoining under another session; durable enforcement needs future authentication.
- Reports require a reason and are appended to `REPORT_DIR/reports.jsonl` with session IDs, time, and virtual zone. Acknowledgment occurs after storage succeeds. Reports are limited to one per 30 seconds. There is no moderation dashboard or live review service.

## Build and tests

```sh
npm run typecheck
npm run build
npm test
```

`build` checks frontend TypeScript, compiles the backend to `dist-server/`, and builds the frontend to `dist/`. Run the build before tests because integration tests start the compiled server.

Tests cover profile validation, privacy redaction, chat delivery and distance, mute/block, report persistence, concurrent vehicle ownership, vehicle movement and release, malformed movement, teleport rejection, disconnects, the 30-player capacity, and basic walking/vehicle collision. Tests use an isolated temporary server and report directory.

```sh
npm run server
npm run preview
```

For preview, add `http://localhost:4173` to `CLIENT_ORIGIN` before starting the server. The health endpoint is `GET /health`.

## Two devices on your local network

1. Both devices must be on the same LAN.
2. Set `VITE_SERVER_URL` to `http://YOUR_COMPUTER_LAN_IP:3001` and add `http://YOUR_COMPUTER_LAN_IP:5173` to `CLIENT_ORIGIN` in `.env`.
3. Restart both development processes. Open `http://YOUR_COMPUTER_LAN_IP:5173` on each device.
4. Allow the development ports through your local firewall if prompted. A phone’s `localhost` refers to that phone, not the computer.

## Public deployment

No public deployment is included in the local implementation.

**Frontend** — For Vercel, Netlify, Cloudflare Pages, or another static host, install with `npm ci`, build with `npm run build`, and publish `dist`. Set `VITE_SERVER_URL=https://YOUR_NODE_HOST` before building. Vite embeds this public URL; changing it requires a new frontend build. Never put secrets in `VITE_` variables.

**Backend** — Use a Node host that supports long-lived HTTP/WebSocket processes. Install with `npm ci`, build with `npm run build`, and start with `npm run server`. Configure `PORT` if required by the host, and set `CLIENT_ORIGIN=https://YOUR_FRONTEND_HOST` (comma-separated for several exact origins). The host must forward Socket.IO polling and WebSocket upgrade requests on `/socket.io/`. Use HTTPS for both services. A static or request-only serverless host cannot run this persistent multiplayer process.

Run **one backend instance** for this MVP. Players, vehicles, chat relationships, mute, and block state are in memory. Restarting resets the world. Multiple independent replicas would create separate worlds; a shared adapter/state layer is intentionally out of scope.

Set `REPORT_DIR` to a private persistent volume if reports must survive deployments. Do not serve the report directory through the frontend or Express. Configure log/report retention on the host. The default exact-origin allowlist is for localhost development; production never needs `*`.

## Architecture and performance

- `client/src/game`: world, landmarks, avatar, movement, collision, camera, remote players, and vehicles.
- `client/src/network`: Socket.IO connection and movement transport.
- `client/src/ui`: login, name tags, proximity chat, mobile controls, community tools, and map.
- `server`: Express/Socket.IO entry point, profile validation, chat, vehicles, moderation.
- `shared`: wire types, district/landmark data, and gameplay constants.
- `tests`: isolated multiplayer integration and movement checks.
- `sources/`: read-only synced reference material.

Movement and snapshots run at 12 Hz, separate from rendering. Remote movement is interpolated. The world batches static boxes by material and instances trees, caps pixel ratio at 1.5, shares simple materials, and uses fog and a fixed daytime scene. There are no downloaded 3D assets, external fonts, post-processing, real-time shadows, or physics libraries. Three.js is isolated in a cacheable build chunk.

The server validates payloads, movement budgets, boundaries, proximity, and vehicle ownership. Building collisions are client-side in this MVP; it is not a cheat-resistant authoritative physics server. No durable authentication, moderation enforcement across sessions, chat history database, voice/video, global chat, speech bubbles, or real-world GPS is implemented.

Local checks do not establish production mobile frame rates or internet latency. Before a public launch, test the deployed HTTPS frontend/backend on two physical devices, then a small community group. The 30-client automated test checks correctness and capacity, not a long-running load or device benchmark.
