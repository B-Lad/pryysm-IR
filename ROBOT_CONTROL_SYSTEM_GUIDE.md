# Robot Control System for 3D Print Farm Automation

## Overview
This robot control system integrates ABB, FANUC, Yaskawa Motoman, and KUKA robots to automate your 3D print farm operations. Designed for intermediate automation level supporting 10 printers.

## Architecture

### Protocol Recommendation: **Modbus TCP**

For your use case (10 printers, intermediate automation), **Modbus TCP** is the best choice because:

✅ **Pros:**
- Industry standard for industrial automation
- Simple implementation across all robot vendors
- Low latency (<10ms response time)
- Reliable over Ethernet networks
- Supported by ABB, FANUC, Yaskawa, and KUKA out-of-the-box
- Easy troubleshooting with standard tools
- No additional licensing costs

❌ **Alternatives considered:**
- **OPC UA**: More complex, better for enterprise-level integration
- **REST API**: Higher latency, not real-time enough for safety-critical operations

## File Structure

```
/src/lib/robots/
├── types.ts                      # TypeScript interfaces
├── RobotController.ts            # Abstract base class
├── ABBRobotController.ts         # ABB-specific implementation
├── FANUCRobotController.ts       # FANUC-specific implementation
├── YaskawaRobotController.ts     # Yaskawa-specific implementation
├── KUKARobotController.ts        # KUKA-specific implementation
├── RobotFactory.ts               # Factory pattern for robot creation
└── RobotService.ts               # Business logic layer

/app/api/robots/
├── route.ts                      # GET/POST/DELETE robots
├── tasks/
│   └── route.ts                  # Task management API
└── emergency-stop/
    └── route.ts                  # Critical safety function

/src/components/robots/
└── RobotControlPanel.tsx         # React UI component
```

## Database Schema

Three new tables added to Prisma schema:

1. **RobotConfig** - Robot configuration and connection details
2. **RobotTask** - Task queue and execution tracking
3. **RobotEvent** - Event logging for audit trail

## Setup Instructions

### 1. Install Dependencies

```bash
npm install modbus-serial
```

### 2. Update Database

```bash
npx prisma migrate dev --name add_robot_automation
npx prisma generate
```

### 3. Configure Robots

Use the API or dashboard to register robots:

```bash
curl -X POST http://localhost:3000/api/robots \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Robot-01",
    "vendor": "ABB",
    "model": "IRB-1200",
    "ipAddress": "192.168.1.100",
    "port": 502,
    "protocol": "MODBUS_TCP",
    "stationId": "STATION-01",
    "isActive": true
  }'
```

### 4. Modbus Register Mapping

Each robot vendor uses specific register mappings:

#### ABB (IRC5/OmniCore)
```
Register 40001: Command trigger
Register 40002-40010: Command parameters
Register 40100-40106: Position feedback (X,Y,Z,RX,RY,RZ)
Register 40200: Status flags
```

#### FANUC (R-30iB)
```
Register 40001: Command trigger
Register 40002-40010: Command parameters
Register 40100-40106: Position feedback
Register 40200: Status flags
```

#### Yaskawa (DX200/YRC1000)
```
Register 40001: Command trigger
Register 40002-40010: Command parameters
Register 40100-40106: Position feedback
Register 40200: Status flags
```

#### KUKA (KRC4/KRC5)
```
Register 40001: Command trigger
Register 40002-40010: Command parameters
Register 40100-40106: Position feedback
Register 40200: Status flags
```

## API Endpoints

### Robot Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/robots` | Get all robots status |
| GET | `/api/robots?id={id}` | Get specific robot status |
| POST | `/api/robots` | Register new robot |
| DELETE | `/api/robots?id={id}` | Remove robot |

### Task Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/robots/tasks` | Get all tasks |
| GET | `/api/robots/tasks?taskId={id}` | Get specific task |
| GET | `/api/robots/tasks?printerId={id}` | Get printer tasks |
| POST | `/api/robots/tasks` | Create new task |
| PATCH | `/api/robots/tasks` | Update task status |

### Safety

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/robots/emergency-stop` | Emergency stop all robots |
| GET | `/api/robots/emergency-stop` | Get emergency stop history |

## Task Types

1. **PART_REMOVAL** - Remove printed part from build plate
2. **BED_PREP** - Clean and prepare print bed
3. **INSPECTION** - Visual quality inspection
4. **MATERIAL_LOAD** - Load raw material to printer

## Usage Example

### Creating a Task

```typescript
import { RobotService } from '@/src/lib/robots/RobotService';

// Create part removal task
await RobotService.createTask({
  robotId: 'robot-001',
  printerId: 'printer-005',
  taskType: 'PART_REMOVAL',
  priority: 8,
  parameters: {
    gripForce: 50,
    liftHeight: 100,
    placementLocation: 'conveyor-belt-1'
  }
});
```

### Using the Control Panel Component

```tsx
import { RobotControlPanel } from '@/src/components/robots/RobotControlPanel';

export default function Dashboard() {
  return (
    <div>
      <h1>Print Farm Dashboard</h1>
      <RobotControlPanel />
    </div>
  );
}
```

## Safety Features

⚠️ **Emergency Stop**
- Immediately stops all robots
- Logs event to database
- Requires confirmation before activation
- Accessible from UI and API

🔒 **Safety Interlocks**
- Connection monitoring (5-second heartbeat)
- Task validation before execution
- Error handling and rollback
- Event auditing

## Production Deployment

### Network Configuration

```
Robot Network: 192.168.1.0/24 (isolated VLAN recommended)
App Server: 192.168.1.10
Robots: 192.168.1.100-110
Firewall: Allow port 502 (Modbus TCP) only from app server
```

### Environment Variables

```env
ROBOT_NETWORK_ENABLED=true
ROBOT_SAFETY_MODE=production
EMERGENCY_STOP_TIMEOUT=1000
TASK_QUEUE_MAX_SIZE=100
```

## Next Steps

1. **Hardware Integration**
   - Connect robots to network
   - Configure Modbus TCP on each robot controller
   - Test connectivity

2. **Programming Robot Tasks**
   - Create RAPID programs (ABB)
   - Create KAREL programs (FANUC)
   - Create INFORM jobs (Yaskawa)
   - Create KRL programs (KUKA)

3. **Testing**
   - Test each task type individually
   - Validate emergency stop functionality
   - Perform load testing with 10 printers

4. **Deployment**
   - Deploy to production Azure environment
   - Configure monitoring and alerts
   - Train operators on system usage

## Support

For vendor-specific documentation:
- ABB: https://new.abb.com/products/robotics
- FANUC: https://www.fanucamerica.com/
- Yaskawa: https://www.yaskawa.com/
- KUKA: https://www.kuka.com/
