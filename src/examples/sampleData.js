const { v4: uuidv4 } = require('uuid');

/**
 * Sample data for Ashwagandha supply chain demonstration
 */

// Sample nodes (stakeholders)
const sampleNodes = [
  {
    nodeId: 'FARMER001',
    nodeType: 'farmer',
    publicKey: 'farmer001_public_key_hash',
    metadata: {
      name: 'Rajesh Kumar',
      location: 'Nagaur, Rajasthan',
      farmSize: '5 hectares',
      organic: true,
      contact: '+91-9876543210'
    }
  },
  {
    nodeId: 'PROCESSOR001',
    nodeType: 'processor',
    publicKey: 'processor001_public_key_hash',
    metadata: {
      name: 'Herbal Processing Co.',
      location: 'Jodhpur, Rajasthan',
      certifications: ['ISO 9001', 'AYUSH License'],
      capacity: '1000 kg/day'
    }
  },
  {
    nodeId: 'LAB001',
    nodeType: 'lab',
    publicKey: 'lab001_public_key_hash',
    metadata: {
      name: 'Ayush Testing Laboratory',
      location: 'Jaipur, Rajasthan',
      accreditation: 'NABL Accredited',
      specializations: ['Phytochemical Analysis', 'Heavy Metal Testing']
    }
  },
  {
    nodeId: 'MANUFACTURER001',
    nodeType: 'manufacturer',
    publicKey: 'manufacturer001_public_key_hash',
    metadata: {
      name: 'Ayurvedic Wellness Pvt. Ltd.',
      location: 'Mumbai, Maharashtra',
      products: ['Ashwagandha Capsules', 'Powder', 'Tablets'],
      gmpCertified: true
    }
  },
  {
    nodeId: 'REGULATOR001',
    nodeType: 'regulator',
    publicKey: 'regulator001_public_key_hash',
    metadata: {
      name: 'AYUSH Ministry Inspector',
      region: 'Rajasthan',
      authority: 'Ministry of AYUSH, Government of India'
    }
  }
];

// Sample transactions for Ashwagandha supply chain
const generateSampleTransactions = () => {
  const baseDate = new Date('2024-12-15T06:00:00Z'); // Early morning harvest
  const transactions = [];

  // 1. Collection Event
  const collectionEvent = {
    nodeId: 'FARMER001',
    type: 'CollectionEvent',
    data: {
      farmerId: 'FARMER001',
      species: 'ashwagandha',
      scientificName: 'Withania somnifera',
      quantity: 45,
      unit: 'kg',
      gps: {
        latitude: 27.1952,
        longitude: 73.3119,
        accuracy: 5
      },
      qualityMetrics: {
        moisture: 8.5,
        withanolide: 0.4,
        pesticide: 0.005,
        heavyMetals: 7.2,
        appearance: 'Light brown roots, well-dried',
        odor: 'Characteristic earthy smell'
      },
      harvestMethod: 'manual',
      weatherConditions: {
        temperature: 22,
        humidity: 45,
        rainfall: 'none_last_7_days'
      },
      batchId: uuidv4(),
      farmerNotes: 'Harvested from 3-year-old plants, morning collection to preserve active compounds',
      organicCertified: true
    }
  };
  
  transactions.push({
    ...collectionEvent,
    timestamp: baseDate.getTime(),
    estimatedProcessingTime: '2-3 hours after collection'
  });

  // 2. Processing Step - Cleaning and Initial Drying
  const processingStep1 = {
    nodeId: 'PROCESSOR001',
    type: 'ProcessingStep',
    data: {
      batchId: collectionEvent.data.batchId,
      processingType: 'cleaning_and_drying',
      inputQuantity: 45,
      outputQuantity: 42,
      conditions: {
        temperature: 45,
        humidity: 30,
        duration: 6,
        method: 'shade_drying'
      },
      equipmentUsed: 'Industrial shade dryer',
      qualityChecks: {
        moistureAfter: 6.2,
        colorRetention: 'excellent',
        aromaPreservation: 'strong'
      },
      processorNotes: 'Cleaned to remove soil, dried under controlled conditions',
      losses: {
        cleaning: 2,
        drying: 1,
        totalLoss: 3
      }
    }
  };

  transactions.push({
    ...processingStep1,
    timestamp: baseDate.getTime() + (4 * 60 * 60 * 1000) // 4 hours later
  });

  // 3. Processing Step - Grinding
  const processingStep2 = {
    nodeId: 'PROCESSOR001',
    type: 'ProcessingStep',
    data: {
      batchId: collectionEvent.data.batchId,
      processingType: 'grinding',
      inputQuantity: 42,
      outputQuantity: 41,
      conditions: {
        temperature: 35,
        meshSize: 100,
        rpm: 1500,
        duration: 2
      },
      equipmentUsed: 'Stainless steel grinder',
      qualityChecks: {
        particleSize: '100 mesh',
        moisture: 5.8,
        withanolideRetention: 95
      },
      processorNotes: 'Ground to pharmaceutical grade powder',
      packaging: {
        type: 'food_grade_bags',
        weight: 41,
        sealingMethod: 'heat_sealed'
      }
    }
  };

  transactions.push({
    ...processingStep2,
    timestamp: baseDate.getTime() + (8 * 60 * 60 * 1000) // 8 hours later
  });

  // 4. Quality Test - Lab Analysis
  const qualityTest = {
    nodeId: 'LAB001',
    type: 'QualityTest',
    data: {
      batchId: collectionEvent.data.batchId,
      labId: 'LAB001',
      testType: 'comprehensive_analysis',
      sampleWeight: 0.5,
      testResults: {
        withanolideContent: 0.38,
        moisture: 5.9,
        totalAsh: 4.2,
        acidInsolublAsh: 0.8,
        heavyMetals: {
          lead: 2.1,
          cadmium: 0.3,
          mercury: 0.1,
          arsenic: 1.8
        },
        pesticides: {
          organochlorines: 'not_detected',
          organophosphates: 'not_detected',
          carbamates: 'not_detected'
        },
        microbiology: {
          totalBacterialCount: 1000,
          yeastMold: 100,
          ecoli: 'negative',
          salmonella: 'negative'
        },
        aflatoxins: 'below_detection_limit'
      },
      testMethods: {
        withanolide: 'HPLC',
        heavyMetals: 'ICP-MS',
        pesticides: 'GC-MS',
        microbiology: 'USP_method'
      },
      certificationStatus: 'PASSED',
      labTechnician: 'Dr. Priya Sharma',
      accreditationNumber: 'NABL-TC-5678',
      reportNumber: 'ASH-2024-001'
    }
  };

  transactions.push({
    ...qualityTest,
    timestamp: baseDate.getTime() + (24 * 60 * 60 * 1000) // 1 day later
  });

  // 5. Manufacturing Record
  const manufacturingRecord = {
    nodeId: 'MANUFACTURER001',
    type: 'ManufacturingRecord',
    data: {
      batchId: collectionEvent.data.batchId,
      manufacturerId: 'MANUFACTURER001',
      productType: 'ashwagandha_capsules',
      inputQuantity: 41,
      outputQuantity: 8200, // capsules
      capsuleWeight: 500, // mg per capsule
      manufacturingDate: new Date(baseDate.getTime() + (48 * 60 * 60 * 1000)),
      expiryDate: new Date(baseDate.getTime() + (3 * 365 * 24 * 60 * 60 * 1000)), // 3 years
      batchNumber: 'ASH-CAP-2024-001',
      additionalIngredients: [
        'Vegetable Cellulose Capsule',
        'Magnesium Stearate (vegetable source)'
      ],
      packaging: {
        primaryPackaging: '60 capsules per bottle',
        bottles: 137,
        labeling: 'complete_with_batch_qr',
        storageInstructions: 'Store in cool, dry place'
      },
      qualityControl: {
        weightVariation: 'within_limits',
        disintegrationTime: '15_minutes',
        withanolidePerCapsule: 1.9
      },
      gmpCompliance: true,
      productionSupervisor: 'Mr. Suresh Patel'
    }
  };

  transactions.push({
    ...manufacturingRecord,
    timestamp: baseDate.getTime() + (48 * 60 * 60 * 1000) // 2 days later
  });

  return transactions;
};

// Sample compliance scenarios
const complianceScenarios = {
  // Successful compliance
  validHarvest: {
    scenario: 'Valid harvest within geo-fence and season',
    gps: { latitude: 27.1952, longitude: 73.3119 }, // Rajasthan
    date: new Date('2024-12-15'), // Winter season
    species: 'ashwagandha',
    expectedResult: 'PASSED'
  },
  
  // Geo-fencing violation
  geoViolation: {
    scenario: 'Harvest outside approved geo-fence',
    gps: { latitude: 28.6139, longitude: 77.2090 }, // Delhi - not approved
    date: new Date('2024-12-15'),
    species: 'ashwagandha',
    expectedResult: 'FAILED - Geo-fence violation'
  },
  
  // Seasonal violation
  seasonalViolation: {
    scenario: 'Harvest during prohibited season',
    gps: { latitude: 27.1952, longitude: 73.3119 },
    date: new Date('2024-07-15'), // Summer - not allowed for ashwagandha
    species: 'ashwagandha',
    expectedResult: 'FAILED - Seasonal restriction'
  },
  
  // Quality failure
  qualityFailure: {
    scenario: 'Quality parameters below threshold',
    qualityMetrics: {
      moisture: 15.0, // Above 12% limit
      withanolide: 0.2, // Below 0.3% minimum
      pesticide: 0.02 // Above 0.01 limit
    },
    expectedResult: 'FAILED - Quality standards not met'
  }
};

// Generate QR code data
const generateQRData = (batchId) => {
  return {
    version: '1.0',
    batchId,
    qrType: 'AYURVEDIC_HERB_TRACE',
    timestamp: Date.now(),
    verificationURL: `https://api.ayurvedic-trace.com/verify/${batchId}`,
    checksum: require('crypto').createHash('sha256').update(batchId + Date.now()).digest('hex').substring(0, 16)
  };
};

module.exports = {
  sampleNodes,
  generateSampleTransactions,
  complianceScenarios,
  generateQRData
};