# xiaozhiclaw 🧤

**小智 AI 设备（ESP32 硬件）的 OpenClaw 通道**

将您的小智 AI 设备连接到 OpenClaw 智能体，实现实时语音交互。给您的 AI 助手一个物理身体！

**[🇺🇸 English](README.md)** | **[🇨🇳 中文文档](README-CN.md)**

---

## 功能特性

- 🎤 **实时语音通信** - 通过小智硬件与 AI 助手对话
- 🔌 **WebSocket 桥接** - 简单的 WebSocket 服务器连接小智固件
- 🤖 **OpenClaw 集成** - 无缝集成 OpenClaw 智能体生态系统
- 🎙️ **火山引擎豆包 STT/TTS** - 高品质语音识别和语音合成
- 🛠️ **可扩展** - 轻松添加自定义 STT/TTS 提供商

## 快速开始

### 前置条件

- Node.js v20+
- 已烧录固件的小智 ESP32 设备
- 已安装 OpenClaw
- 火山引擎豆包 API 凭证（用于 STT/TTS）

### 安装

```bash
# 克隆仓库
git clone https://github.com/leohuang8688/xiaozhiclaw.git
cd xiaozhiclaw

# 安装依赖
npm install

# 构建插件
npm run build
```

### 配置

#### 1. 设置环境变量

复制 `.env.example` 到 `.env` 并填写凭证：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```bash
# 火山引擎豆包 API 凭证
DOUBAO_APP_ID=your_app_id_here
DOUBAO_ACCESS_TOKEN=your_access_token_here

# WebSocket 服务器配置
XIAOZHI_PORT=8080
```

**⚠️ 安全提示：**
- 永远不要将 `.env` 文件提交到 Git
- `.env` 文件已在 `.gitignore` 中
- 使用 `.env.example` 作为分享模板

#### 2. 添加到 OpenClaw 配置

```json
{
  "extensions": {
    "xiaozhiclaw": {
      "port": 8080
    }
  }
}
```

### 连接小智设备

配置您的小智固件连接到：
```
ws://YOUR_COMPUTER_IP:8080
```

### 重启 OpenClaw

```bash
openclaw gateway restart
```

## 架构

```
小智 ESP32 ←→ WebSocket 服务器 ←→ OpenClaw 通道 ←→ AI 智能体
     ↓                ↓                    ↓              ↓
  麦克风          8080 端口          xiaozhiclaw      PocketAI
     ↓                ↓                    ↓              ↓
  扬声器         Opus 音频          消息路由器        响应
                     ↓
              豆包 STT/TTS
```

## 协议

### WebSocket 消息

**握手：**
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

**监听开始：**
```json
{
  "type": "listen",
  "state": "start"
}
```

**监听停止：**
```json
{
  "type": "listen",
  "state": "stop",
  "text": "transcribed text"
}
```

**TTS 开始：**
```json
{
  "type": "tts",
  "state": "start",
  "text": "response text"
}
```

**TTS 停止：**
```json
{
  "type": "tts",
  "state": "stop"
}
```

## 开发

```bash
# 开发监视模式
npm run dev

# 生产构建
npm run build
```

## 路线图

- [x] WebSocket 服务器实现
- [x] 基础握手协议
- [x] 文本消息支持
- [x] Opus 音频编解码
- [x] 火山引擎豆包 STT 集成
- [x] 火山引擎豆包 TTS 集成
- [x] 实时语音对话
- [ ] 硬件控制（音量、亮度）
- [ ] 多设备支持
- [ ] 离线 STT/TTS 支持

## 许可证

MIT

## 致谢

- OpenClaw 团队
- 小智 AI ESP32 项目
- 火山引擎豆包
- PocketAI 🧤
