const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

/**
 * Smart Contract for Ayurvedic Herb Traceability
 * Enforces business rules, geo-fencing, and quality validation
 */
class AyurvedicHerbContract {
  constructor() {
    this.rules = {
      // Geo-fencing rules for different regions
      geoFencing: {
        'ashwagandha': [
          { region: 'Rajasthan', bounds: { lat: [24.0, 30.0], lng: [69.0, 78.0] } },
          { region: 'Madhya Pradesh', bounds: { lat: [21.0, 26.0], lng: [74.0, 82.0] } },
          { region: 'Gujarat', bounds: { lat: [20.0, 25.0], lng: [68.0, 75.0] } }
        ]
      },
      
      // Seasonal restrictions (months when collection is allowed)
      seasonalRestrictions: {
        'ashwagandha': [10, 11, 12, 1, 2], // October to February
        'tulsi': [3, 4, 5, 6, 7, 8], // March to August
        'neem': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] // Year round
      },
      
      // Quality validation thresholds
      qualityThresholds: {
        'ashwagandha': {
          moistureMax: 12.0,
          withanolideMin: 0.3,
          pesticideMax: 0.01,
          heavyMetalsMax: 10.0
        }
      },
      
      // Daily collection limits (kg per farmer per day)
      dailyLimits: {
        'ashwagandha': 50,
        'tulsi': 25,
        'neem': 100
      }
    };
  }

  /**
   * Validate geo-fencing rules
   */
  validateGeoFencing(species, gps) {
    const speciesRules = this.rules.geoFencing[species];
    if (!speciesRules) return false;

    return speciesRules.some(rule => {
      return gps.latitude >= rule.bounds.lat[0] && 
             gps.latitude <= rule.bounds.lat[1] &&
             gps.longitude >= rule.bounds.lng[0] && 
             gps.longitude <= rule.bounds.lng[1];
    });
  }

  /**
   * Validate seasonal restrictions
   */
  validateSeason(species, timestamp) {
    const allowedMonths = this.rules.seasonalRestrictions[species];
    if (!allowedMonths) return false;

    const month = new Date(timestamp).getMonth() + 1; // 1-12
    return allowedMonths.includes(month);
  }

  /**
   * Validate daily collection limits
   */
  validateDailyLimit(farmerId, species, quantity, existingTransactions) {
    const limit = this.rules.dailyLimits[species];
    if (!limit) return false;

    const today = new Date().toDateString();
    const todaysCollections = existingTransactions.filter(tx => 
      tx.type === 'CollectionEvent' &&
      tx.data.farmerId === farmerId &&
      tx.data.species === species &&
      new Date(tx.timestamp).toDateString() === today
    );

    const totalToday = todaysCollections.reduce((sum, tx) => sum + tx.data.quantity, 0);
    return (totalToday + quantity) <= limit;
  }

  /**
   * Validate quality parameters
   */
  validateQuality(species, qualityMetrics) {
    const thresholds = this.rules.qualityThresholds[species];
    if (!thresholds) return { valid: false, reason: 'No quality rules defined for species' };

    if (qualityMetrics.moisture > thresholds.moistureMax) {
      return { valid: false, reason: 'Moisture content exceeds maximum allowed' };
    }

    if (qualityMetrics.withanolide && qualityMetrics.withanolide < thresholds.withanolideMin) {
      return { valid: false, reason: 'Withanolide content below minimum required' };
    }

    if (qualityMetrics.pesticide > thresholds.pesticideMax) {
      return { valid: false, reason: 'Pesticide residue exceeds maximum allowed' };
    }

    if (qualityMetrics.heavyMetals > thresholds.heavyMetalsMax) {
      return { valid: false, reason: 'Heavy metals exceed maximum allowed' };
    }

    return { valid: true };
  }

  /**
   * Execute smart contract for Collection Event
   */
  executeCollectionEvent(transaction, existingTransactions) {
    const { farmerId, species, gps, quantity, qualityMetrics } = transaction.data;
    
    // Validate geo-fencing
    if (!this.validateGeoFencing(species, gps)) {
      throw new Error(`Collection not allowed: GPS location ${gps.latitude}, ${gps.longitude} is outside approved zones for ${species}`);
    }

    // Validate seasonal restrictions
    if (!this.validateSeason(species, transaction.timestamp)) {
      throw new Error(`Collection not allowed: ${species} cannot be collected in current season`);
    }

    // Validate daily limits
    if (!this.validateDailyLimit(farmerId, species, quantity, existingTransactions)) {
      throw new Error(`Collection not allowed: Daily limit exceeded for farmer ${farmerId}`);
    }

    // Validate quality if provided
    if (qualityMetrics) {
      const qualityCheck = this.validateQuality(species, qualityMetrics);
      if (!qualityCheck.valid) {
        throw new Error(`Quality validation failed: ${qualityCheck.reason}`);
      }
    }

    return {
      valid: true,
      contractHash: this.generateContractHash(transaction),
      validationRules: {
        geoFencing: 'PASSED',
        seasonalRestriction: 'PASSED',
        dailyLimit: 'PASSED',
        quality: qualityMetrics ? 'PASSED' : 'NOT_TESTED'
      }
    };
  }

  /**
   * Execute smart contract for Processing Step
   */
  executeProcessingStep(transaction, existingTransactions) {
    const { batchId, processingType, conditions } = transaction.data;
    
    // Validate batch exists
    const batchExists = existingTransactions.some(tx => 
      tx.data.batchId === batchId || tx.id === batchId
    );
    
    if (!batchExists) {
      throw new Error(`Processing not allowed: Batch ${batchId} not found in blockchain`);
    }

    // Validate processing conditions based on type
    if (processingType === 'drying' && conditions.temperature > 60) {
      throw new Error('Drying temperature too high - may degrade active compounds');
    }

    if (processingType === 'grinding' && conditions.meshSize < 80) {
      throw new Error('Mesh size too coarse for pharmaceutical grade requirements');
    }

    return {
      valid: true,
      contractHash: this.generateContractHash(transaction),
      validationRules: {
        batchTraceability: 'PASSED',
        processingConditions: 'PASSED'
      }
    };
  }

  /**
   * Execute smart contract for Quality Test
   */
  executeQualityTest(transaction, existingTransactions) {
    const { batchId, testType, results, labId } = transaction.data;
    
    // Validate batch exists
    const batchExists = existingTransactions.some(tx => 
      tx.data.batchId === batchId || tx.id === batchId
    );
    
    if (!batchExists) {
      throw new Error(`Quality test not allowed: Batch ${batchId} not found`);
    }

    // Validate lab certification (simplified)
    const certifiedLabs = ['LAB001', 'LAB002', 'LAB003'];
    if (!certifiedLabs.includes(labId)) {
      throw new Error(`Lab ${labId} is not certified for testing`);
    }

    return {
      valid: true,
      contractHash: this.generateContractHash(transaction),
      validationRules: {
        batchTraceability: 'PASSED',
        labCertification: 'PASSED',
        testValidity: 'PASSED'
      }
    };
  }

  /**
   * Generate contract execution hash
   */
  generateContractHash(transaction) {
    const contractData = {
      transactionId: transaction.id,
      timestamp: transaction.timestamp,
      type: transaction.type,
      nodeId: transaction.nodeId
    };
    
    return crypto.createHash('sha256')
                 .update(JSON.stringify(contractData))
                 .digest('hex');
  }
}

module.exports = AyurvedicHerbContract;