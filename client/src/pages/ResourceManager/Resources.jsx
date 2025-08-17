import { useState } from "react";
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
  RefreshCw
} from "lucide-react";

const ResourceOrders = () => {
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
    deliveryStatus: "successful" // successful, partial, failed
  });
  const [submitted, setSubmitted] = useState(false);
  const [completionStep, setCompletionStep] = useState("handover"); // "handover", "completed", "finished"
  const [validationErrors, setValidationErrors] = useState({});

  // Mock orders data removed since orders are managed on separate page
  
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

  const validateForm = () => {
    const errors = {};
    
    if (!handover.vehicleType) errors.vehicleType = "Vehicle type is required";
    if (!handover.vehicleNo) errors.vehicleNo = "Vehicle number is required";
    if (!handover.driverName) errors.driverName = "Driver name is required";
    if (!handover.startDate) errors.startDate = "Start date is required";
    if (!handover.startTime) errors.startTime = "Start time is required";
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setSubmitted(true);
      setCompletionStep("completed");
      // TODO: Send handover data to backend
      console.log("Handover data:", handover);
    }
  };

  const handleCompletion = (e) => {
    e.preventDefault();
    if (handover.finishDate && handover.finishTime) {
      setCompletionStep("finished");
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
      deliveryStatus: "successful"
    });
    setSubmitted(false);
    setCompletionStep("handover");
    setValidationErrors({});
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
  <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Package className="w-8 h-8" />
              <h2 className="text-3xl font-bold">Resource Orders Management</h2>
            </div>
            <p className="text-purple-100">
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
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Truck className="w-5 h-5 text-purple-600" />
            <h3 className="text-xl font-semibold">Resource Assignment</h3>
          </div>

          {submitted ? (
            <div className="space-y-4">
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-green-800">Resource Assignment Successful!</h4>
                </div>
                <div className="text-sm text-green-700 space-y-1">
                  <p><strong>Vehicle:</strong> {vehicleTypes.find(v => v.value === handover.vehicleType)?.label} ({handover.vehicleNo})</p>
                  <p><strong>Driver:</strong> {handover.driverName}</p>
                  <p><strong>Scheduled:</strong> {handover.startDate} at {handover.startTime}</p>
                  {handover.estimatedDuration && <p><strong>Est. Duration:</strong> {handover.estimatedDuration}</p>}
                </div>
              </div>

              {/* Finish Section */}
              {completionStep === "completed" && (
                <form onSubmit={handleCompletion} className="space-y-4 bg-white border border-gray-200 rounded-lg p-4 mt-4">
                  <h4 className="font-semibold text-purple-700 mb-2">End of Day: Mark Resource Handover as Finished</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Finish Date *</label>
                      <input
                        type="date"
                        name="finishDate"
                        value={handover.finishDate}
                        onChange={handleChange}
                        min={handover.startDate}
                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Finish Time *</label>
                      <input
                        type="time"
                        name="finishTime"
                        value={handover.finishTime}
                        onChange={handleChange}
                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Completion Notes</label>
                    <textarea
                      name="completionNotes"
                      value={handover.completionNotes}
                      onChange={handleChange}
                      rows="2"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Any issues, feedback, or summary..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all"
                  >
                    Mark as Finished
                  </button>
                </form>
              )}

              {/* Completion Summary */}
              {completionStep === "finished" && (
                <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-indigo-600" />
                    <h4 className="font-semibold text-indigo-800">Resource Handover Completed!</h4>
                  </div>
                  <div className="text-sm text-indigo-700 space-y-1">
                    <p><strong>Finish Date:</strong> {handover.finishDate}</p>
                    <p><strong>Finish Time:</strong> {handover.finishTime}</p>
                    {handover.completionNotes && <p><strong>Notes:</strong> {handover.completionNotes}</p>}
                  </div>
                  <button
                    onClick={resetForm}
                    className="mt-4 w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                  >
                    Start New Handover
                  </button>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Vehicle Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type *</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {vehicleTypes.map((vehicle) => (
                    <label
                      key={vehicle.value}
                      className={`border-2 rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${
                        handover.vehicleType === vehicle.value
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
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
                        <div className="font-medium text-sm">{vehicle.label}</div>
                        <div className="text-xs text-gray-500">{vehicle.capacity}</div>
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
                    className="mt-2 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter custom vehicle type"
                    required
                  />
                )}
                {validationErrors.vehicleType && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.vehicleType}</p>
                )}
              </div>

              {/* Vehicle and Driver Details */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number *</label>
                  <input
                    type="text"
                    name="vehicleNo"
                    value={handover.vehicleNo}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      validationErrors.vehicleNo ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., WP CAA-1234"
                  />
                  {validationErrors.vehicleNo && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.vehicleNo}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Driver Name *</label>
                  <input
                    type="text"
                    name="driverName"
                    value={handover.driverName}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      validationErrors.driverName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Driver's full name"
                  />
                  {validationErrors.driverName && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.driverName}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Driver Phone</label>
                <input
                  type="tel"
                  name="driverPhone"
                  value={handover.driverPhone}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="+94 XX XXX XXXX"
                />
              </div>

              {/* Schedule */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    name="startDate"
                    value={handover.startDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      validationErrors.startDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.startDate && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.startDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
                  <input
                    type="time"
                    name="startTime"
                    value={handover.startTime}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      validationErrors.startTime ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.startTime && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.startTime}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Est. Duration</label>
                  <select
                    name="estimatedDuration"
                    value={handover.estimatedDuration}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Notes</label>
                <textarea
                  name="deliveryNotes"
                  value={handover.deliveryNotes}
                  onChange={handleChange}
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Special instructions, handling requirements, or important notes..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Assign Resources & Prepare
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Additional Features Panel */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600" />
          Best Practices & Suggestions
        </h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Documentation</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• Take photos before dispatch</li>
              <li>• Get customer signature on delivery</li>
              <li>• Keep delivery receipts</li>
              <li>• Record any damages or issues</li>
            </ul>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Communication</h4>
            <ul className="space-y-1 text-green-700">
              <li>• SMS customer before dispatch</li>
              <li>• Share driver contact details</li>
              <li>• Provide tracking information</li>
              <li>• Follow up after delivery</li>
            </ul>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">Quality Control</h4>
            <ul className="space-y-1 text-yellow-700">
              <li>• Verify vehicle condition</li>
              <li>• Check driver credentials</li>
              <li>• Confirm delivery timeline</li>
              <li>• Monitor delivery progress</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceOrders;