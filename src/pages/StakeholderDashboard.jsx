import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, AlertTriangle, CheckCircle, Users, Package, MapPin, Calendar, Download, Filter, Bell, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBlockchain } from '../contexts/BlockchainContext';
import { 
  Toast, 
  InteractiveCard, 
  OneClickButton, 
  QuickStats 
} from '../components/InteractiveComponents';

const StakeholderDashboard = () => {
  const { user } = useAuth();
  const { getStats, getAllTransactions } = useBlockchain();
  
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [toast, setToast] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [showAlerts, setShowAlerts] = useState(false);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  useEffect(() => {
    loadDashboardData();
    generateAlerts();
  }, []);

  const loadDashboardData = async () => {
    try {
      const blockchainStats = await getStats();
      const allTransactions = await getAllTransactions();
      
      setStats(blockchainStats);
      setTransactions(allTransactions);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      showToast('Error loading dashboard data', 'error');
    }
  };

  const generateAlerts = () => {
    const mockAlerts = [
      {
        id: 1,
        type: 'warning',
        title: 'Quality Alert',
        message: 'Batch ASH-2024-002 has moisture content above threshold',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        priority: 'high'
      },
      {
        id: 2,
        type: 'info',
        title: 'New Collection',
        message: 'FARMER001 recorded new Ashwagandha collection (25kg)',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        priority: 'medium'
      },
      {
        id: 3,
        type: 'success',
        title: 'Quality Passed',
        message: 'Lab testing completed for batch TUL-2024-003',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        priority: 'low'
      }
    ];
    setAlerts(mockAlerts);
  };

  const generateReport = () => {
    showToast('Generating compliance report...', 'info');
    setTimeout(() => {
      showToast('Report generated successfully!', 'success');
    }, 2000);
  };

  const filteredTransactions = transactions.filter(tx => {
    if (selectedFilter === 'all') return true;
    return tx.type === selectedFilter;
  });

  const dashboardStats = [
    { label: 'Total Batches', value: stats?.totalTransactions || 0, change: 12 },
    { label: 'Active Farmers', value: '24', change: 8 },
    { label: 'Quality Score', value: '96%', change: 2 },
    { label: 'Compliance Rate', value: '98%', change: 1 }
  ];

  const getTransactionIcon = (type) => {
    const icons = {
      CollectionEvent: Package,
      ProcessingStep: BarChart3,
      QualityTest: CheckCircle,
      ManufacturingRecord: Users,
      ComplianceReport: AlertTriangle
    };
    return icons[type] || Package;
  };

  const getTransactionColor = (type) => {
    const colors = {
      CollectionEvent: 'green',
      ProcessingStep: 'blue',
      QualityTest: 'purple',
      ManufacturingRecord: 'orange',
      ComplianceReport: 'red'
    };
    return colors[type] || 'gray';
  };

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {user?.nodeType?.charAt(0).toUpperCase() + user?.nodeType?.slice(1)} Dashboard
              </h1>
              <p className="text-gray-600 text-lg">Welcome back, {user?.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <OneClickButton
                onClick={() => setShowAlerts(!showAlerts)}
                variant="secondary"
                className="relative"
              >
                <Bell className="w-4 h-4 mr-2" />
                Alerts
                {alerts.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {alerts.length}
                  </span>
                )}
              </OneClickButton>
              <OneClickButton onClick={generateReport}>
                <Download className="w-4 h-4 mr-2" />
                Generate Report
              </OneClickButton>
            </div>
          </div>
        </div>

        {/* Alerts Panel */}
        {showAlerts && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 animate-slide-in">
            <h2 className="text-xl font-semibold mb-4">Recent Alerts</h2>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <InteractiveCard
                  key={alert.id}
                  className={`border-l-4 ${
                    alert.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                    alert.type === 'success' ? 'border-green-500 bg-green-50' :
                    'border-blue-500 bg-blue-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{alert.title}</h3>
                      <p className="text-sm text-gray-600">{alert.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {alert.timestamp.toLocaleString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      alert.priority === 'high' ? 'bg-red-100 text-red-700' :
                      alert.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {alert.priority}
                    </span>
                  </div>
                </InteractiveCard>
              ))}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <QuickStats stats={dashboardStats} />

        {/* Interactive Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <InteractiveCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">Harvest Volume Trends</h3>
            <div className="h-64 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 mx-auto text-green-500 mb-4" />
                <p className="text-gray-600">Interactive chart would display here</p>
                <p className="text-sm text-gray-500">Showing harvest volumes over time</p>
              </div>
            </div>
          </InteractiveCard>

          <InteractiveCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">Quality Compliance</h3>
            <div className="h-64 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="w-16 h-16 mx-auto text-purple-500 mb-4" />
                <p className="text-gray-600">Quality metrics visualization</p>
                <p className="text-sm text-gray-500">Real-time compliance tracking</p>
              </div>
            </div>
          </InteractiveCard>
        </div>

        {/* Transaction Management */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Transaction Management</h2>
            <div className="flex items-center gap-4">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Transactions</option>
                <option value="CollectionEvent">Collection Events</option>
                <option value="ProcessingStep">Processing Steps</option>
                <option value="QualityTest">Quality Tests</option>
                <option value="ManufacturingRecord">Manufacturing</option>
              </select>
              <OneClickButton variant="secondary">
                <Filter className="w-4 h-4 mr-2" />
                Advanced Filter
              </OneClickButton>
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredTransactions.slice(0, 10).map((transaction, index) => {
              const Icon = getTransactionIcon(transaction.type);
              const color = getTransactionColor(transaction.type);
              
              return (
                <InteractiveCard
                  key={transaction.id}
                  className="flex items-center justify-between p-4 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 bg-${color}-100 rounded-full flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 text-${color}-600`} />
                    </div>
                    <div>
                      <div className="font-medium">{transaction.type.replace(/([A-Z])/g, ' $1').trim()}</div>
                      <div className="text-sm text-gray-500">
                        {transaction.nodeId} • {new Date(transaction.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${color}-100 text-${color}-700`}>
                      {transaction.contractValidation?.valid ? 'Valid' : 'Pending'}
                    </span>
                    <OneClickButton
                      onClick={() => showToast(`Viewing details for ${transaction.id}`, 'info')}
                      variant="secondary"
                      className="px-3 py-1 text-sm"
                    >
                      <Eye className="w-4 h-4" />
                    </OneClickButton>
                  </div>
                </InteractiveCard>
              );
            })}
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No transactions found for the selected filter</p>
            </div>
          )}
        </div>

        {/* Network Health */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-6">Network Health</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InteractiveCard className="text-center p-6">
              <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
              <h3 className="font-semibold text-green-700">Blockchain Status</h3>
              <p className="text-sm text-gray-600">All systems operational</p>
              <div className="mt-2 text-2xl font-bold text-green-600">
                {stats.isValid ? '✓' : '✗'}
              </div>
            </InteractiveCard>

            <InteractiveCard className="text-center p-6">
              <Users className="w-12 h-12 mx-auto text-blue-500 mb-4" />
              <h3 className="font-semibold text-blue-700">Active Nodes</h3>
              <p className="text-sm text-gray-600">Connected stakeholders</p>
              <div className="mt-2 text-2xl font-bold text-blue-600">
                {stats.totalNodes}
              </div>
            </InteractiveCard>

            <InteractiveCard className="text-center p-6">
              <Package className="w-12 h-12 mx-auto text-purple-500 mb-4" />
              <h3 className="font-semibold text-purple-700">Pending Transactions</h3>
              <p className="text-sm text-gray-600">Awaiting processing</p>
              <div className="mt-2 text-2xl font-bold text-purple-600">
                {stats.pendingTransactions}
              </div>
            </InteractiveCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StakeholderDashboard;