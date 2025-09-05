const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const winston = require('winston');

const PermissionedBlockchain = require('../blockchain/Blockchain');
const blockchainRoutes = require('./routes/blockchain');
const { rateLimit } = require('./middleware/auth');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Initialize Express app
const app = express();

// Initialize blockchain
const blockchain = new PermissionedBlockchain();
app.set('blockchain', blockchain);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(morgan('combined', {
  stream: { write: (message) => logger.info(message.trim()) }
}));

// Rate limiting
app.use(rateLimit(1000, 15 * 60 * 1000)); // 1000 requests per 15 minutes

// Health check endpoint
app.get('/health', (req, res) => {
  const stats = blockchain.getStats();
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    blockchain: {
      blocks: stats.totalBlocks,
      transactions: stats.totalTransactions,
      nodes: stats.totalNodes,
      isValid: stats.isValid
    },
    server: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version
    }
  });
});

// API routes
app.use('/api/blockchain', blockchainRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Ayurvedic Herb Traceability Blockchain API',
    version: '1.0.0',
    description: 'Permissioned blockchain system for Ayurvedic herb supply chain traceability',
    endpoints: {
      health: '/health',
      blockchain: '/api/blockchain',
      nodes: '/api/blockchain/nodes',
      transactions: '/api/blockchain/transactions',
      blocks: '/api/blockchain/blocks'
    },
    features: [
      'Smart contract enforcement',
      'Geo-fencing validation',
      'Seasonal restrictions',
      'Quality validation',
      'Role-based access control',
      'Digital signatures',
      'Immutable audit trail'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `${req.method} ${req.originalUrl} is not a valid endpoint`
  });
});

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Ayurvedic Herb Blockchain API running on port ${PORT}`);
  logger.info(`📱 Health check: http://localhost:${PORT}/health`);
  logger.info(`🔗 Blockchain API: http://localhost:${PORT}/api/blockchain`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

module.exports = app;