import WebSocket, { WebSocketServer } from "ws";
import type { ChannelContext } from "openclaw/plugin-sdk";
import { createAudioStream, type AudioConfig } from "./audio-stream.js";

interface XiaoZhiMessage {
  type: string;
  state?: string;
  text?: string;
  audio?: Buffer;
}

interface DeviceSession {
  ws: WebSocket;
  audioStream: any;
  audioBuffer: Buffer[];
  isListening: boolean;
}

let wss: WebSocketServer | null = null;
const clients = new Map<string, DeviceSession>();
const AUDIO_CONFIG: AudioConfig = {
  sampleRate: 16000,
  frameDuration: 60,
  channels: 1,
};

export function startXiaozhiWebSocketServer(
  port: number,
  ctx: ChannelContext
) {
  wss = new WebSocketServer({ port });

  wss.on("connection", (ws: WebSocket, req) => {
    const deviceId = req.url?.split("?")[0].slice(1) || "unknown";
    console.log(`🎤 XiaoZhi device connected: ${deviceId}`);
    
    const audioStream = createAudioStream(AUDIO_CONFIG);
    clients.set(deviceId, {
      ws,
      audioStream,
      audioBuffer: [],
      isListening: false,
    });

    ws.on("message", async (data: Buffer) => {
      try {
        const message: XiaoZhiMessage = JSON.parse(data.toString());
        await handleXiaozhiMessage(deviceId, message, ctx);
      } catch (error) {
        // Binary audio data - process through Opus decoder
        const session = clients.get(deviceId);
        if (session && session.isListening) {
          session.audioBuffer.push(data);
          // Decode and buffer for STT processing
          try {
            const pcm = session.audioStream.decodeOpus(data);
            // Buffer PCM data for later STT processing
          } catch (err) {
            console.error("Opus decode error:", err);
          }
        }
      }
    });

    ws.on("close", () => {
      console.log(`🔌 XiaoZhi device disconnected: ${deviceId}`);
      const session = clients.get(deviceId);
      if (session) {
        session.audioStream.cleanup();
      }
      clients.delete(deviceId);
    });

    // Send hello response
    ws.send(JSON.stringify({
      type: "hello",
      transport: "websocket",
      audio_params: AUDIO_CONFIG
    }));
  });

  console.log(`🚀 XiaoZhi WebSocket server listening on port ${port}`);
}

async function handleXiaozhiMessage(
  deviceId: string,
  message: XiaoZhiMessage,
  ctx: ChannelContext
) {
  console.log(`💬 Message from ${deviceId}:`, message.type, message.state);

  if (message.type === "listen") {
    const session = clients.get(deviceId);
    if (!session) return;

    if (message.state === "start") {
      // Start listening
      session.isListening = true;
      session.audioBuffer = [];
      console.log(`🎤 Start listening from ${deviceId}`);
    } else if (message.state === "stop") {
      // Stop listening and process
      session.isListening = false;
      console.log(`⏹️ Stop listening from ${deviceId}`);
      
      // Get transcribed text (from firmware or process locally)
      const userText = message.text || "Hello PocketAI!";
      
      // Send to OpenClaw for processing
      const response = await ctx.agent.processMessage({
        from: deviceId,
        text: userText,
        channel: "xiaozhi",
      });

      // Send TTS response back
      if (response && response.text) {
        await sendTTSResponse(deviceId, response.text);
      }
    }
  }
}

async function sendTTSResponse(deviceId: string, text: string) {
  const session = clients.get(deviceId);
  if (!session) {
    console.log(`❌ Device ${deviceId} not connected`);
    return;
  }

  console.log(`🔊 Sending TTS response: "${text}"`);

  // Send TTS start
  session.ws.send(JSON.stringify({
    type: "tts",
    state: "start",
    text: text
  }));

  // TODO: Integrate with TTS service (OpenAI/ElevenLabs)
  // For now, simulate audio streaming
  try {
    // In production:
    // 1. Call TTS API to get audio
    // 2. Encode to Opus
    // 3. Stream binary frames to device
    
    // Simulate TTS delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Send TTS stop
    session.ws.send(JSON.stringify({
      type: "tts",
      state: "stop"
    }));
    
    console.log(`✅ TTS response complete`);
  } catch (error) {
    console.error("TTS error:", error);
    session.ws.send(JSON.stringify({
      type: "tts",
      state: "stop"
    }));
  }
}

export function stopXiaozhiWebSocketServer() {
  if (wss) {
    wss.close();
    wss = null;
  }
  // Cleanup all sessions
  clients.forEach((session) => {
    session.audioStream.cleanup();
  });
  clients.clear();
}
