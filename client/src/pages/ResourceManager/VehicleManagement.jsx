import { useState, useEffect } from "react";
import { 
  Truck, 
  Car, 
  Bike,
  Plus,
  Edit3,
  Trash2,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  Fuel,
  Calendar,
  MapPin,
  Settings,
  Filter,
  Search,
  Download,
  Upload,
  MoreHorizontal,
  User,
  Package
} from "lucide-react";
import { useTheme } from "../../context/theme/ThemeContext.jsx";
import { useVehicles } from "../../context/vehicle/VehicleContext.jsx";

const VehicleManagement = () => {
  const { isDarkMode } = useTheme();
  const { vehicles, addVehicle, updateVehicle, deleteVehicle } = useVehicles();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCondition, setFilterCondition] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [newVehicle, setNewVehicle] = useState({
    ownerName: "",
    vehicleNo: "",
    type: "",
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    mileage: "",
    fuelType: "petrol",
    condition: "excellent",
    lastService: "",
    nextService: "",
    registrationExp: "",
    insuranceExp: "",
    notes: ""
  });

  const vehicleTypes = [
    { value: "three-wheel", label: "Three-wheeler", icon: "🛺" },
    { value: "bike", label: "Motorcycle", icon: "🏍️" },
    { value: "van", label: "Van", icon: "🚐" },
    { value: "truck", label: "Truck", icon: "🚛" },
    { value: "car", label: "Car", icon: "🚗" },
    { value: "lorry", label: "Lorry", icon: "🚚" },
    { value: "pickup", label: "Pickup", icon: "🛻" },
    { value: "other", label: "Other", icon: "🚙" }
  ];

  const conditionOptions = [
    { value: "excellent", label: "Excellent", color: "text-green-600 bg-green-100", icon: CheckCircle },
    { value: "good", label: "Good", color: "text-blue-600 bg-blue-100", icon: CheckCircle },
    { value: "fair", label: "Fair", color: "text-yellow-600 bg-yellow-100", icon: Clock },
    { value: "poor", label: "Poor", color: "text-orange-600 bg-orange-100", icon: AlertTriangle },
    { value: "critical", label: "Critical", color: "text-red-600 bg-red-100", icon: AlertTriangle }
  ];

  const statusOptions = [
    { value: "available", label: "Available", color: "text-green-600 bg-green-100" },
    { value: "in-use", label: "In Use", color: "text-blue-600 bg-blue-100" },
    { value: "maintenance", label: "Maintenance", color: "text-yellow-600 bg-yellow-100" },
    { value: "out-of-service", label: "Out of Service", color: "text-red-600 bg-red-100" }
  ];

  const fuelTypes = ["petrol", "diesel", "electric", "hybrid", "cng"];

  // Calculate vehicle condition based on last service date and service interval
  const calculateConditionBasedOnService = (lastServiceDate, nextServiceDate) => {
    if (!lastServiceDate) return "good"; // Default if no service date
    
    const today = new Date();
    const serviceDate = new Date(lastServiceDate);
    const nextService = new Date(nextServiceDate);
    
    // Calculate the service interval in days
    let serviceIntervalDays;
    if (nextServiceDate && lastServiceDate) {
      serviceIntervalDays = Math.floor((nextService - serviceDate) / (1000 * 60 * 60 * 24));
    } else {
      serviceIntervalDays = 365; // Default to 1 year if no next service date
    }
    
    const daysSinceService = Math.floor((today - serviceDate) / (1000 * 60 * 60 * 24));
    
    // Divide the service interval into 5 equal periods
    const period1 = serviceIntervalDays * 0.2;  // First 20% - Excellent
    const period2 = serviceIntervalDays * 0.4;  // Next 20% - Good  
    const period3 = serviceIntervalDays * 0.6;  // Next 20% - Fair
    const period4 = serviceIntervalDays * 0.8;  // Next 20% - Poor
    const period5 = serviceIntervalDays;        // Last 20% - Critical
    
    if (daysSinceService <= period1) {
      return "excellent"; // 0-20% of service interval
    } else if (daysSinceService <= period2) {
      return "good"; // 20-40% of service interval
    } else if (daysSinceService <= period3) {
      return "fair"; // 40-60% of service interval
    } else if (daysSinceService <= period4) {
      return "poor"; // 60-80% of service interval
    } else if (daysSinceService <= period5) {
      return "critical"; // 80-100% of service interval
    } else {
      return "critical"; // Over service interval
    }
  };

  const handleAddVehicle = () => {
    if (newVehicle.vehicleNo && newVehicle.type && newVehicle.brand && newVehicle.model && newVehicle.ownerName) {
      const vehicle = {
        ...newVehicle,
        mileage: parseInt(newVehicle.mileage) || 0,
        status: "available" // Default status
      };
      addVehicle(vehicle);
      setNewVehicle({
        ownerName: "",
        vehicleNo: "",
        type: "",
        brand: "",
        model: "",
        year: new Date().getFullYear(),
        mileage: "",
        fuelType: "petrol",
        condition: "excellent",
        lastService: "",
        nextService: "",
        registrationExp: "",
        insuranceExp: "",
        notes: ""
      });
      setShowAddForm(false);
    }
  };

  const handleEditVehicle = (vehicle) => {
    setEditingVehicle({ ...vehicle });
  };

  const handleUpdateVehicle = () => {
    updateVehicle(editingVehicle.id, editingVehicle);
    setEditingVehicle(null);
  };

  const handleDeleteVehicle = (id) => {
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      deleteVehicle(id);
    }
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.vehicleNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (vehicle.ownerName && vehicle.ownerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (vehicle.assignedDriver && vehicle.assignedDriver.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === "all" || vehicle.status === filterStatus;
    const calculatedCondition = calculateConditionBasedOnService(vehicle.lastService, vehicle.nextService);
    const matchesCondition = filterCondition === "all" || calculatedCondition === filterCondition;
    return matchesSearch && matchesStatus && matchesCondition;
  });

  const getConditionInfo = (condition) => {
    return conditionOptions.find(opt => opt.value === condition);
  };

  const getStatusInfo = (status) => {
    return statusOptions.find(opt => opt.value === status);
  };

  const getVehicleIcon = (type) => {
    return vehicleTypes.find(vt => vt.value === type)?.icon || "🚗";
  };

  const isServiceDue = (nextServiceDate) => {
    const today = new Date();
    const serviceDate = new Date(nextServiceDate);
    const diffTime = serviceDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  };

  const isDocumentExpiring = (expDate) => {
    const today = new Date();
    const docDate = new Date(expDate);
    const diffTime = docDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 60;
  };

  return (
    <div className={`max-w-7xl mx-auto p-6 space-y-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      {/* Header */}
      <div className={`bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Truck className="w-8 h-8" />
              <h2 className="text-3xl font-bold">Vehicle Fleet Management</h2>
            </div>
            <p className="text-blue-100">
              Manage company vehicles, track maintenance, and monitor fleet status in real-time.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.href = '/resource-manager/resources'}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200 backdrop-blur-sm"
              title="Go to Resource Assignment"
            >
              <Package className="w-5 h-5" />
              <span className="hidden sm:inline">Assign Resources</span>
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200 backdrop-blur-sm"
              title="Add new vehicle"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Add Vehicle</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search vehicles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="all">All Status</option>
            {statusOptions.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>

          <select
            value={filterCondition}
            onChange={(e) => setFilterCondition(e.target.value)}
            className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="all">All Conditions</option>
            {conditionOptions.map(condition => (
              <option key={condition.value} value={condition.value}>{condition.label}</option>
            ))}
          </select>

          <div className="ml-auto text-sm text-gray-500">
            {filteredVehicles.length} of {vehicles.length} vehicles
          </div>
        </div>
      </div>

      {/* Vehicle Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle) => {
          const calculatedCondition = calculateConditionBasedOnService(vehicle.lastService, vehicle.nextService);
          const conditionInfo = getConditionInfo(calculatedCondition);
          const statusInfo = getStatusInfo(vehicle.status);
          const serviceDue = isServiceDue(vehicle.nextService);
          const regExpiring = isDocumentExpiring(vehicle.registrationExp);
          const insExpiring = isDocumentExpiring(vehicle.insuranceExp);

          return (
            <div key={vehicle.id} className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              {/* Vehicle Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{getVehicleIcon(vehicle.type)}</div>
                  <div>
                    <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {vehicle.vehicleNo}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {vehicle.year} {vehicle.brand} {vehicle.model}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEditVehicle(vehicle)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteVehicle(vehicle.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Status and Condition */}
              <div className="flex gap-2 mb-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo?.color}`}>
                  {statusInfo?.label}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${conditionInfo?.color}`}>
                  {conditionInfo?.label}
                </span>
              </div>

              {/* Vehicle Details */}
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                    <strong>Owner:</strong> {vehicle.ownerName || "Unknown"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                    {vehicle.location}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Fuel className="w-4 h-4 text-gray-400" />
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                    {vehicle.mileage.toLocaleString()} km • {vehicle.fuelType}
                  </span>
                </div>
              </div>

              {/* Alerts */}
              {(serviceDue || regExpiring || insExpiring) && (
                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="space-y-1">
                    {serviceDue && (
                      <div className="flex items-center gap-2 text-yellow-600 text-xs">
                        <AlertTriangle className="w-3 h-3" />
                        Service due: {vehicle.nextService}
                      </div>
                    )}
                    {regExpiring && (
                      <div className="flex items-center gap-2 text-orange-600 text-xs">
                        <AlertTriangle className="w-3 h-3" />
                        Registration expires: {vehicle.registrationExp}
                      </div>
                    )}
                    {insExpiring && (
                      <div className="flex items-center gap-2 text-red-600 text-xs">
                        <AlertTriangle className="w-3 h-3" />
                        Insurance expires: {vehicle.insuranceExp}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Vehicle Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 w-full max-w-2xl max-h-screen overflow-y-auto`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Add New Vehicle
              </h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4 space-y-0">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Owner Name *
                </label>
                <input
                  type="text"
                  value={newVehicle.ownerName}
                  onChange={(e) => setNewVehicle({...newVehicle, ownerName: e.target.value})}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="e.g., John Doe"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Vehicle Number *
                </label>
                <input
                  type="text"
                  value={newVehicle.vehicleNo}
                  onChange={(e) => setNewVehicle({...newVehicle, vehicleNo: e.target.value})}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="e.g., WP CAA-1234"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Vehicle Type *
                </label>
                <select
                  value={newVehicle.type}
                  onChange={(e) => setNewVehicle({...newVehicle, type: e.target.value})}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">Select type</option>
                  {vehicleTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Brand *
                </label>
                <input
                  type="text"
                  value={newVehicle.brand}
                  onChange={(e) => setNewVehicle({...newVehicle, brand: e.target.value})}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="e.g., Toyota"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Model *
                </label>
                <input
                  type="text"
                  value={newVehicle.model}
                  onChange={(e) => setNewVehicle({...newVehicle, model: e.target.value})}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="e.g., Hiace"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Year *
                </label>
                <input
                  type="number"
                  value={newVehicle.year}
                  onChange={(e) => setNewVehicle({...newVehicle, year: parseInt(e.target.value)})}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  min="1990"
                  max={new Date().getFullYear() + 1}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Current Mileage (km) *
                </label>
                <input
                  type="number"
                  value={newVehicle.mileage}
                  onChange={(e) => setNewVehicle({...newVehicle, mileage: e.target.value})}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="0"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Fuel Type *
                </label>
                <select
                  value={newVehicle.fuelType}
                  onChange={(e) => setNewVehicle({...newVehicle, fuelType: e.target.value})}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  {fuelTypes.map(fuel => (
                    <option key={fuel} value={fuel}>{fuel.charAt(0).toUpperCase() + fuel.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Registration Expiry *
                </label>
                <input
                  type="date"
                  value={newVehicle.registrationExp}
                  onChange={(e) => setNewVehicle({...newVehicle, registrationExp: e.target.value})}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Insurance Expiry *
                </label>
                <input
                  type="date"
                  value={newVehicle.insuranceExp}
                  onChange={(e) => setNewVehicle({...newVehicle, insuranceExp: e.target.value})}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Last Service Date
                </label>
                <input
                  type="date"
                  value={newVehicle.lastService}
                  onChange={(e) => setNewVehicle({...newVehicle, lastService: e.target.value})}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Next Service Date
                </label>
                <input
                  type="date"
                  value={newVehicle.nextService}
                  onChange={(e) => setNewVehicle({...newVehicle, nextService: e.target.value})}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>

            <div className="mt-4">
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Notes
              </label>
              <textarea
                value={newVehicle.notes}
                onChange={(e) => setNewVehicle({...newVehicle, notes: e.target.value})}
                rows="3"
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="Additional notes about the vehicle..."
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddVehicle}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Add Vehicle
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className={`flex-1 border py-2 rounded-lg font-semibold transition-colors ${
                  isDarkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Vehicle Modal */}
      {editingVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 w-full max-w-2xl max-h-screen overflow-y-auto`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Edit Vehicle: {editingVehicle.vehicleNo}
              </h3>
              <button
                onClick={() => setEditingVehicle(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Display Vehicle Information (Read-only) */}
            <div className={`bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'} border`}>
              <h4 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Vehicle Information</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Owner: </span>
                  <span className={isDarkMode ? 'text-gray-200' : 'text-gray-800'}>{editingVehicle.ownerName || 'N/A'}</span>
                </div>
                <div>
                  <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Vehicle Number: </span>
                  <span className={isDarkMode ? 'text-gray-200' : 'text-gray-800'}>{editingVehicle.vehicleNo}</span>
                </div>
                <div>
                  <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Type: </span>
                  <span className={isDarkMode ? 'text-gray-200' : 'text-gray-800'}>{editingVehicle.type}</span>
                </div>
                <div>
                  <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Brand: </span>
                  <span className={isDarkMode ? 'text-gray-200' : 'text-gray-800'}>{editingVehicle.brand}</span>
                </div>
                <div>
                  <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Model: </span>
                  <span className={isDarkMode ? 'text-gray-200' : 'text-gray-800'}>{editingVehicle.model}</span>
                </div>
                <div>
                  <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Year: </span>
                  <span className={isDarkMode ? 'text-gray-200' : 'text-gray-800'}>{editingVehicle.year}</span>
                </div>
                <div>
                  <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Fuel Type: </span>
                  <span className={isDarkMode ? 'text-gray-200' : 'text-gray-800'}>{editingVehicle.fuelType}</span>
                </div>
                <div>
                  <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Condition: </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionInfo(calculateConditionBasedOnService(editingVehicle.lastService, editingVehicle.nextService))?.color}`}>
                    {getConditionInfo(calculateConditionBasedOnService(editingVehicle.lastService, editingVehicle.nextService))?.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Editable Fields for Resource Manager */}
            <h4 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Editable Fields</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Current Mileage (km)
                </label>
                <input
                  type="number"
                  value={editingVehicle.mileage}
                  onChange={(e) => setEditingVehicle({...editingVehicle, mileage: parseInt(e.target.value)})}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Registration Expiry
                </label>
                <input
                  type="date"
                  value={editingVehicle.registrationExp}
                  onChange={(e) => setEditingVehicle({...editingVehicle, registrationExp: e.target.value})}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Insurance Expiry
                </label>
                <input
                  type="date"
                  value={editingVehicle.insuranceExp}
                  onChange={(e) => setEditingVehicle({...editingVehicle, insuranceExp: e.target.value})}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Last Service Date
                </label>
                <input
                  type="date"
                  value={editingVehicle.lastService}
                  onChange={(e) => setEditingVehicle({...editingVehicle, lastService: e.target.value})}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Next Service Date
                </label>
                <input
                  type="date"
                  value={editingVehicle.nextService}
                  onChange={(e) => setEditingVehicle({...editingVehicle, nextService: e.target.value})}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>

            <div className="mt-4">
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Notes
              </label>
              <textarea
                value={editingVehicle.notes}
                onChange={(e) => setEditingVehicle({...editingVehicle, notes: e.target.value})}
                rows="3"
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleUpdateVehicle}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Update Vehicle
              </button>
              <button
                onClick={() => setEditingVehicle(null)}
                className={`flex-1 border py-2 rounded-lg font-semibold transition-colors ${
                  isDarkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleManagement;