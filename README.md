<div align="center">
  <h1>🚦 SIGNAL.X</h1>
  <h3>Autonomous Multi-Agent Traffic Optimization System</h3>
  
  <p>
    <img src="https://img.shields.io/badge/Status-Hackathon_Ready-success.svg" alt="Status" />
    <img src="https://img.shields.io/badge/Agent_Model-YOLOv8-blue.svg" alt="YOLOv8" />
    <img src="https://img.shields.io/badge/Deployment-Smart_City_API-orange.svg" alt="Smart City" />
    <img src="https://img.shields.io/badge/Interface-Glassmorphism-purple.svg" alt="UI" />
  </p>
  <p>
    <a href="https://signal-x-751668289831.us-central1.run.app/"><strong>🚀 Live Demo (GCP): signal-x-751668289831.us-central1.run.app</strong></a>
  </p>
</div>

## 📌 Executive Summary
Current urban traffic systems are static, relying on fixed, pre-programmed timers that cause unnecessary congestion and increased carbon emissions. **SIGNAL.X** transforms city infrastructure into a dynamic, intelligent network using an **autonomous multi-agent system** that optimizes traffic flow in real-time via live lane density analysis and adaptive signal control.

## 🏆 Innovation & Impact
- **Weighted Priority Engine:** Overcoming rigid "density-only" flaws, my algorithm natively calculates phase shifts using a dynamic matrix: `(0.5 × density) + (0.3 × wait time) + (0.2 × queue length)`.
- **Preemptive Anti-Starvation:** Built-in logic bounds prevent endless waiting loops. If a lane passes the strict 45-second starvation threshold, it seamlessly bypasses standard algorithm metrics for a forced-priority maximal green phase.
- **True Visual Phase Skipping:** The system observes actual optical queue clearing. If the active green lane clears its congestion while the perpendicular lane is queued, it executes immediate phase termination to boost throughput by 25%.
- **Robust Explainable AI (XAI):** Features transparent AI agent behavior logging (displaying Score, Queue, and Wait triggers directly in UI), ensuring every signal state change is fully auditable and trustworthy.

## 🧠 System Architecture & Data Flow

```mermaid
graph TD
    %% Input Layer
    subgraph Data Acquisition
        CCTV[📹 City CCTV Feeds] -->|24 FPS Stream| YOLO[👁️ YOLOv8 Edge Node]
    end

    %% AI Processing Layer
    subgraph Intelligence Engine
        YOLO -->|Bounding Box Data| DensityMetrics[📊 Density & Queue Analytics]
        DensityMetrics -->|Extracted Signals| Agent{🤖 AI Traffic Agent}
        Agent <-->|Context Sync| Redis[(⚡ In-Memory State)]
    end

    %% Hardware Actuation
    subgraph Physical Infrastructure
        Agent -->|Phase Override Commands| IoT[🎛️ IoT Signal Controller]
        IoT -->|Adaptive Green/Red| Signal[🚥 Smart Traffic Signal]
    end
```

## ⚙️ Autonomous Agent Logic Flow

```mermaid
sequenceDiagram
    participant Cam as CCTV Camera
    participant YOLO as YOLOv8 Edge Node
    participant Agent as AI Core Agent
    participant Matrix as Priority Matrix Engine
    participant Sig as Intersection API
    
    Cam->>YOLO: Transmit Live Frame Stream
    YOLO->>Agent: Send Extracted Densities (Car, Bus, Auto)
    Agent->>Matrix: Request Weight Calculation
    Matrix-->>Agent: (0.5×Density) + (0.3×Wait) + (0.2×Queue)
    
    alt Lane Wait Time > 45s (Starvation Threshold)
        Agent->>Sig: ⚠️ EMERGENCY OVERRIDE: Force Green Phase
    else Normal Operation
        Agent->>Sig: 🟢 Dispatch Optimized Phase Shift
    end
    
    Sig-->>Agent: Confirm Phase Transition
```

## 💻 Technology Stack
- **Simulation Layer:** Native HTML5 Canvas Engine, Advanced CSS Variables (Glassmorphic Spec)
- **Computer Vision Integration Layer:** YOLOv8 Object Detection compatibility
- **Data Visualization:** Chart.js Integration for real-time congestion tracking

## ☁️ Cloud Infrastructure Architecture

```mermaid
graph LR
    User[🌐 Web Client] -->|HTTPS Requests| CloudRun[☁️ Google Cloud Run]
    
    subgraph Google Cloud Platform
        CloudRun -->|Hosts Container| Container[🐳 Docker Container]
        Container -->|Serves Assets| Frontend[📂 Static UI & JS Engine]
    end
    
    subgraph CI/CD Pipeline
        Dev[💻 Local Deployment] -->|Image Build| Artifact[📦 Artifact Registry]
        Artifact -->|Image Rollout| CloudRun
    end
```

## 🚀 Installation & Cloning Guide
Want to test the autonomous simulation locally? It takes less than 10 seconds.

1. **Clone the Repository:** 
   ```bash
   git clone https://github.com/vaishnavi-ctrl-jpg/SIGNAL-X.git
   ```
2. **Navigate to the Directory:**
   ```bash
   cd SIGNAL-X
   ```
3. **Launch Application (Local):** 
   Simply double-click the `index.html` file to open it directly in any modern web browser.
   *(For developers: I recommend using VS Code's "Live Server" extension to visualize hot-reloaded changes easily).*

### 🌍 Live Deployment (Google Cloud Platform)
This project is containerized and deployed natively to **Google Cloud Run** for scalable, enterprise-grade availability.

**Active Deployment:**
- **Service Name:** `signal-x`
- **Region:** `us-central1`
- **URL:** [https://signal-x-751668289831.us-central1.run.app](https://signal-x-751668289831.us-central1.run.app)
- **Infrastructure:** Docker container stored in Artifact Registry and served via Cloud Run.

**Zero Dependencies:** No build-steps, no `npm install`, and no complex configurations required for evaluation. The codebase is cleanly modularized into native HTML, CSS, and JS engine components for robust maintainability.

## 🔮 Roadmap / Future Implementation
- **Emergency Override:** V2 includes direct routing channels for localized dispatching of emergency vehicles.
- **Cloud Meshing:** AWS/GCP architecture mapping to synchronize multiple adjacent intersections dynamically.

<div align="center">
  <br/>
  <i>Developed for the next generation of urban mobility.</i>
</div>
