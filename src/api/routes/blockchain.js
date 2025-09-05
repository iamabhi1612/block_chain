const express = require('express');
const Joi = require('joi');
const router = express.Router();

/**
 * Blockchain API Routes
 */

// Validation schemas
const nodeRegistrationSchema = Joi.object({
  nodeId: Joi.string().required(),
  nodeType: Joi.string().valid('farmer', 'processor', 'lab', 'manufacturer', 'regulator').required(),
  publicKey: Joi.string().required(),
  metadata: Joi.object().default({})
});

const transactionSchema = Joi.object({
  nodeId: Joi.string().required(),
  type: Joi.string().valid('CollectionEvent', 'ProcessingStep', 'QualityTest', 'ManufacturingRecord', 'ComplianceReport').required(),
  data: Joi.object().required()
});

const collectionEventSchema = Joi.object({
  nodeId: Joi.string().required(),
  type: Joi.string().valid('CollectionEvent').required(),
  data: Joi.object({
    farmerId: Joi.string().required(),
    species: Joi.string().required(),
    quantity: Joi.number().positive().required(),
    unit: Joi.string().default('kg'),
    gps: Joi.object({
      latitude: Joi.number().min(-90).max(90).required(),
      longitude: Joi.number().min(-180).max(180).required(),
      accuracy: Joi.number().default(10)
    }).required(),
    qualityMetrics: Joi.object({
      moisture: Joi.number(),
      withanolide: Joi.number(),
      pesticide: Joi.number(),
      heavyMetals: Joi.number(),
      appearance: Joi.string(),
      odor: Joi.string()
    }).optional(),
    harvestMethod: Joi.string().default('manual'),
    weatherConditions: Joi.object({
      temperature: Joi.number(),
      humidity: Joi.number(),
      rainfall: Joi.string()
    }).optional(),
    batchId: Joi.string().optional()
  }).required()
});

// Register node
router.post('/nodes/register', async (req, res) => {
  try {
    const { error, value } = nodeRegistrationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const blockchain = req.app.get('blockchain');
    const result = blockchain.registerNode(
      value.nodeId,
      value.nodeType,
      value.publicKey,
      value.metadata
    );

    res.json({
      success: true,
      message: 'Node registered successfully',
      data: result
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all nodes
router.get('/nodes', (req, res) => {
  try {
    const blockchain = req.app.get('blockchain');
    const nodes = Array.from(blockchain.nodes.values());
    
    res.json({
      success: true,
      data: nodes,
      count: nodes.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create transaction
router.post('/transactions', async (req, res) => {
  try {
    const { error, value } = transactionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const blockchain = req.app.get('blockchain');
    const transaction = blockchain.createTransaction(
      value.nodeId,
      value.type,
      value.data
    );

    res.json({
      success: true,
      message: 'Transaction created successfully',
      data: transaction
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create collection event (specialized endpoint)
router.post('/transactions/collection', async (req, res) => {
  try {
    const { error, value } = collectionEventSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const blockchain = req.app.get('blockchain');
    const transaction = blockchain.createTransaction(
      value.nodeId,
      value.type,
      value.data
    );

    res.json({
      success: true,
      message: 'Collection event recorded successfully',
      data: transaction
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Mine block
router.post('/blocks/mine', async (req, res) => {
  try {
    const { minerId } = req.body;
    if (!minerId) {
      return res.status(400).json({ error: 'minerId is required' });
    }

    const blockchain = req.app.get('blockchain');
    const block = blockchain.mineBlock(minerId);

    res.json({
      success: true,
      message: 'Block mined successfully',
      data: block
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all blocks
router.get('/blocks', (req, res) => {
  try {
    const blockchain = req.app.get('blockchain');
    const blocks = blockchain.chain;
    
    res.json({
      success: true,
      data: blocks,
      count: blocks.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get block by index
router.get('/blocks/:index', (req, res) => {
  try {
    const blockchain = req.app.get('blockchain');
    const index = parseInt(req.params.index);
    
    if (index < 0 || index >= blockchain.chain.length) {
      return res.status(404).json({ error: 'Block not found' });
    }

    res.json({
      success: true,
      data: blockchain.chain[index]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get transaction by ID
router.get('/transactions/:id', (req, res) => {
  try {
    const blockchain = req.app.get('blockchain');
    const transaction = blockchain.getTransactionById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get transactions by batch ID
router.get('/batches/:batchId/transactions', (req, res) => {
  try {
    const blockchain = req.app.get('blockchain');
    const transactions = blockchain.getTransactionsByBatchId(req.params.batchId);
    
    res.json({
      success: true,
      data: transactions,
      count: transactions.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get blockchain statistics
router.get('/stats', (req, res) => {
  try {
    const blockchain = req.app.get('blockchain');
    const stats = blockchain.getStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Validate blockchain integrity
router.get('/validate', (req, res) => {
  try {
    const blockchain = req.app.get('blockchain');
    const isValid = blockchain.isChainValid();
    
    res.json({
      success: true,
      data: {
        isValid,
        message: isValid ? 'Blockchain is valid' : 'Blockchain integrity compromised'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;