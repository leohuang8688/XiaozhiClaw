import WebSocket, { WebSocketServer } from "ws";
import type { ChannelContext } from "openclaw/plugin-sdk";

interface XiaoZhiMessage {
  type: string;
  state?: string;
  text?: string;
  audio?: Buffer;
}

let wss: WebSocketServer | null = null;
const clients = new Map<string, WebSocket>();

export function startXiaozhiWebSocketServer(
  port: number,
  ctx: ChannelContext
) {
  wss = new WebSocketServer({ port });

  wss.on("connection", (ws: WebSocket, req) => {
    const deviceId = req.url?.split("?")[0].slice(1) || "unknown";
    console.log(`XiaoZhi device connected: ${deviceId}`);
    clients.set(deviceId, ws);

    ws.on("message", async (data: Buffer) => {
      try {
        const message: XiaoZhiMessage = JSON.parse(data.toString());
        await handleXiaozhiMessage(deviceId, message, ctx);
      } catch (error) {
        // Binary audio data
        console.log(`Received audio from ${deviceId}: ${data.length} bytes`);
        // TODO: Process audio through STT
      }
    });

    ws.on("close", () => {
      console.log(`XiaoZhi device disconnected: ${deviceId}`);
      clients.delete(deviceId);
    });

    // Send hello response
    ws.send(JSON.stringify({
      type: "hello",
      transport: "websocket",
      audio_params: { format: "opus", sample_rate: 16000, frame_duration: 60 }
    }));
  });

  console.log(`XiaoZhi WebSocket server listening on port ${port}`);
}

async function handleXiaozhiMessage(
  deviceId: string,
  message: XiaoZhiMessage,
  ctx: ChannelContext
) {
  console.log(`Message from ${deviceId}:`, message);

  if (message.type === "listen" && message.state === "stop") {
    // User finished speaking, process STT and get AI response
    const userText = message.text || "Hello PocketAI!";
    
    // Send to OpenClaw for processing
    const response = await ctx.agent.processMessage({
      from: deviceId,
      text: userText,
      channel: "xiaozhi",
    });

    // Send TTS response back
    if (response && response.text) {
      sendTTSResponse(deviceId, response.text);
    }
  }
}

function sendTTSResponse(deviceId: string, text: string) {
  const ws = clients.get(deviceId);
  if (!ws) {
    console.log(`Device ${deviceId} not connected`);
    return;
  }

  // Send TTS start
  ws.send(JSON.stringify({
    type: "tts",
    state: "start",
    text: text
  }));

  // TODO: Generate audio and send as binary frames
  // For now, just send stop
  setTimeout(() => {
    ws.send(JSON.stringify({
      type: "tts",
      state: "stop"
    }));
  }, 1000);
}

export function stopXiaozhiWebSocketServer() {
  if (wss) {
    wss.close();
    wss = null;
  }
}
