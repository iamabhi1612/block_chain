import React, { useState, useEffect } from 'react';
import { QrCode, Leaf, MapPin, Award, Shield, Calendar, User, Factory, FlaskConical, Camera, Search, Star, CheckCircle } from 'lucide-react';
import { useBlockchain } from '../contexts/BlockchainContext';
import { 
  Toast, 
  InteractiveCard, 
  OneClickButton, 
  DragDropUpload,
  QuickStats 
} from '../components/InteractiveComponents';

const ConsumerPortal = () => {
  const { getTransactionsByBatchId } = useBlockchain();
  
  const [qrResult, setQrResult] = useState('');
  const [batchData, setBatchData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedStep, setSelectedStep] = useState(null);
  const [showCamera, setShowCamera] = useState(false);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  // Demo QR codes for testing
  const demoQRCodes = [
    'ASH-2024-001',
    'TUL-2024-002', 
    'NEEM-2024-003'
  ];

  const handleQRScan = async (qrCode) => {
    setLoading(true);
    setQrResult(qrCode);
    
    try {
      // In a real app, this would decode the QR and extract batch ID
      const batchId = qrCode;
      const transactions = await getTransactionsByBatchId(batchId);
      
      if (transactions.length === 0) {
        showToast('No data found for this batch', 'warning');
        return;
      }

      // Process transactions into structured data
      const processedData = {
        collectionEvent: transactions.find(t => t.type === 'CollectionEvent'),
        processingSteps: transactions.filter(t => t.type === 'ProcessingStep'),
        qualityTest: transactions.find(t => t.type === 'QualityTest'),
        manufacturingRecord: transactions.find(t => t.type === 'ManufacturingRecord')
      };
      
      setBatchData(processedData);
      showToast('Product information loaded successfully!', 'success');
      
    } catch (error) {
      console.error('Error fetching batch data:', error);
      showToast('Error loading product information', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (file) => {
    // Simulate QR code detection from image
    showToast('Scanning QR code from image...', 'info');
    setTimeout(() => {
      const demoCode = demoQRCodes[Math.floor(Math.random() * demoQRCodes.length)];
      handleQRScan(demoCode);
    }, 1500);
  };

  const startCameraScanning = () => {
    setShowCamera(true);
    showToast('Camera scanning started', 'info');
    // Simulate camera scanning
    setTimeout(() => {
      const demoCode = demoQRCodes[0];
      handleQRScan(demoCode);
      setShowCamera(false);
    }, 3000);
  };

  const getQualityScore = (batchData) => {
    if (!batchData?.qualityTest) return 0;
    const results = batchData.qualityTest.data.testResults;
    let score = 100;
    
    // Deduct points for quality issues
    if (results.withanolideContent < 0.3) score -= 20;
    if (results.moisture > 10) score -= 15;
    if (results.heavyMetals?.lead > 2) score -= 10;
    
    return Math.max(score, 0);
  };

  const getSustainabilityBadges = (batchData) => {
    const badges = [];
    if (batchData?.collectionEvent?.data?.organicCertified) {
      badges.push({ name: 'Organic', icon: '🌱', color: 'green' });
    }
    if (batchData?.collectionEvent?.data?.harvestMethod === 'manual') {
      badges.push({ name: 'Hand Harvested', icon: '👐', color: 'blue' });
    }
    if (batchData?.qualityTest?.data?.certificationStatus === 'PASSED') {
      badges.push({ name: 'Lab Certified', icon: '🧪', color: 'purple' });
    }
    return badges;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-4xl mx-auto">
        {/* Enhanced Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 animate-fade-in">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
            Consumer Portal
          </h1>
          <p className="text-gray-600 text-lg">Discover the complete journey of your Ayurvedic product</p>
        </div>

        {/* Enhanced QR Scanner Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <QrCode className="w-6 h-6 text-blue-500" />
            Scan Your Product
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Camera Scan */}
            <InteractiveCard className="text-center p-6">
              <Camera className="w-12 h-12 mx-auto text-blue-500 mb-4" />
              <h3 className="font-semibold mb-2">Camera Scan</h3>
              <p className="text-sm text-gray-600 mb-4">Point camera at QR code</p>
              <OneClickButton
                onClick={startCameraScanning}
                loading={showCamera}
                className="w-full"
              >
                {showCamera ? 'Scanning...' : 'Start Camera'}
              </OneClickButton>
            </InteractiveCard>

            {/* Upload Image */}
            <InteractiveCard className="text-center p-6">
              <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                <QrCode className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="font-semibold mb-2">Upload Image</h3>
              <p className="text-sm text-gray-600 mb-4">Upload photo with QR code</p>
              <DragDropUpload onFileUpload={handleImageUpload}>
                <div className="py-4">
                  <span className="text-sm font-medium">Drop image here</span>
                </div>
              </DragDropUpload>
            </InteractiveCard>

            {/* Manual Entry */}
            <InteractiveCard className="text-center p-6">
              <Search className="w-12 h-12 mx-auto text-purple-500 mb-4" />
              <h3 className="font-semibold mb-2">Manual Entry</h3>
              <p className="text-sm text-gray-600 mb-4">Type batch ID manually</p>
              <div className="space-y-2">
                <input
                  type="text"
                  value={qrResult}
                  onChange={(e) => setQrResult(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center"
                  placeholder="ASH-2024-001"
                />
                <OneClickButton
                  onClick={() => handleQRScan(qrResult)}
                  disabled={loading || !qrResult}
                  className="w-full"
                >
                  Search
                </OneClickButton>
              </div>
            </InteractiveCard>
          </div>

          {/* Demo QR Codes */}
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-3">Try Demo Products:</h3>
            <div className="flex flex-wrap gap-2">
              {demoQRCodes.map((code) => (
                <button
                  key={code}
                  onClick={() => handleQRScan(code)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                >
                  {code}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Information */}
        {batchData && (
          <div className="space-y-6 animate-fade-in">
            {/* Product Overview with Quality Score */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Product Information</h2>
                <div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full">
                  <Star className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-700">
                    Quality Score: {getQualityScore(batchData)}%
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                {[
                  { 
                    label: 'Species', 
                    value: batchData.collectionEvent?.data.species || 'Unknown',
                    icon: Leaf,
                    color: 'green'
                  },
                  { 
                    label: 'Batch ID', 
                    value: qrResult,
                    icon: QrCode,
                    color: 'blue'
                  },
                  { 
                    label: 'Harvest Date', 
                    value: batchData.collectionEvent ? 
                      new Date(batchData.collectionEvent.timestamp).toLocaleDateString() : 'N/A',
                    icon: Calendar,
                    color: 'purple'
                  },
                  { 
                    label: 'Origin', 
                    value: batchData.collectionEvent?.data.gps ? 
                      `${batchData.collectionEvent.data.gps.latitude.toFixed(2)}, ${batchData.collectionEvent.data.gps.longitude.toFixed(2)}` : 
                      'Location not available',
                    icon: MapPin,
                    color: 'red'
                  }
                ].map((item, index) => (
                  <InteractiveCard key={index} className="text-center p-4">
                    <item.icon className={`w-8 h-8 mx-auto mb-2 text-${item.color}-500`} />
                    <div className="text-sm text-gray-500">{item.label}</div>
                    <div className="font-semibold capitalize">{item.value}</div>
                  </InteractiveCard>
                ))}
              </div>

              {/* Sustainability Badges */}
              <div className="flex flex-wrap gap-2">
                {getSustainabilityBadges(batchData).map((badge, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-${badge.color}-100 text-${badge.color}-700`}
                  >
                    <span>{badge.icon}</span>
                    {badge.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Supply Chain Journey */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-6">Supply Chain Journey</h2>
              
              <div className="space-y-6">
                {/* Collection Event */}
                {batchData.collectionEvent && (
                  <InteractiveCard
                    onClick={() => setSelectedStep(selectedStep === 'collection' ? null : 'collection')}
                    selected={selectedStep === 'collection'}
                    className="cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                        <Leaf className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-green-700 text-lg">Collection Event</h3>
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        </div>
                        <p className="text-green-600 mb-3">
                          Harvested by {batchData.collectionEvent.data.farmerId}
                        </p>
                        
                        {selectedStep === 'collection' && (
                          <div className="grid grid-cols-2 gap-4 text-sm animate-fade-in">
                            <div>
                              <span className="font-medium">Quantity:</span> {batchData.collectionEvent.data.quantity} kg
                            </div>
                            <div>
                              <span className="font-medium">Method:</span> {batchData.collectionEvent.data.harvestMethod}
                            </div>
                            {batchData.collectionEvent.data.qualityMetrics?.moisture && (
                              <div>
                                <span className="font-medium">Moisture:</span> {batchData.collectionEvent.data.qualityMetrics.moisture}%
                              </div>
                            )}
                            <div>
                              <span className="font-medium">GPS:</span> 
                              {batchData.collectionEvent.data.gps ? 
                                `${batchData.collectionEvent.data.gps.latitude.toFixed(4)}, ${batchData.collectionEvent.data.gps.longitude.toFixed(4)}` : 
                                'Not available'
                              }
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </InteractiveCard>
                )}

                {/* Processing Steps */}
                {batchData.processingSteps?.map((step, index) => (
                  <InteractiveCard
                    key={index}
                    onClick={() => setSelectedStep(selectedStep === `processing-${index}` ? null : `processing-${index}`)}
                    selected={selectedStep === `processing-${index}`}
                    className="cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                        <Factory className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-blue-700 text-lg">
                            Processing: {step.data.processingType.replace('_', ' ').toUpperCase()}
                          </h3>
                          <CheckCircle className="w-5 h-5 text-blue-500" />
                        </div>
                        <p className="text-blue-600 mb-3">
                          Processed by {step.nodeId}
                        </p>
                        
                        {selectedStep === `processing-${index}` && (
                          <div className="grid grid-cols-2 gap-4 text-sm animate-fade-in">
                            <div>
                              <span className="font-medium">Input:</span> {step.data.inputQuantity} kg
                            </div>
                            <div>
                              <span className="font-medium">Output:</span> {step.data.outputQuantity} kg
                            </div>
                            {step.data.conditions?.temperature && (
                              <div>
                                <span className="font-medium">Temperature:</span> {step.data.conditions.temperature}°C
                              </div>
                            )}
                            {step.data.conditions?.duration && (
                              <div>
                                <span className="font-medium">Duration:</span> {step.data.conditions.duration} hours
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </InteractiveCard>
                ))}

                {/* Quality Test */}
                {batchData.qualityTest && (
                  <InteractiveCard
                    onClick={() => setSelectedStep(selectedStep === 'quality' ? null : 'quality')}
                    selected={selectedStep === 'quality'}
                    className="cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                        <FlaskConical className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-purple-700 text-lg">Quality Testing</h3>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            batchData.qualityTest.data.certificationStatus === 'PASSED'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {batchData.qualityTest.data.certificationStatus}
                          </div>
                        </div>
                        <p className="text-purple-600 mb-3">
                          Tested by {batchData.qualityTest.data.labId}
                        </p>
                        
                        {selectedStep === 'quality' && (
                          <div className="space-y-4 animate-fade-in">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Withanolide:</span> {batchData.qualityTest.data.testResults.withanolideContent}%
                              </div>
                              <div>
                                <span className="font-medium">Moisture:</span> {batchData.qualityTest.data.testResults.moisture}%
                              </div>
                              <div>
                                <span className="font-medium">Heavy Metals:</span> 
                                {batchData.qualityTest.data.testResults.heavyMetals ? 
                                  `${batchData.qualityTest.data.testResults.heavyMetals.lead} ppm Pb` : 
                                  'Within limits'
                                }
                              </div>
                              <div>
                                <span className="font-medium">Pesticides:</span> 
                                {batchData.qualityTest.data.testResults.pesticides?.organochlorines || 'Not detected'}
                              </div>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-lg">
                              <div className="text-sm">
                                <span className="font-medium">Report:</span> {batchData.qualityTest.data.reportNumber}
                              </div>
                              <div className="text-sm">
                                <span className="font-medium">Technician:</span> {batchData.qualityTest.data.labTechnician}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </InteractiveCard>
                )}

                {/* Manufacturing */}
                {batchData.manufacturingRecord && (
                  <InteractiveCard
                    onClick={() => setSelectedStep(selectedStep === 'manufacturing' ? null : 'manufacturing')}
                    selected={selectedStep === 'manufacturing'}
                    className="cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                        <Factory className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-orange-700 text-lg">Manufacturing</h3>
                          <CheckCircle className="w-5 h-5 text-orange-500" />
                        </div>
                        <p className="text-orange-600 mb-3">
                          Manufactured by {batchData.manufacturingRecord.data.manufacturerId}
                        </p>
                        
                        {selectedStep === 'manufacturing' && (
                          <div className="grid grid-cols-2 gap-4 text-sm animate-fade-in">
                            <div>
                              <span className="font-medium">Product:</span> {batchData.manufacturingRecord.data.productType.replace('_', ' ')}
                            </div>
                            <div>
                              <span className="font-medium">Output:</span> {batchData.manufacturingRecord.data.outputQuantity} units
                            </div>
                            <div>
                              <span className="font-medium">Batch:</span> {batchData.manufacturingRecord.data.batchNumber}
                            </div>
                            <div>
                              <span className="font-medium">Expiry:</span> {new Date(batchData.manufacturingRecord.data.expiryDate).toLocaleDateString()}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </InteractiveCard>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsumerPortal;