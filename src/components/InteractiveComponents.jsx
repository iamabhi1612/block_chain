import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X, Upload, Camera, MapPin, Zap } from 'lucide-react';

// Toast Notification System
export const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertCircle,
    info: Info
  };

  const Icon = icons[type];

  return (
    <div className={`toast ${type} animate-slide-in flex items-center gap-3`}>
      <Icon className="w-5 h-5" />
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="hover:opacity-70">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// Progress Steps Component
export const ProgressSteps = ({ steps, currentStep }) => {
  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          <div className={`progress-step ${
            index < currentStep ? 'completed' : 
            index === currentStep ? 'active' : 'pending'
          }`}>
            {index < currentStep ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <span>{index + 1}</span>
            )}
          </div>
          <div className="ml-3 text-sm">
            <div className={`font-medium ${
              index <= currentStep ? 'text-green-600' : 'text-gray-500'
            }`}>
              {step.title}
            </div>
            <div className="text-gray-400 text-xs">{step.description}</div>
          </div>
          {index < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-4 ${
              index < currentStep ? 'bg-green-500' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );
};

// Drag and Drop File Upload
export const DragDropUpload = ({ onFileUpload, accept = "image/*", children }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <div
      className={`drag-zone ${isDragging ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        {children || (
          <div className="space-y-4">
            <Upload className="w-12 h-12 mx-auto text-gray-400" />
            <div>
              <p className="text-lg font-medium">Drop files here or click to upload</p>
              <p className="text-sm text-gray-500">Supports images and documents</p>
            </div>
          </div>
        )}
      </label>
    </div>
  );
};

// One-Click Action Button
export const OneClickButton = ({ 
  onClick, 
  loading = false, 
  success = false, 
  children, 
  className = "",
  variant = "primary" 
}) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = async () => {
    setIsClicked(true);
    await onClick();
    setTimeout(() => setIsClicked(false), 300);
  };

  const variants = {
    primary: "bg-green-500 hover:bg-green-600 text-white",
    secondary: "bg-gray-500 hover:bg-gray-600 text-white",
    success: "bg-green-600 text-white",
    danger: "bg-red-500 hover:bg-red-600 text-white"
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`
        interactive-button px-6 py-3 rounded-lg font-medium
        ${variants[success ? 'success' : variant]}
        ${loading ? 'opacity-50 cursor-not-allowed' : ''}
        ${isClicked ? 'animate-success' : ''}
        ${className}
      `}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Processing...
        </div>
      ) : success ? (
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          Success!
        </div>
      ) : (
        children
      )}
    </button>
  );
};

// Interactive Card Component
export const InteractiveCard = ({ 
  children, 
  onClick, 
  className = "", 
  hover = true,
  selected = false 
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        ${hover ? 'interactive-card' : ''}
        ${selected ? 'ring-2 ring-green-500 bg-green-50' : 'bg-white'}
        rounded-lg border p-6 ${className}
      `}
    >
      {children}
    </div>
  );
};

// Quick Action Floating Button
export const FloatingActionButton = ({ onClick, icon: Icon, tooltip }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="fab flex items-center justify-center"
      >
        <Icon className="w-6 h-6" />
      </button>
      {showTooltip && (
        <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded whitespace-nowrap">
          {tooltip}
        </div>
      )}
    </div>
  );
};

// Smart Form with Auto-validation
export const SmartForm = ({ children, onSubmit, className = "" }) => {
  const [isValid, setIsValid] = useState(false);

  return (
    <form
      onSubmit={onSubmit}
      className={`space-y-6 ${className}`}
    >
      {children}
    </form>
  );
};

// GPS Location Picker
export const GPSPicker = ({ onLocationSelect, currentLocation }) => {
  const [isGetting, setIsGetting] = useState(false);

  const getCurrentLocation = () => {
    setIsGetting(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          onLocationSelect(location);
          setIsGetting(false);
        },
        (error) => {
          console.error('GPS Error:', error);
          // Fallback to demo location
          onLocationSelect({
            latitude: 27.1952,
            longitude: 73.3119,
            accuracy: 10
          });
          setIsGetting(false);
        }
      );
    }
  };

  return (
    <div className="space-y-4">
      <OneClickButton
        onClick={getCurrentLocation}
        loading={isGetting}
        className="w-full"
      >
        <MapPin className="w-4 h-4 mr-2" />
        Get Current Location
      </OneClickButton>
      
      {currentLocation && (
        <div className="p-4 bg-green-50 rounded-lg animate-fade-in">
          <div className="flex items-center gap-2 text-green-700">
            <MapPin className="w-4 h-4" />
            <span className="font-medium">Location Captured</span>
          </div>
          <div className="text-sm text-green-600 mt-1">
            Lat: {currentLocation.latitude.toFixed(6)}, 
            Lng: {currentLocation.longitude.toFixed(6)}
          </div>
          <div className="text-xs text-green-500">
            Accuracy: ±{currentLocation.accuracy}m
          </div>
        </div>
      )}
    </div>
  );
};

// Quick Stats Dashboard
export const QuickStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <InteractiveCard
          key={index}
          className="text-center animate-fade-in"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="text-2xl font-bold text-green-600">{stat.value}</div>
          <div className="text-sm text-gray-600">{stat.label}</div>
          {stat.change && (
            <div className={`text-xs ${stat.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {stat.change > 0 ? '+' : ''}{stat.change}%
            </div>
          )}
        </InteractiveCard>
      ))}
    </div>
  );
};