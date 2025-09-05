const PermissionedBlockchain = require('../blockchain/Blockchain');
const { sampleNodes, generateSampleTransactions } = require('../examples/sampleData');

/**
 * Demo setup script for Ayurvedic Herb Traceability
 */
async function setupDemo() {
  console.log('🌿 Setting up Ayurvedic Herb Traceability Demo...\n');
  
  // Initialize blockchain
  const blockchain = new PermissionedBlockchain();
  
  console.log('📋 Step 1: Registering network nodes...');
  
  // Register all sample nodes
  sampleNodes.forEach(node => {
    try {
      blockchain.registerNode(
        node.nodeId,
        node.nodeType,
        node.publicKey,
        node.metadata
      );
      console.log(`   ✓ ${node.nodeType.toUpperCase()}: ${node.metadata.name} (${node.nodeId})`);
    } catch (error) {
      console.log(`   ✗ Failed to register ${node.nodeId}: ${error.message}`);
    }
  });

  console.log('\n🔗 Step 2: Creating sample transactions...');
  
  // Generate and create sample transactions
  const sampleTransactions = generateSampleTransactions();
  
  sampleTransactions.forEach((transactionData, index) => {
    try {
      const transaction = blockchain.createTransaction(
        transactionData.nodeId,
        transactionData.type,
        transactionData.data
      );
      console.log(`   ✓ ${index + 1}. ${transactionData.type} by ${transactionData.nodeId}`);
      
      // Add some details for key transactions
      if (transactionData.type === 'CollectionEvent') {
        console.log(`      📍 Location: ${transactionData.data.gps.latitude}, ${transactionData.data.gps.longitude}`);
        console.log(`      🌾 Species: ${transactionData.data.species} (${transactionData.data.quantity} kg)`);
      } else if (transactionData.type === 'QualityTest') {
        console.log(`      🧪 Withanolide: ${transactionData.data.testResults.withanolideContent}%`);
        console.log(`      ✅ Status: ${transactionData.data.certificationStatus}`);
      }
    } catch (error) {
      console.log(`   ✗ Failed to create ${transactionData.type}: ${error.message}`);
    }
  });

  console.log('\n⛏️  Step 3: Mining blocks...');
  
  try {
    const block = blockchain.mineBlock('SYSTEM_MINER');
    console.log(`   ✓ Block #${block.index} mined with ${block.transactions.length} transactions`);
    console.log(`   🔐 Block hash: ${block.hash?.substring(0, 16)}...`);
  } catch (error) {
    console.log(`   ✗ Mining failed: ${error.message}`);
  }

  console.log('\n📊 Step 4: Blockchain statistics...');
  
  const stats = blockchain.getStats();
  console.log(`   📦 Total blocks: ${stats.totalBlocks}`);
  console.log(`   💫 Total transactions: ${stats.totalTransactions}`);
  console.log(`   🏢 Total nodes: ${stats.totalNodes}`);
  console.log(`   ✅ Chain valid: ${stats.isValid}`);
  console.log(`   ⏱️  Pending transactions: ${stats.pendingTransactions}`);

  console.log('\n🔍 Step 5: Demonstrating smart contract validations...');
  
  // Demo geo-fencing validation
  console.log('\n   🌍 Geo-fencing Demo:');
  try {
    blockchain.createTransaction('FARMER001', 'CollectionEvent', {
      farmerId: 'FARMER001',
      species: 'ashwagandha',
      quantity: 10,
      gps: { latitude: 28.6139, longitude: 77.2090 }, // Delhi - outside geo-fence
      batchId: 'DEMO_BATCH_INVALID'
    });
    console.log('   ✗ Unexpected success - should have failed geo-fence validation');
  } catch (error) {
    console.log(`   ✓ Geo-fence validation working: ${error.message}`);
  }
  
  // Demo seasonal restriction
  console.log('\n   📅 Seasonal Restriction Demo:');
  const oldCreateTransaction = blockchain.createTransaction.bind(blockchain);
  blockchain.createTransaction = function(nodeId, type, data) {
    // Temporarily modify timestamp to simulate wrong season
    const originalTimestamp = Date.now;
    Date.now = () => new Date('2024-07-15').getTime(); // Summer
    
    try {
      return oldCreateTransaction(nodeId, type, data);
    } finally {
      Date.now = originalTimestamp;
    }
  };
  
  try {
    blockchain.createTransaction('FARMER001', 'CollectionEvent', {
      farmerId: 'FARMER001',
      species: 'ashwagandha',
      quantity: 10,
      gps: { latitude: 27.1952, longitude: 73.3119 }, // Valid location
      batchId: 'DEMO_BATCH_SEASON'
    });
    console.log('   ✗ Unexpected success - should have failed seasonal validation');
  } catch (error) {
    console.log(`   ✓ Seasonal restriction working: ${error.message}`);
  }
  
  // Restore original function
  blockchain.createTransaction = oldCreateTransaction;

  console.log('\n🎉 Demo setup complete!');
  console.log('\n📝 Summary:');
  console.log(`   • Blockchain initialized with ${stats.totalNodes} stakeholder nodes`);
  console.log(`   • ${stats.totalTransactions} transactions created covering full supply chain`);
  console.log(`   • Smart contracts enforcing geo-fencing, seasonal, and quality rules`);
  console.log(`   • Complete Ashwagandha journey from farm to consumer package`);
  console.log(`   • Cybersecurity features: digital signatures, RBAC, audit trail`);
  
  return blockchain;
}

// Run demo if called directly
if (require.main === module) {
  setupDemo().then(blockchain => {
    console.log('\n🚀 Blockchain ready for API server...');
  }).catch(error => {
    console.error('Demo setup failed:', error);
    process.exit(1);
  });
}

module.exports = { setupDemo };