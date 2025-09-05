const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const AyurvedicHerbContract = require('./SmartContract');

/**
 * Permissioned Blockchain Implementation
 * Simulates Hyperledger Fabric-like functionality
 */
class PermissionedBlockchain {
  constructor() {
    this.chain = [];
    this.pendingTransactions = [];
    this.nodes = new Map();
    this.smartContract = new AyurvedicHerbContract();
    this.difficulty = 2; // Simplified PoW for demo
    
    // Initialize with genesis block
    this.createGenesisBlock();
  }

  /**
   * Create genesis block
   */
  createGenesisBlock() {
    const genesisBlock = {
      index: 0,
      timestamp: Date.now(),
      transactions: [{
        id: uuidv4(),
        type: 'Genesis',
        data: { message: 'Ayurvedic Herb Traceability Blockchain Genesis' },
        nodeId: 'SYSTEM',
        timestamp: Date.now(),
        signature: 'GENESIS_SIGNATURE'
      }],
      previousHash: '0',
      hash: this.calculateHash([]),
      nonce: 0
    };
    
    this.chain.push(genesisBlock);
  }

  /**
   * Register a new node in the network
   */
  registerNode(nodeId, nodeType, publicKey, metadata = {}) {
    const allowedTypes = ['farmer', 'processor', 'lab', 'manufacturer', 'regulator'];
    
    if (!allowedTypes.includes(nodeType)) {
      throw new Error(`Invalid node type: ${nodeType}`);
    }

    this.nodes.set(nodeId, {
      id: nodeId,
      type: nodeType,
      publicKey,
      metadata,
      registeredAt: Date.now(),
      active: true,
      permissions: this.getNodePermissions(nodeType)
    });

    return { success: true, nodeId, registeredAt: Date.now() };
  }

  /**
   * Get permissions based on node type
   */
  getNodePermissions(nodeType) {
    const permissions = {
      farmer: ['create_collection_event', 'read_own_data'],
      processor: ['create_processing_step', 'read_batch_data'],
      lab: ['create_quality_test', 'read_test_data'],
      manufacturer: ['create_manufacturing_record', 'generate_qr'],
      regulator: ['read_all_data', 'create_compliance_report', 'flag_violations']
    };

    return permissions[nodeType] || [];
  }

  /**
   * Create a new transaction
   */
  createTransaction(nodeId, type, data) {
    // Validate node exists and is active
    const node = this.nodes.get(nodeId);
    if (!node || !node.active) {
      throw new Error(`Node ${nodeId} not found or inactive`);
    }

    // Check permissions
    const requiredPermission = this.getRequiredPermission(type);
    if (!node.permissions.includes(requiredPermission)) {
      throw new Error(`Node ${nodeId} does not have permission for ${type}`);
    }

    // Create transaction properties first
    const transactionData = {
      id: uuidv4(),
      type,
      data: {
        ...data,
        nodeId,
        nodeType: node.type
      },
      nodeId,
      timestamp: Date.now()
    };

    // Calculate signature using the transaction data
    const signature = this.signTransaction(transactionData, nodeId);
    
    // Create complete transaction object
    const transaction = {
      ...transactionData,
      signature
    };

    // Execute smart contract validation
    try {
      let contractResult;
      switch (type) {
        case 'CollectionEvent':
          contractResult = this.smartContract.executeCollectionEvent(transaction, this.getAllTransactions());
          break;
        case 'ProcessingStep':
          contractResult = this.smartContract.executeProcessingStep(transaction, this.getAllTransactions());
          break;
        case 'QualityTest':
          contractResult = this.smartContract.executeQualityTest(transaction, this.getAllTransactions());
          break;
        default:
          contractResult = { valid: true, contractHash: 'SYSTEM_APPROVED' };
      }

      transaction.contractValidation = contractResult;
    } catch (error) {
      throw new Error(`Smart contract validation failed: ${error.message}`);
    }

    this.pendingTransactions.push(transaction);
    return transaction;
  }

  /**
   * Get required permission for transaction type
   */
  getRequiredPermission(type) {
    const permissionMap = {
      'CollectionEvent': 'create_collection_event',
      'ProcessingStep': 'create_processing_step',
      'QualityTest': 'create_quality_test',
      'ManufacturingRecord': 'create_manufacturing_record',
      'ComplianceReport': 'create_compliance_report'
    };

    return permissionMap[type] || 'read_own_data';
  }

  /**
   * Mine pending transactions into a new block
   */
  mineBlock(minerId) {
    if (this.pendingTransactions.length === 0) {
      throw new Error('No pending transactions to mine');
    }

    const block = {
      index: this.chain.length,
      timestamp: Date.now(),
      transactions: [...this.pendingTransactions],
      previousHash: this.getLatestBlock().hash,
      minerId,
      nonce: 0
    };

    // Simple proof of work
    while (block.hash?.substring(0, this.difficulty) !== Array(this.difficulty + 1).join('0')) {
      block.nonce++;
      block.hash = this.calculateHash(block);
    }

    this.chain.push(block);
    this.pendingTransactions = [];
    
    return block;
  }

  /**
   * Calculate block hash
   */
  calculateHash(block) {
    return crypto.createHash('sha256').update(
      (block.index || 0) + 
      (block.timestamp || 0) + 
      JSON.stringify(block.transactions || []) + 
      (block.previousHash || '') + 
      (block.nonce || 0)
    ).digest('hex');
  }

  /**
   * Sign transaction (simplified)
   */
  signTransaction(transaction, nodeId) {
    const data = JSON.stringify({
      id: transaction.id,
      type: transaction.type,
      data: transaction.data,
      timestamp: transaction.timestamp
    });

    return crypto.createHash('sha256').update(data + nodeId).digest('hex');
  }

  /**
   * Get latest block
   */
  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  /**
   * Get all transactions from all blocks
   */
  getAllTransactions() {
    const transactions = [];
    for (const block of this.chain) {
      transactions.push(...block.transactions);
    }
    return transactions;
  }

  /**
   * Get transaction by ID
   */
  getTransactionById(transactionId) {
    const allTransactions = this.getAllTransactions();
    return allTransactions.find(tx => tx.id === transactionId);
  }

  /**
   * Get transactions by batch ID
   */
  getTransactionsByBatchId(batchId) {
    const allTransactions = this.getAllTransactions();
    return allTransactions.filter(tx => 
      tx.data.batchId === batchId || tx.id === batchId
    );
  }

  /**
   * Validate blockchain integrity
   */
  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== this.calculateHash(currentBlock)) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }

  /**
   * Get blockchain statistics
   */
  getStats() {
    return {
      totalBlocks: this.chain.length,
      totalTransactions: this.getAllTransactions().length,
      totalNodes: this.nodes.size,
      pendingTransactions: this.pendingTransactions.length,
      isValid: this.isChainValid(),
      lastBlockTime: this.getLatestBlock().timestamp
    };
  }
}

module.exports = PermissionedBlockchain;