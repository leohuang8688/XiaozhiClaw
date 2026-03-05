# xiaozhiclaw 🧤

** OpenClaw Channel for XiaoZhi AI Device (ESP32 hardware) **

Connect your XiaoZhi AI Device to OpenClaw agents for real-time voice interaction. Give your AI assistant a physical body!

## Features

- 🎤 **Real-time Voice Communication** - Talk to your AI assistant through XiaoZhi hardware
- 🔌 **WebSocket Bridge** - Simple WebSocket server for XiaoZhi firmware connection
- 🤖 **OpenClaw Integration** - Seamless integration with OpenClaw agent ecosystem
- 🛠️ **Extensible** - Easy to add custom STT/TTS providers

## Quick Start

### Prerequisites

- Node.js v20+
- XiaoZhi ESP32 device with firmware flashed
- OpenClaw installed

### Installation

```bash
# Clone the repository
git clone https://github.com/leohuang8688/xiaozhiclaw.git
cd xiaozhiclaw

# Install dependencies
npm install

# Build the plugin
npm run build
```

### Configuration

Add to your OpenClaw configuration:

```json
{
  "extensions": {
    "xiaozhiclaw": {
      "port": 8080
    }
  }
}
```

### Connect XiaoZhi Device

Configure your XiaoZhi firmware to connect to:
```
ws://YOUR_COMPUTER_IP:8080
```

### Restart OpenClaw

```bash
openclaw gateway restart
```

## Architecture

```
XiaoZhi ESP32 ←→ WebSocket Server ←→ OpenClaw Channel ←→ AI Agent
     ↓                ↓                    ↓              ↓
  Microphone    Port 8080          xiaozhiclaw      PocketAI
     ↓                ↓                    ↓              ↓
  Speaker      Opus Audio         Message Router   Response
```

## Protocol

### WebSocket Messages

**Handshake:**
```json
{
  "type": "hello",
  "transport": "websocket",
  "audio_params": {
    "format": "opus",
    "sample_rate": 16000,
    "frame_duration": 60
  }
}
```

**Listen Start:**
```json
{
  "type": "listen",
  "state": "start"
}
```

**Listen Stop:**
```json
{
  "type": "listen",
  "state": "stop",
  "text": "transcribed text"
}
```

**TTS Start:**
```json
{
  "type": "tts",
  "state": "start",
  "text": "response text"
}
```

**TTS Stop:**
```json
{
  "type": "tts",
  "state": "stop"
}
```

## Development

```bash
# Watch mode for development
npm run dev

# Build for production
npm run build
```

## Roadmap

- [x] WebSocket server implementation
- [x] Basic handshake protocol
- [x] Text message support
- [ ] Opus audio encoding/decoding
- [ ] STT integration (Whisper/OpenAI)
- [ ] TTS integration (OpenAI/ElevenLabs)
- [ ] Hardware control (volume, brightness)
- [ ] Multi-device support

## License

MIT

## Credits

- OpenClaw Team
- XiaoZhi AI ESP32 Project
- PocketAI 🧤
