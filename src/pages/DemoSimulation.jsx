import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, CheckCircle, AlertTriangle, Leaf, Factory, FlaskConical, Package, Zap, Shield, Smartphone } from 'lucide-react';
import { useBlockchain } from '../contexts/BlockchainContext';
import { 
  Toast, 
  ProgressSteps, 
  InteractiveCard, 
  OneClickButton 
} from '../components/InteractiveComponents';

const DemoSimulation = () => {
  const { createTransaction, mineBlock, getStats } = useBlockchain();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [toast, setToast] = useState(null);
  const [selectedDemo, setSelectedDemo] = useState('complete');

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const demoSteps = [
    { title: 'Collection', description: 'Farmer records harvest with GPS validation', icon: Leaf, color: 'green' },
    { title: 'Processing', description: 'Herb cleaning and drying', icon: Factory, color: 'blue' },
    { title: 'Quality Test', description: 'Lab analysis and certification', icon: FlaskConical, color: 'purple' },
    { title: 'Manufacturing', description: 'Product formulation', icon: Package, color: 'orange' },
    { title: 'Blockchain', description: 'Block mining and validation', icon: CheckCircle, color: 'indigo' }
  ];

  const demoScenarios = {
    complete: {
      title: 'Complete Supply Chain',
      description: 'Full journey from farm to consumer',
      icon: Leaf
    },
    cybersecurity: {
      title: 'Cybersecurity Demo',
      description: 'GPS spoofing attack prevention',
      icon: Shield
    },
    offline: {
      title: 'Offline Sync',
      description: 'SMS-based offline synchronization',
      icon: Smartphone
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const blockchainStats = await getStats();
      setStats(blockchainStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
    showToast(message, type);
  };

  const runStep = async (stepIndex, scenario = 'complete') => {
    try {
      switch (stepIndex) {
        case 0: // Collection
          if (scenario === 'cybersecurity') {
            addLog('🚨 Attempting collection with fake GPS coordinates...', 'warning');
            try {
              await createTransaction('FARMER001', 'CollectionEvent', {
                farmerId: 'FARMER001',
                species: 'ashwagandha',
                quantity: 25,
                gps: { latitude: 28.6139, longitude: 77.2090, accuracy: 5 }, // Delhi - outside geo-fence
                qualityMetrics: { moisture: 8.5, appearance: 'excellent' }
              });
            } catch (error) {
              addLog('🛡️ GPS spoofing attack blocked by smart contract!', 'success');
              addLog(`Security validation: ${error.message}`, 'info');
              return;
            }
          } else {
            addLog('🌿 Farmer FARMER001 starting collection...', 'info');
            await createTransaction('FARMER001', 'CollectionEvent', {
              farmerId: 'FARMER001',
              species: 'ashwagandha',
              quantity: 25,
              gps: { latitude: 27.1952, longitude: 73.3119, accuracy: 5 },
              qualityMetrics: { moisture: 8.5, appearance: 'excellent' }
            });
            addLog('✅ Collection event recorded with GPS validation', 'success');
          }
          break;

        case 1: // Processing
          addLog('🏭 Processing facility receiving herbs...', 'info');
          await createTransaction('PROCESSOR001', 'ProcessingStep', {
            batchId: 'demo-batch-001',
            processingType: 'drying',
            inputQuantity: 25,
            outputQuantity: 23,
            conditions: { temperature: 45, humidity: 30, duration: 6 }
          });
          addLog('✅ Drying process completed - 2kg moisture loss', 'success');
          break;

        case 2: // Quality Test
          addLog('🧪 Lab conducting quality analysis...', 'info');
          await createTransaction('LAB001', 'QualityTest', {
            batchId: 'demo-batch-001',
            labId: 'LAB001',
            testType: 'comprehensive_analysis',
            testResults: {
              withanolideContent: 0.38,
              moisture: 5.9,
              heavyMetals: { lead: 2.1, cadmium: 0.3 },
              pesticides: { organochlorines: 'not_detected' }
            },
            certificationStatus: 'PASSED'
          });
          addLog('✅ Lab certification: PASSED - All parameters within limits', 'success');
          break;

        case 3: // Manufacturing
          addLog('🏭 Manufacturing facility creating products...', 'info');
          await createTransaction('MANUFACTURER001', 'ManufacturingRecord', {
            batchId: 'demo-batch-001',
            manufacturerId: 'MANUFACTURER001',
            productType: 'ashwagandha_capsules',
            inputQuantity: 23,
            outputQuantity: 4600,
            batchNumber: 'ASH-CAP-2024-001'
          });
          addLog('✅ 4,600 capsules manufactured with QR codes generated', 'success');
          break;

        case 4: // Mining
          addLog('⛏️ Mining new block...', 'info');
          await mineBlock('SYSTEM_MINER');
          await loadStats();
          addLog('✅ Block mined - All transactions permanently recorded', 'success');
          break;
      }
    } catch (error) {
      addLog(`❌ Error in step ${stepIndex + 1}: ${error.message}`, 'error');
    }
  };

  const runFullDemo = async (scenario = 'complete') => {
    setIsRunning(true);
    setCurrentStep(0);
    setLogs([]);
    
    if (scenario === 'offline') {
      addLog('📱 Simulating offline farmer with SMS sync...', 'info');
      addLog('📶 Network connection lost - switching to SMS mode', 'warning');
      addLog('💬 SMS: Collection data queued for sync', 'info');
      await new Promise(resolve => setTimeout(resolve, 2000));
      addLog('📶 Network restored - syncing offline data...', 'success');
    } else {
      addLog(`🚀 Starting ${demoScenarios[scenario].title} demonstration...`, 'info');
    }

    for (let i = 0; i < demoSteps.length; i++) {
      setCurrentStep(i);
      await runStep(i, scenario);
      await new Promise(resolve => setTimeout(resolve, scenario === 'cybersecurity' && i === 0 ? 3000 : 1500));
    }

    setCurrentStep(demoSteps.length);
    addLog(`🎉 ${demoScenarios[scenario].title} demonstration completed!`, 'success');
    setIsRunning(false);
  };

  const resetDemo = () => {
    setCurrentStep(0);
    setLogs([]);
    setIsRunning(false);
    showToast('Demo reset successfully', 'info');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-6xl mx-auto">
        {/* Enhanced Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 animate-fade-in">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Interactive Demo Simulation
          </h1>
          <p className="text-gray-600 text-lg">Experience the complete Ayurvedic herb traceability system</p>
        </div>

        {/* Demo Scenario Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {Object.entries(demoScenarios).map(([key, scenario]) => (
            <InteractiveCard
              key={key}
              onClick={() => setSelectedDemo(key)}
              selected={selectedDemo === key}
              className="text-center p-6 cursor-pointer"
            >
              <scenario.icon className="w-12 h-12 mx-auto mb-4 text-indigo-500" />
              <h3 className="font-semibold mb-2">{scenario.title}</h3>
              <p className="text-sm text-gray-600">{scenario.description}</p>
            </InteractiveCard>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Enhanced Control Panel */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">Control Panel</h2>
            
            <div className="space-y-4">
              <OneClickButton
                onClick={() => runFullDemo(selectedDemo)}
                disabled={isRunning}
                loading={isRunning}
                className="w-full"
              >
                <Play className="w-4 h-4" />
                Start Demo
              </OneClickButton>

              <OneClickButton
                onClick={resetDemo}
                disabled={isRunning}
                variant="secondary"
                className="w-full"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Demo
              </OneClickButton>
            </div>

            {/* Enhanced Progress Steps */}
            <div className="mt-8">
              <h3 className="font-semibold mb-4">Demo Progress</h3>
              <ProgressSteps steps={demoSteps} currentStep={currentStep} />
            </div>

            {/* Real-time Stats */}
            {stats && (
              <div className="mt-8 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                <h3 className="font-semibold mb-3">Live Blockchain Stats</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">{stats.totalBlocks}</div>
                    <div className="text-gray-600">Blocks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{stats.totalTransactions}</div>
                    <div className="text-gray-600">Transactions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.totalNodes}</div>
                    <div className="text-gray-600">Nodes</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${stats.isValid ? 'text-green-600' : 'text-red-600'}`}>
                      {stats.isValid ? '✓' : '✗'}
                    </div>
                    <div className="text-gray-600">Valid</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Demo Logs */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">Live Demo Logs</h2>
            <div className="bg-gray-900 text-green-400 p-6 rounded-lg h-96 overflow-y-auto font-mono text-sm">
              {logs.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <div>Select a demo scenario and click "Start Demo" to begin...</div>
                </div>
              ) : (
                logs.map((log, index) => (
                  <div 
                    key={index} 
                    className={`mb-2 animate-fade-in ${
                      log.type === 'error' ? 'text-red-400' :
                      log.type === 'success' ? 'text-green-400' :
                      log.type === 'warning' ? 'text-yellow-400' :
                      'text-blue-400'
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
                  </div>
                ))
              )}
            </div>
            
            {/* Demo Features Highlight */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Shield className="w-8 h-8 mx-auto text-green-500 mb-2" />
                <div className="font-semibold text-green-700">Security</div>
                <div className="text-sm text-green-600">GPS validation & smart contracts</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Smartphone className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                <div className="font-semibold text-blue-700">Offline Support</div>
                <div className="text-sm text-blue-600">SMS sync for remote areas</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <CheckCircle className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                <div className="font-semibold text-purple-700">Traceability</div>
                <div className="text-sm text-purple-600">Complete farm-to-consumer journey</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoSimulation;