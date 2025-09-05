# Ayurvedic Herb Traceability Blockchain System

A comprehensive permissioned blockchain system for tracking Ayurvedic herbs from farm to consumer, ensuring authenticity, quality, and compliance with regulatory standards.

## 🌟 Features

### Smart Contracts & Validation
- **Geo-fencing**: GPS validation against approved cultivation zones
- **Seasonal Restrictions**: Enforces NMPB guidelines for harvest timing
- **Quality Gates**: Automated validation of moisture, pesticide, and active compound levels
- **Daily Limits**: Conservation controls for sustainable harvesting

### Cybersecurity
- **End-to-end Encryption**: AES-256 encryption for data at rest and in transit
- **Digital Signatures**: X.509 certificate-based transaction signing
- **Role-based Access Control (RBAC)**: Granular permissions by stakeholder type
- **Immutable Audit Trail**: Complete chain of custody with tamper-proof records

### Stakeholder Network
- **Farmers/Collectors**: Harvest event logging with GPS verification
- **Processors**: Drying, grinding, and packaging operations
- **Testing Labs**: Quality analysis and certification
- **Manufacturers**: Product formulation and batch management
- **Regulators**: Compliance monitoring and audit capabilities

## 🏗️ Architecture

### Blockchain Layer
```
├── Smart Contracts (Business Logic)
├── Permissioned Network (Stakeholder Nodes)
├── Transaction Pool (Pending Operations)
└── Block Mining (Consensus & Validation)
```

### API Layer
```
├── Authentication & Authorization
├── Rate Limiting & Security
├── Transaction Validation
└── RESTful Endpoints
```

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Run Demo Setup
```bash
npm run demo
```

### Start API Server
```bash
npm start
# or for development
npm run dev
```

The API will be available at `http://localhost:3001`

## 📡 API Endpoints

### Node Management
- `POST /api/blockchain/nodes/register` - Register stakeholder node
- `GET /api/blockchain/nodes` - List all nodes

### Transactions
- `POST /api/blockchain/transactions` - Create transaction
- `POST /api/blockchain/transactions/collection` - Create collection event
- `GET /api/blockchain/transactions/:id` - Get transaction by ID

### Blocks & Mining
- `POST /api/blockchain/blocks/mine` - Mine pending transactions
- `GET /api/blockchain/blocks` - Get all blocks
- `GET /api/blockchain/blocks/:index` - Get block by index

### Batch Tracking
- `GET /api/blockchain/batches/:batchId/transactions` - Get batch history

### System
- `GET /health` - Health check and system status
- `GET /api/blockchain/stats` - Blockchain statistics
- `GET /api/blockchain/validate` - Validate chain integrity

## 🔧 Example Usage

### 1. Register Nodes
```bash
curl -X POST http://localhost:3001/api/blockchain/nodes/register \
  -H "Content-Type: application/json" \
  -d '{
    "nodeId": "FARMER001",
    "nodeType": "farmer",
    "publicKey": "farmer_public_key",
    "metadata": {
      "name": "Rajesh Kumar",
      "location": "Rajasthan",
      "organic": true
    }
  }'
```

### 2. Create Collection Event
```bash
curl -X POST http://localhost:3001/api/blockchain/transactions/collection \
  -H "Content-Type: application/json" \
  -d '{
    "nodeId": "FARMER001",
    "type": "CollectionEvent",
    "data": {
      "farmerId": "FARMER001",
      "species": "ashwagandha",
      "quantity": 25,
      "gps": {
        "latitude": 27.1952,
        "longitude": 73.3119
      },
      "qualityMetrics": {
        "moisture": 8.5,
        "withanolide": 0.4
      }
    }
  }'
```

### 3. Mine Block
```bash
curl -X POST http://localhost:3001/api/blockchain/blocks/mine \
  -H "Content-Type: application/json" \
  -d '{"minerId": "SYSTEM"}'
```

## 🛡️ Security Features

### Transaction Validation
- GPS coordinate verification against geo-fences
- Timestamp validation for seasonal restrictions
- Quality parameter threshold enforcement
- Daily harvest limit validation

### Access Control
- Node type-based permissions
- JWT token authentication
- Rate limiting protection
- Request signature verification

### Data Integrity
- SHA-256 hash validation
- Chain of custody verification
- Immutable transaction records
- Block hash linking

## 📊 Demo Scenario: Ashwagandha Journey

The system includes a complete demonstration following an Ashwagandha batch through the supply chain:

1. **Collection**: Farmer harvests 45kg from approved zone in Rajasthan
2. **Processing**: Cleaning, drying, and grinding to pharmaceutical grade
3. **Testing**: Lab analysis for withanolides, pesticides, and heavy metals
4. **Manufacturing**: 8,200 capsules produced with batch tracking
5. **QR Generation**: Consumer-facing traceability codes

## 🔍 Smart Contract Rules

### Geo-fencing Zones
- **Ashwagandha**: Rajasthan, Madhya Pradesh, Gujarat
- **Tulsi**: Pan-India cultivation allowed
- **Neem**: No geographic restrictions

### Seasonal Windows
- **Ashwagandha**: October - February (post-monsoon)
- **Tulsi**: March - August (growing season)
- **Neem**: Year-round collection

### Quality Thresholds
- **Moisture**: <12% for dried herbs
- **Withanolides**: >0.3% for Ashwagandha
- **Pesticides**: <0.01 ppm residue limits
- **Heavy Metals**: <10 ppm total content

## 🌐 Integration Points

### Frontend Applications
- Mobile DApp for farmers (React Native)
- Consumer QR portal (PWA)
- Stakeholder dashboard (React)
- Regulatory compliance portal

### External Systems
- GPS validation services
- Laboratory information systems
- ERP integration for manufacturers
- Government compliance reporting

## 📈 Monitoring & Analytics

### Blockchain Metrics
- Block generation time
- Transaction throughput
- Node network health
- Chain validation status

### Supply Chain KPIs
- Harvest volume tracking
- Quality compliance rates
- Geographic distribution
- Seasonal pattern analysis

## 🚧 Development Status

This is a **Step 1** implementation focusing on:
- ✅ Core blockchain infrastructure
- ✅ Smart contract business logic
- ✅ RESTful API endpoints
- ✅ Comprehensive demo data
- ✅ Security middleware
- ✅ Documentation

**Upcoming Steps**:
- Step 2: Farmer Mobile DApp
- Step 3: Consumer QR Portal
- Step 4: Stakeholder Dashboard
- Step 5: Demo Integration
- Step 6: Pitch Deck Content

## 📞 Support

For technical support or questions about the Ayurvedic Herb Traceability system, please refer to the API documentation or contact the development team.

---

*Built with ❤️ for sustainable Ayurvedic supply chains*