import React, { useState, useEffect } from 'react';
import { Leaf, MapPin, Camera, Wifi, WifiOff, Upload, CheckCircle, AlertTriangle, Zap, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBlockchain } from '../contexts/BlockchainContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Toast, 
  ProgressSteps, 
  DragDropUpload, 
  OneClickButton, 
  InteractiveCard, 
  FloatingActionButton,
  GPSPicker,
  QuickStats 
} from '../components/InteractiveComponents';

const FarmerDashboard = () => {
  const { user } = useAuth();
  const { createTransaction, isOnline } = useBlockchain();
  
  // Enhanced state management
  const [collectionData, setCollectionData] = useState({
    species: 'ashwagandha',
    quantity: '',
    gps: null,
    qualityMetrics: {
      moisture: '',
      appearance: '',
      odor: ''
    },
    photos: []
  });
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [toast, setToast] = useState(null);
  const [recentCollections, setRecentCollections] = useState([]);
  
  // Collection workflow steps
  const collectionSteps = [
    { title: 'Species & Quantity', description: 'Select herb and amount' },
    { title: 'Location', description: 'Capture GPS coordinates' },
    { title: 'Quality Check', description: 'Record quality metrics' },
    { title: 'Photos', description: 'Take harvest photos' },
    { title: 'Submit', description: 'Record on blockchain' }
  ];

  // Quick stats for farmer
  const farmerStats = [
    { label: 'Today\'s Harvest', value: '25kg', change: 15 },
    { label: 'This Month', value: '450kg', change: 8 },
    { label: 'Quality Score', value: '98%', change: 2 },
    { label: 'Batches', value: '12', change: 0 }
  ];

  useEffect(() => {
    // Load recent collections from localStorage
    const saved = localStorage.getItem('recentCollections');
    if (saved) {
      setRecentCollections(JSON.parse(saved));
    }
    
    // Auto-detect GPS on component mount
    if (navigator.geolocation && !collectionData.gps) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          handleLocationSelect({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          console.log('GPS not available, using demo location');
          handleLocationSelect({
            latitude: 27.1952,
            longitude: 73.3119,
            accuracy: 10
          });
        }
      );
    }
  }, []);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const handleLocationSelect = (location) => {
    setCollectionData(prev => ({ ...prev, gps: location }));
    if (currentStep === 1) setCurrentStep(2);
    showToast('Location captured successfully!', 'success');
  };

  const handlePhotoUpload = (file) => {
    // Simulate photo processing
    const photoUrl = URL.createObjectURL(file);
    setCollectionData(prev => ({
      ...prev,
      photos: [...prev.photos, { url: photoUrl, name: file.name }]
    }));
    showToast('Photo added successfully!', 'success');
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return collectionData.species && collectionData.quantity;
      case 1:
        return collectionData.gps;
      case 2:
        return collectionData.qualityMetrics.moisture && 
               collectionData.qualityMetrics.appearance;
      case 3:
        return collectionData.photos.length > 0;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateCurrentStep() && currentStep < collectionSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      showToast('Please complete all required fields', 'warning');
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      await createTransaction({
        type: 'COLLECTION',
        data: {
          farmerId: user.id,
          species: collectionData.species,
          quantity: parseFloat(collectionData.quantity),
          location: collectionData.gps,
          qualityMetrics: collectionData.qualityMetrics,
          photos: collectionData.photos.map(p => p.name),
          timestamp: new Date().toISOString()
        }
      });

      // Save to recent collections
      const newCollection = {
        id: Date.now(),
        ...collectionData,
        timestamp: new Date().toISOString(),
        status: isOnline ? 'submitted' : 'pending'
      };
      
      const updated = [newCollection, ...recentCollections.slice(0, 4)];
      setRecentCollections(updated);
      localStorage.setItem('recentCollections', JSON.stringify(updated));

      setShowSuccess(true);
      showToast('Collection recorded successfully!', 'success');
      
      // Reset form after success
      setTimeout(() => {
        setCollectionData({
          species: 'ashwagandha',
          quantity: '',
          gps: null,
          qualityMetrics: { moisture: '', appearance: '', odor: '' },
          photos: []
        });
        setCurrentStep(0);
        setShowSuccess(false);
      }, 2000);

    } catch (error) {
      console.error('Error creating collection event:', error);
      showToast('Error recording collection: ' + error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickCollect = (species) => {
    setCollectionData(prev => ({ ...prev, species }));
    setCurrentStep(0);
    showToast(`Quick selected: ${species}`, 'info');
  };

  if (!user) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Farmer Dashboard
              </h1>
              <p className="text-gray-600 text-lg">Welcome back, {user.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                <span className="text-sm font-medium">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <QuickStats stats={farmerStats} />

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {['ashwagandha', 'tulsi', 'neem'].map((species) => (
            <InteractiveCard
              key={species}
              onClick={() => quickCollect(species)}
              className="text-center py-4 animate-fade-in"
            >
              <Leaf className="w-8 h-8 mx-auto text-green-500 mb-2" />
              <div className="font-medium capitalize">{species}</div>
              <div className="text-sm text-gray-500">Quick Collect</div>
            </InteractiveCard>
          ))}
        </div>

        {/* Enhanced Collection Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Leaf className="w-6 h-6 text-green-500" />
            Record Collection Event
          </h2>

          {/* Progress Steps */}
          <ProgressSteps steps={collectionSteps} currentStep={currentStep} />

          <div className="animate-fade-in">
            {/* Step 0: Species & Quantity */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Herb Species *
                  </label>
                  <select
                    value={collectionData.species}
                    onChange={(e) => setCollectionData(prev => ({ ...prev, species: e.target.value }))}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                  >
                    <option value="ashwagandha">🌿 Ashwagandha (Withania somnifera)</option>
                    <option value="tulsi">🍃 Tulsi (Ocimum sanctum)</option>
                    <option value="neem">🌳 Neem (Azadirachta indica)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity (kg) *
                  </label>
                  <input
                    type="number"
                    value={collectionData.quantity}
                    onChange={(e) => setCollectionData(prev => ({ ...prev, quantity: e.target.value }))}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                    placeholder="Enter quantity in kg"
                    min="0.1"
                    step="0.1"
                  />
                </div>
              </div>
            )}

            {/* Step 1: GPS Location */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Capture Location</h3>
                <GPSPicker
                  onLocationSelect={handleLocationSelect}
                  currentLocation={collectionData.gps}
                />
              </div>
            )}

            {/* Step 2: Quality Metrics */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Quality Assessment</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Moisture Content (%) *
                    </label>
                    <input
                      type="number"
                      value={collectionData.qualityMetrics.moisture}
                      onChange={(e) => setCollectionData(prev => ({
                        ...prev,
                        qualityMetrics: { ...prev.qualityMetrics, moisture: e.target.value }
                      }))}
                      className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., 8.5"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Appearance *
                    </label>
                    <select
                      value={collectionData.qualityMetrics.appearance}
                      onChange={(e) => setCollectionData(prev => ({
                        ...prev,
                        qualityMetrics: { ...prev.qualityMetrics, appearance: e.target.value }
                      }))}
                      className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select appearance</option>
                      <option value="excellent">✨ Excellent - Fresh, vibrant color</option>
                      <option value="good">👍 Good - Minor discoloration</option>
                      <option value="fair">⚠️ Fair - Some damage visible</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Odor Notes
                  </label>
                  <textarea
                    value={collectionData.qualityMetrics.odor}
                    onChange={(e) => setCollectionData(prev => ({
                      ...prev,
                      qualityMetrics: { ...prev.qualityMetrics, odor: e.target.value }
                    }))}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Describe the characteristic smell..."
                    rows="3"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Photos */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Upload Photos</h3>
                
                <DragDropUpload onFileUpload={handlePhotoUpload}>
                  <div className="space-y-4">
                    <Camera className="w-12 h-12 mx-auto text-gray-400" />
                    <div>
                      <p className="text-lg font-medium">Add harvest photos</p>
                      <p className="text-sm text-gray-500">Drag & drop or click to select images</p>
                    </div>
                  </div>
                </DragDropUpload>

                {collectionData.photos.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {collectionData.photos.map((photo, index) => (
                      <div key={index} className="relative animate-fade-in">
                        <img
                          src={photo.url}
                          alt={`Harvest ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Review & Submit */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Review & Submit</h3>
                
                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">Species:</span>
                      <div className="font-medium capitalize">{collectionData.species}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Quantity:</span>
                      <div className="font-medium">{collectionData.quantity} kg</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Location:</span>
                      <div className="font-medium">
                        {collectionData.gps ? 
                          `${collectionData.gps.latitude.toFixed(4)}, ${collectionData.gps.longitude.toFixed(4)}` : 
                          'Not captured'
                        }
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Photos:</span>
                      <div className="font-medium">{collectionData.photos.length} uploaded</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <OneClickButton
              onClick={prevStep}
              variant="secondary"
              className={currentStep === 0 ? 'invisible' : ''}
            >
              Previous
            </OneClickButton>

            {currentStep < collectionSteps.length - 1 ? (
              <OneClickButton
                onClick={nextStep}
                disabled={!validateCurrentStep()}
              >
                Next Step
              </OneClickButton>
            ) : (
              <OneClickButton
                onClick={handleSubmit}
                loading={isSubmitting}
                success={showSuccess}
                disabled={!validateCurrentStep()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Submit Collection
              </OneClickButton>
            )}
          </div>
        </div>

        {/* Recent Collections */}
        {recentCollections.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Recent Collections</h3>
            <div className="space-y-3">
              {recentCollections.map((collection) => (
                <InteractiveCard
                  key={collection.id}
                  className="flex items-center justify-between p-4"
                >
                  <div className="flex items-center gap-4">
                    <Leaf className="w-8 h-8 text-green-500" />
                    <div>
                      <div className="font-medium capitalize">{collection.species}</div>
                      <div className="text-sm text-gray-500">
                        {collection.quantity}kg • {new Date(collection.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    collection.status === 'submitted' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {collection.status}
                  </div>
                </InteractiveCard>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton
        onClick={() => {
          setCurrentStep(0);
          setCollectionData({
            species: 'ashwagandha',
            quantity: '',
            gps: null,
            qualityMetrics: { moisture: '', appearance: '', odor: '' },
            photos: []
          });
        }}
        icon={Plus}
        tooltip="New Collection"
      />
    </div>
  );
};

export default FarmerDashboard;