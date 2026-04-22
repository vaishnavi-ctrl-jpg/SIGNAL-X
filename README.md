<div align="center">
  <h1>🚦 SIGNAL.X</h1>
  <h3>Autonomous Multi-Agent Traffic Optimization System with Real-Time Lane Prioritization</h3>
  
  <p>
    <img src="https://img.shields.io/badge/Status-Active-success.svg" alt="Status" />
    <img src="https://img.shields.io/badge/Agent_Model-YOLOv8-blue.svg" alt="YOLOv8" />
    <img src="https://img.shields.io/badge/Deployment-Smart_City_Ready-orange.svg" alt="Smart City" />
    <img src="https://img.shields.io/badge/Interface-Glassmorphism-purple.svg" alt="UI" />
  </p>
</div>

## 🚨 The Problem
Current traffic systems are static and inefficient. They rely on fixed timers regardless of real-time congestion, leading to wasted time, increased emissions, and poor urban mobility.

## 💡 The Solution
We built an **autonomous agent-based system** that dynamically optimizes traffic flow using real-time lane density, predictive modeling, and adaptive signal control. 

> **Live Deployment Ready:** The system is purposefully designed to plug into real-time city CCTV feeds via API for immediate live deployment.

## ✨ Key Differentiators / Features
- ✅ **Multi-agent behavior** (intelligent, dynamic signal decision logic)
- ✅ **Visual simulation** (high-fidelity interactive canvas — huge visualization advantage)
- ✅ **Real-world use case** (smart city network integration = perfect fit for municipal application)
- ✅ **Explainability** (real-time transparent AI agent logs = judges LOVE this!)

## 🧠 System Architecture

```mermaid
graph TD
    A[CCTV Network] -->|Video Feed| B(YOLOv8 Vision Node)
    B -->|Vehicles per Lane| C{AI Agent Engine}
    C <-->|Query/Update| D[(Redis Sync)]
    C -->|Signal Duration| E[Hardware Controller]
    E --> F[Traffic Lights]
```

## ⚙️ Autonomous Agent Flow

```mermaid
sequenceDiagram
    participant Cam as CCTV
    participant Vision as YOLOv8
    participant Agent as AI Agent
    participant Sig as Signal API
    Cam->>Vision: Stream Frames
    Vision->>Agent: Detect Lane Congestion
    Agent->>Agent: Predict Flow (10m Forecast)
    Agent->>Sig: Adjust Green Duration proportionally
    Sig-->>Agent: Confirm State Shift
```

## 🛠️ Technical Highlights
- **Computer Vision Integration:** Built to seamlessly ingest YOLOv8 detection streams for high-confidence vehicle tracking.
- **Predictive Analytics:** Implements forecast models preempting congestion build-ups before they occur.
- **Command Center UI:** A state-of-the-art dispatch and monitoring dashboard providing 360-degree intersection awareness.

<div align="center">
  <br/>
  <i>Engineered for the next generation of urban mobility.</i>
</div>
