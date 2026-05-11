# Pryysm Automation Hub

A comprehensive **lights-out 3D printing automation system** integrating robot control, multi-technology print workflows (FDM, SLA, SLS), and intelligent material management.

## 🏭 Features

### Core Capabilities
- **Multi-Vendor Robot Control**: ABB, FANUC, KUKA, Yaskawa support via Modbus TCP
- **SLA Dental Workflow**: Automated build platform handling, wash/cure station integration
- **SLS Powder Management**: Chamber swapping, powder sieving, thermal control
- **Filament Management**: Smart spool tracking, drying systems, climate-controlled storage
- **Resin Automation**: Formlabs Form 4 integration with tank swapping
- **Unified 3D Dashboard**: Real-time digital twin visualization with Three.js

### Safety & Security
- 🔒 **Authentication Required** for all robot control endpoints
- ⚡ **Rate Limiting** on critical safety functions (emergency stop)
- 📝 **Audit Logging** of all safety-critical actions
- 🛑 **Hardware Watchdog** with heartbeat monitoring
- ✅ **Closed-Loop Verification** of command execution

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL or SQL Server database
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/B-Lad/pryysm-IR.git
cd pryysm-IR

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your database URL and secrets

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Start development server
npm run dev
```

### Environment Variables

Create a `.env.local` file:

```env
# Database
DATABASE_URL="sqlserver://localhost:1433;database=pryysm;user=sa;password=yourpassword;trustServerCertificate=true"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"

# Simulation Mode (set to 'false' for production hardware)
SIMULATION_MODE="true"

# Robot Configuration
ROBOT_SERIAL_PORT="/dev/ttyUSB0"
```

## 📁 Project Structure

```
pryysm-IR/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── robots/        # Robot control endpoints
│   │   └── auth/          # Authentication endpoints
│   └── dashboard/         # Main application UI
├── prisma/
│   └── schema.prisma      # Database schema
├── src/
│   ├── components/        # React components
│   ├── hooks/             # Custom React hooks
│   ├── lib/
│   │   ├── robots/        # Robot controllers
│   │   ├── hardware-adapter.ts
│   │   └── prisma.ts      # Database singleton
│   └── middleware/        # Auth & security middleware
├── services/
│   └── edge-controller.ts # Hardware edge service
└── package.json
```

## 🤖 Robot Integration

### Supported Vendors
- **ABB**: IRC5, OmniCore controllers
- **FANUC**: R-30iB, R-30iB Plus
- **KUKA**: KRC4, KRC5
- **Yaskawa**: DX200, YRC1000
- **Custom Arms**: reBot-DevArm compatible (inverse kinematics included)

### Connection Protocols
- Modbus TCP (primary)
- Serial/USB (custom arms)
- WebSocket (real-time telemetry)

## 🛡️ Safety Protocols

### Before Deployment
1. **Physical E-Stop**: Wire hardware emergency stop bypassing all software
2. **Sensor Validation**: Install limit switches, torque sensors, vision systems
3. **Network Isolation**: Run robot control on isolated VLAN
4. **Slow Testing**: Initial runs at 10% speed with human supervision
5. **Heartbeat System**: Configure 2-second timeout for hardware watchdog

### Critical Warnings
⚠️ **DO NOT** deploy without:
- Physical safety interlocks
- Proper grounding and electrical safety
- Emergency stop buttons within reach
- Risk assessment completed
- Operator training completed

## 📊 API Endpoints

### Robot Control
- `POST /api/robots` - Register new robot
- `GET /api/robots` - List all robots
- `POST /api/robots/emergency-stop` - Trigger E-stop (auth required)
- `POST /api/robots/tasks` - Queue task
- `GET /api/robots/tasks` - Get task queue status

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

## 🧪 Development

```bash
# Run linter
npm run lint

# Run tests (when implemented)
npm test

# Build for production
npm run build

# Start production server
npm start

# Run edge controller (hardware interface)
npm run edge
```

## 📄 Documentation

- [Robot Control System Guide](./ROBOT_CONTROL_SYSTEM_GUIDE.md)
- [SLA Automation (Part 2)](./FILAMENT_MANAGEMENT_PART4.md)
- [SLS Automation (Part 3)](./SLS_AUTOMATION_UPDATES.md)
- [Filament Management (Part 4)](./FILAMENT_MANAGEMENT_PART4.md)
- [Resin Automation (Part 5)](./RESIN_AUTOMATION_PART5.md)
- [Safety Protocols](./SAFETY_PROTOCOLS.md)
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)

## 🚨 Security Considerations

This system controls industrial machinery. Security is critical:

- All robot control APIs require authentication
- Session tokens validated on every request
- Rate limiting prevents abuse of safety functions
- Audit logs track all critical actions
- Network isolation recommended for production

## 📝 License

MIT License - See LICENSE file

## 👥 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 🆘 Support

For issues or questions:
- GitHub Issues: https://github.com/B-Lad/pryysm-IR/issues
- Email: support@pryysm.com

---

**Built for lights-out manufacturing** 🌙🏭
