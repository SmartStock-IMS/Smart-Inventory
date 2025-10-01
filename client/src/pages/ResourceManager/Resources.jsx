import { useState, useEffect } from "react";
import { useTheme } from "../../context/theme/ThemeContext";
import { useVehicles } from "../../context/vehicle/VehicleContext";
import { 
  Truck, 
  Bike, 
  Car, 
  Package, 
  Clock, 
  User, 
  MapPin, 
  CheckCircle, 
  AlertCircle,
  Phone,
  Camera,
  RefreshCw,
  Plus,
  Search,
  Fuel
} from "lucide-react";

const ResourceOrders = () => {
  const { isDarkMode } = useTheme();
  const { getAvailableVehicles, assignVehicle, releaseVehicle } = useVehicles();
  const [handover, setHandover] = useState({
    vehicleType: "",
    vehicleNo: "",
    driverName: "",
    driverPhone: "",
    startDate: "",
    startTime: "",
    estimatedDuration: "",
    deliveryNotes: "",
    finishDate: "",
    finishTime: "",
    completionNotes: "",
    deliveryStatus: "successful", // successful, partial, failed
    selectedVehicle: null,
    isExternalVehicle: false
  });
  const [submitted, setSubmitted] = useState(false);
  const [completionStep, setCompletionStep] = useState("handover"); // "handover", "completed", "finished"
  const [validationErrors, setValidationErrors] = useState({});
  const [showVehicleSelector, setShowVehicleSelector] = useState(false);
  const [showExternalVehicleForm, setShowExternalVehicleForm] = useState(false);
  const [vehicleSearchTerm, setVehicleSearchTerm] = useState("");

  // Get available vehicles from context
  const availableVehicles = getAvailableVehicles();

  const vehicleTypes = [
    { value: "three-wheel", label: "Three-wheeler", icon: "🛺", capacity: "Small items" },
    { value: "bike", label: "Motorcycle", icon: "🏍️", capacity: "Documents/Small packages" },
    { value: "van", label: "Van", icon: "🚐", capacity: "Medium load" },
    { value: "truck", label: "Truck", icon: "🚛", capacity: "Heavy/Bulk items" },
    { value: "car", label: "Car", icon: "🚗", capacity: "Light packages" },
    { value: "other", label: "Other", icon: "🚚", capacity: "Custom" }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setHandover({ ...handover, [name]: value });
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: "" });
    }
  };

  const handleVehicleSelect = (vehicle) => {
    setHandover({
      ...handover,
      selectedVehicle: vehicle,
      vehicleType: vehicle.type,
      vehicleNo: vehicle.vehicleNo,
      driverName: vehicle.assignedDriver || "",
      isExternalVehicle: false
    });
    setShowVehicleSelector(false);
  };

  const handleExternalVehicleToggle = () => {
    setShowExternalVehicleForm(!showExternalVehicleForm);
    if (!showExternalVehicleForm) {
      // Clear existing vehicle data when switching to external
      setHandover({
        ...handover,
        selectedVehicle: null,
        vehicleType: "",
        vehicleNo: "",
        driverName: "",
        driverPhone: "",
        isExternalVehicle: true
      });
    } else {
      // Clear external vehicle flag when switching back
      setHandover({
        ...handover,
        isExternalVehicle: false
      });
    }
  };

  const filteredAvailableVehicles = availableVehicles.filter(vehicle =>
    vehicle.status === "available" &&
    (vehicle.vehicleNo.toLowerCase().includes(vehicleSearchTerm.toLowerCase()) ||
     vehicle.brand.toLowerCase().includes(vehicleSearchTerm.toLowerCase()) ||
     vehicle.model.toLowerCase().includes(vehicleSearchTerm.toLowerCase()) ||
     (vehicle.assignedDriver && vehicle.assignedDriver.toLowerCase().includes(vehicleSearchTerm.toLowerCase())))
  );

  const validateForm = () => {
    const errors = {};
    
    if (!handover.vehicleType) errors.vehicleType = "Vehicle type is required";
    if (!handover.vehicleNo) errors.vehicleNo = "Vehicle number is required";
    if (!handover.driverName) errors.driverName = "Driver name is required";
    if (!handover.startDate) errors.startDate = "Start date is required";
    if (!handover.startTime) errors.startTime = "Start time is required";
    
    // Additional validation for external vehicles
    if (handover.isExternalVehicle && !handover.driverPhone) {
      errors.driverPhone = "Driver phone is required for external vehicles";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setSubmitted(true);
      setCompletionStep("completed");
      
      // If using company vehicle, assign it
      if (handover.selectedVehicle && !handover.isExternalVehicle) {
        const assignmentDetails = {
          driverName: handover.driverName,
          driverPhone: handover.driverPhone,
          startDate: handover.startDate,
          startTime: handover.startTime,
          estimatedDuration: handover.estimatedDuration,
          deliveryNotes: handover.deliveryNotes,
          assignedBy: "Resource Manager", // Could be current user
          assignmentType: "delivery"
        };
        assignVehicle(handover.selectedVehicle.id, assignmentDetails);
        console.log("Vehicle assigned:", handover.selectedVehicle, assignmentDetails);
      }
      
      // TODO: Send handover data to backend
      console.log("Handover data:", handover);
    }
  };

  const handleCompletion = (e) => {
    e.preventDefault();
    if (handover.finishDate && handover.finishTime) {
      setCompletionStep("finished");
      
      // Release the vehicle if it was a company vehicle
      if (handover.selectedVehicle && !handover.isExternalVehicle) {
        releaseVehicle(handover.selectedVehicle.id);
        console.log("Vehicle released:", handover.selectedVehicle.id);
      }
      
      // TODO: Send completion data to backend
      console.log("Completion data:", handover);
    }
  };

  const handleOrderSelect = (order) => {
    setHandover({
      ...handover,
      orderId: order.id,
      customerName: order.customer,
      deliveryAddress: order.address
    });
  };

  const resetForm = () => {
    setHandover({
      vehicleType: "",
      vehicleNo: "",
      driverName: "",
      driverPhone: "",
      startDate: "",
      startTime: "",
      estimatedDuration: "",
      deliveryNotes: "",
      finishDate: "",
      finishTime: "",
      completionNotes: "",
      deliveryStatus: "successful",
      selectedVehicle: null,
      isExternalVehicle: false
    });
    setSubmitted(false);
    setCompletionStep("handover");
    setValidationErrors({});
    setShowVehicleSelector(false);
    setShowExternalVehicleForm(false);
    setVehicleSearchTerm("");
  };

  const handleRefresh = () => {
    resetForm();
    // Force page refresh to reload any external data
    window.location.reload();
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "normal": return "bg-blue-100 text-blue-800";
      case "low": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className={`max-w-6xl mx-auto p-6 space-y-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Package className="w-8 h-8" />
              <h2 className="text-3xl font-bold">Resource Orders Management</h2>
            </div>
            <p className="text-blue-100">
              Manage order deliveries and handover process with comprehensive tracking and documentation.
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200 backdrop-blur-sm"
            title="Refresh page data"
          >
            <RefreshCw className="w-5 h-5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Handover Form */}
      <div className="max-w-4xl mx-auto">
        <div className={`rounded-xl shadow-lg p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center gap-2 mb-4">
            <Truck className="w-5 h-5 text-blue-500" />
            <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Resource Assignment</h3>
          </div>

          {submitted ? (
            <div className="space-y-4">
              <div className={`border-l-4 border-green-500 p-4 rounded ${isDarkMode ? 'bg-green-900/20' : 'bg-green-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h4 className={`font-semibold ${isDarkMode ? 'text-green-400' : 'text-green-800'}`}>Resource Assignment Successful!</h4>
                </div>
                <div className={`text-sm space-y-1 ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>
                  <p><strong>Vehicle:</strong> {vehicleTypes.find(v => v.value === handover.vehicleType)?.label} ({handover.vehicleNo})</p>
                  <p><strong>Driver:</strong> {handover.driverName}</p>
                  <p><strong>Scheduled:</strong> {handover.startDate} at {handover.startTime}</p>
                  {handover.estimatedDuration && <p><strong>Est. Duration:</strong> {handover.estimatedDuration}</p>}
                </div>
              </div>

              {/* Finish Section */}
              {completionStep === "completed" && (
                <form onSubmit={handleCompletion} className={`space-y-4 border rounded-lg p-4 mt-4 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                  <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`}>End of Day: Mark Resource Handover as Finished</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Finish Date *</label>
                      <input
                        type="date"
                        name="finishDate"
                        value={handover.finishDate}
                        onChange={handleChange}
                        min={handover.startDate}
                        className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Finish Time *</label>
                      <input
                        type="time"
                        name="finishTime"
                        value={handover.finishTime}
                        onChange={handleChange}
                        className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Completion Notes</label>
                    <textarea
                      name="completionNotes"
                      value={handover.completionNotes}
                      onChange={handleChange}
                      rows="2"
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                      placeholder="Any issues, feedback, or summary..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all"
                  >
                    Mark as Finished
                  </button>
                </form>
              )}

              {/* Completion Summary */}
              {completionStep === "finished" && (
                <div className={`border-l-4 border-indigo-500 p-4 rounded mt-4 ${isDarkMode ? 'bg-indigo-900/20' : 'bg-indigo-50'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-indigo-600" />
                    <h4 className={`font-semibold ${isDarkMode ? 'text-indigo-400' : 'text-indigo-800'}`}>Resource Handover Completed!</h4>
                  </div>
                  <div className={`text-sm space-y-1 ${isDarkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>
                    <p><strong>Finish Date:</strong> {handover.finishDate}</p>
                    <p><strong>Finish Time:</strong> {handover.finishTime}</p>
                    {handover.completionNotes && <p><strong>Notes:</strong> {handover.completionNotes}</p>}
                  </div>
                  <button
                    onClick={resetForm}
                    className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                  >
                    Start New Handover
                  </button>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Vehicle Selection Options */}
              <div className="space-y-4">
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Vehicle Selection *
                </label>
                
                {/* Vehicle Selection Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setShowVehicleSelector(true)}
                    className={`p-4 border-2 rounded-lg transition-all hover:shadow-md ${
                      handover.selectedVehicle && !handover.isExternalVehicle
                        ? 'border-blue-500 bg-blue-50'
                        : isDarkMode 
                          ? 'border-gray-600 hover:border-gray-500 bg-gray-700' 
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Truck className="w-6 h-6 text-blue-500" />
                      <div className="text-left">
                        <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          Company Vehicles
                        </div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Select from available fleet
                        </div>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleExternalVehicleToggle}
                    className={`p-4 border-2 rounded-lg transition-all hover:shadow-md ${
                      handover.isExternalVehicle
                        ? 'border-blue-500 bg-blue-50'
                        : isDarkMode 
                          ? 'border-gray-600 hover:border-gray-500 bg-gray-700' 
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Plus className="w-6 h-6 text-green-500" />
                      <div className="text-left">
                        <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          External Vehicle
                        </div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Use non-company vehicle
                        </div>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Selected Vehicle Display */}
                {handover.selectedVehicle && !handover.isExternalVehicle && (
                  <div className={`border rounded-lg p-4 ${isDarkMode ? 'bg-blue-900/20 border-blue-600' : 'bg-blue-50 border-blue-200'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className={`font-semibold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                          Selected Vehicle
                        </h4>
                        <div className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-500'}`}>
                          {handover.selectedVehicle.brand} {handover.selectedVehicle.model} ({handover.selectedVehicle.vehicleNo})
                        </div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Driver: {handover.selectedVehicle.assignedDriver || 'Not assigned'} | Location: {handover.selectedVehicle.location}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setHandover({...handover, selectedVehicle: null, vehicleType: "", vehicleNo: "", driverName: ""})}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}

                {validationErrors.vehicleType && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.vehicleType}</p>
                )}
              </div>

              {/* Vehicle and Driver Details */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Vehicle Number *</label>
                  <input
                    type="text"
                    name="vehicleNo"
                    value={handover.vehicleNo}
                    onChange={handleChange}
                    disabled={handover.selectedVehicle && !handover.isExternalVehicle}
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      validationErrors.vehicleNo ? 'border-red-500' : 
                      handover.selectedVehicle && !handover.isExternalVehicle ? 
                        isDarkMode ? 'bg-gray-600 border-gray-500 text-gray-400' : 'bg-gray-100 border-gray-300 text-gray-500' :
                        isDarkMode ? 'border-gray-500 bg-gray-600 text-white' : 'border-gray-300'
                    }`}
                    placeholder="e.g., WP CAA-1234"
                  />
                  {validationErrors.vehicleNo && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.vehicleNo}</p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Driver Name *</label>
                  <input
                    type="text"
                    name="driverName"
                    value={handover.driverName}
                    onChange={handleChange}
                    disabled={handover.selectedVehicle && handover.selectedVehicle.assignedDriver && !handover.isExternalVehicle}
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      validationErrors.driverName ? 'border-red-500' : 
                      handover.selectedVehicle && handover.selectedVehicle.assignedDriver && !handover.isExternalVehicle ? 
                        isDarkMode ? 'bg-gray-600 border-gray-500 text-gray-400' : 'bg-gray-100 border-gray-300 text-gray-500' :
                        isDarkMode ? 'border-gray-500 bg-gray-600 text-white' : 'border-gray-300'
                    }`}
                    placeholder="Driver's full name"
                  />
                  {validationErrors.driverName && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.driverName}</p>
                  )}
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Driver Phone {handover.isExternalVehicle && '*'}
                </label>
                <input
                  type="tel"
                  name="driverPhone"
                  value={handover.driverPhone}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    validationErrors.driverPhone ? 'border-red-500' : isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                  }`}
                  placeholder="+94 XX XXX XXXX"
                />
                {validationErrors.driverPhone && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.driverPhone}</p>
                )}
              </div>

              {/* External Vehicle Type Selection */}
              {handover.isExternalVehicle && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Vehicle Type *</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {vehicleTypes.map((vehicle) => (
                      <label
                        key={vehicle.value}
                        className={`border-2 rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${
                          handover.vehicleType === vehicle.value
                            ? 'border-blue-500 bg-blue-50'
                            : isDarkMode 
                              ? 'border-gray-600 hover:border-gray-500 bg-gray-700' 
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="vehicleType"
                          value={vehicle.value}
                          checked={handover.vehicleType === vehicle.value}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <div className="text-center">
                          <div className="text-2xl mb-1">{vehicle.icon}</div>
                          <div className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{vehicle.label}</div>
                          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{vehicle.capacity}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                  {/* Show custom vehicle type input if 'other' is selected */}
                  {handover.vehicleType === 'other' && (
                    <input
                      type="text"
                      name="customVehicleType"
                      value={handover.customVehicleType || ''}
                      onChange={e => setHandover({ ...handover, customVehicleType: e.target.value })}
                      className={`mt-2 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                      placeholder="Enter custom vehicle type"
                      required
                    />
                  )}
                </div>
              )}

              {/* Schedule */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Start Date *</label>
                  <input
                    type="date"
                    name="startDate"
                    value={handover.startDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      validationErrors.startDate ? 'border-red-500' : isDarkMode ? 'border-gray-500 bg-gray-600 text-white' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.startDate && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.startDate}</p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Start Time *</label>
                  <input
                    type="time"
                    name="startTime"
                    value={handover.startTime}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      validationErrors.startTime ? 'border-red-500' : isDarkMode ? 'border-gray-500 bg-gray-600 text-white' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.startTime && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.startTime}</p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Est. Duration</label>
                  <select
                    name="estimatedDuration"
                    value={handover.estimatedDuration}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                  >
                    <option value="">Select duration</option>
                    <option value="30 minutes">30 minutes</option>
                    <option value="1 hour">1 hour</option>
                    <option value="2 hours">2 hours</option>
                    <option value="Half day">Half day</option>
                    <option value="Full day">Full day</option>
                  </select>
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Delivery Notes</label>
                <textarea
                  name="deliveryNotes"
                  value={handover.deliveryNotes}
                  onChange={handleChange}
                  rows="3"
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                  placeholder="Special instructions, handling requirements, or important notes..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Assign Resources & Prepare
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Additional Features Panel */}
      <div className={`rounded-xl shadow-lg p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <AlertCircle className="w-5 h-5 text-blue-600" />
          Best Practices & Suggestions
        </h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
            <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`}>Documentation</h4>
            <ul className={`space-y-1 ${isDarkMode ? 'text-blue-300' : 'text-blue-400'}`}>
              <li>• Take photos before dispatch</li>
              <li>• Get customer signature on delivery</li>
              <li>• Keep delivery receipts</li>
              <li>• Record any damages or issues</li>
            </ul>
          </div>
          
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
            <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`}>Communication</h4>
            <ul className={`space-y-1 ${isDarkMode ? 'text-blue-300' : 'text-blue-400'}`}>
              <li>• SMS customer before dispatch</li>
              <li>• Share driver contact details</li>
              <li>• Provide tracking information</li>
              <li>• Follow up after delivery</li>
            </ul>
          </div>
          
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
            <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`}>Quality Control</h4>
            <ul className={`space-y-1 ${isDarkMode ? 'text-blue-300' : 'text-blue-400'}`}>
              <li>• Verify vehicle condition</li>
              <li>• Check driver credentials</li>
              <li>• Confirm delivery timeline</li>
              <li>• Monitor delivery progress</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Vehicle Selector Modal */}
      {showVehicleSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 w-full max-w-4xl max-h-screen overflow-y-auto`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Select Available Vehicle
              </h3>
              <button
                onClick={() => setShowVehicleSelector(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Search */}
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search vehicles..."
                  value={vehicleSearchTerm}
                  onChange={(e) => setVehicleSearchTerm(e.target.value)}
                  className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
            </div>

            {/* Available Vehicles Grid */}
            <div className="grid md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {filteredAvailableVehicles.length > 0 ? (
                filteredAvailableVehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    onClick={() => handleVehicleSelect(vehicle)}
                    className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700 hover:border-blue-500' 
                        : 'border-gray-200 bg-white hover:border-blue-400'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">
                            {vehicleTypes.find(vt => vt.value === vehicle.type)?.icon || "🚗"}
                          </span>
                          <div>
                            <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {vehicle.brand} {vehicle.model}
                            </h4>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {vehicle.vehicleNo}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                              Driver: {vehicle.assignedDriver || 'Not assigned'}
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
                              {vehicle.fuelType.charAt(0).toUpperCase() + vehicle.fuelType.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className={`px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800`}>
                        Available
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-8">
                  <Truck className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    No available vehicles found
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Try adjusting your search terms or check back later
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowVehicleSelector(false)}
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

export default ResourceOrders;