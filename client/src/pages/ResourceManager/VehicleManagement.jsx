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
  Package,
  FileText
} from "lucide-react";
import { useTheme } from "../../context/theme/ThemeContext.jsx";

const VehicleManagement = () => {
  const { isDarkMode } = useTheme();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [newVehicle, setNewVehicle] = useState({
    plate_number: "",
    type: "",
    name: "",
    status: "available",
    next_service_day: "",
    last_service_day: "",
    notes: ""
  });

  const vehicleTypes = [
    { value: "three-wheeler", label: "Three-wheeler", icon: "🛺" },
    { value: "motorcycle", label: "Motorcycle", icon: "🏍️" },
    { value: "van", label: "Van", icon: "🚐" },
    { value: "truck", label: "Truck", icon: "🚛" },
    { value: "car", label: "Car", icon: "🚗" },
    { value: "other", label: "Other", icon: "🚙" }
  ];

  const statusOptions = [
    { value: "available", label: "Available", color: "text-green-600 bg-green-100" },
    { value: "inuse", label: "In Use", color: "text-blue-600 bg-blue-100" },
    { value: "maintenance", label: "Maintenance", color: "text-yellow-600 bg-yellow-100" }
  ];

  // Fetch vehicles from API
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found in localStorage');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/resources/vehicle`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      
      if (result.success && result.data && result.data.vehicles) {
        console.log("Vehicles fetched from API: ", result.data.vehicles);
        setVehicles(result.data.vehicles);
      } else {
        console.error("Failed to fetch vehicles:", result.message);
        setVehicles([]);
      }
    } catch (error) {
      console.error("Error fetching vehicles from API:", error);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleAddVehicle = async () => {
    if (!newVehicle.plate_number || !newVehicle.type) {
      alert("Plate number and vehicle type are required.");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/resources/vehicle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newVehicle)
      });

      const result = await response.json();

      if (result.success) {
        alert('Vehicle added successfully!');
        setNewVehicle({
          plate_number: "",
          type: "",
          name: "",
          status: "available",
          next_service_day: "",
          last_service_day: "",
          notes: ""
        });
        setShowAddForm(false);
        fetchVehicles(); // Refresh the list
      } else {
        alert(`Failed to add vehicle: ${result.message}`);
      }
    } catch (error) {
      console.error("Error adding vehicle:", error);
      alert("Error adding vehicle. Please try again.");
    }
  };

  const handleEditVehicle = (vehicle) => {
    setEditingVehicle({
      vehicle_id: vehicle.vehicle_id,
      plate_number: vehicle.plate_number,
      type: vehicle.type,
      name: vehicle.name || "",
      status: vehicle.status,
      next_service_day: vehicle.next_service_day || "",
      last_service_day: vehicle.last_service_day || "",
      notes: vehicle.notes || ""
    });
  };

  const handleUpdateVehicle = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/resources/vehicle/${editingVehicle.vehicle_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editingVehicle.name,
          status: editingVehicle.status,
          next_service_day: editingVehicle.next_service_day,
          last_service_day: editingVehicle.last_service_day,
          notes: editingVehicle.notes
        })
      });

      const result = await response.json();

      if (result.success) {
        //alert('Vehicle updated successfully!');
        setEditingVehicle(null);
        fetchVehicles(); // Refresh the list
      } else {
        alert(`Failed to update vehicle: ${result.message}`);
      }
    } catch (error) {
      console.error("Error updating vehicle:", error);
      alert("Error updating vehicle. Please try again.");
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (!window.confirm("Are you sure you want to delete this vehicle?")) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/resources/vehicle/${vehicleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (result.success) {
        alert('Vehicle deleted successfully!');
        fetchVehicles(); // Refresh the list
      } else {
        alert(`Failed to delete vehicle: ${result.message}`);
      }
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      alert("Error deleting vehicle. Please try again.");
    }
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.plate_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || vehicle.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusInfo = (status) => {
    return statusOptions.find(opt => opt.value === status);
  };

  const getVehicleIcon = (type) => {
    return vehicleTypes.find(vt => vt.value === type)?.icon || "🚗";
  };

  const isServiceDue = (nextServiceDate) => {
    if (!nextServiceDate) return false;
    const today = new Date();
    const serviceDate = new Date(nextServiceDate);
    const diffTime = serviceDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  };

  if (loading) {
    return (
      <div className={`max-w-7xl mx-auto p-6 space-y-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Truck className={`w-12 h-12 mx-auto mb-4 animate-pulse ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading vehicles...</p>
          </div>
        </div>
      </div>
    );
  }

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
              onClick={() => window.location.href = '/resourcemanager/resources'}
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

          <div className="ml-auto text-sm text-gray-500">
            {filteredVehicles.length} of {vehicles.length} vehicles
          </div>
        </div>
      </div>

      {/* Vehicle Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle) => {
          const statusInfo = getStatusInfo(vehicle.status);
          const serviceDue = isServiceDue(vehicle.next_service_day);

          return (
            <div key={vehicle.vehicle_id} className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              {/* Vehicle Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{getVehicleIcon(vehicle.type)}</div>
                  <div>
                    <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {vehicle.plate_number}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {vehicle.name || 'Unnamed Vehicle'}
                    </p>
                    <p className="text-xs text-gray-400 capitalize">
                      {vehicle.type}
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
                    onClick={() => handleDeleteVehicle(vehicle.vehicle_id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Status */}
              <div className="flex gap-2 mb-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo?.color}`}>
                  {statusInfo?.label}
                </span>
              </div>

              {/* Vehicle Details */}
              <div className="space-y-3 text-sm">
                {vehicle.last_service_day && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                      <strong>Last Service:</strong> {new Date(vehicle.last_service_day).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {vehicle.next_service_day && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                      <strong>Next Service:</strong> {new Date(vehicle.next_service_day).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {vehicle.notes && (
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                      {vehicle.notes}
                    </span>
                  </div>
                )}
              </div>

              {/* Alerts */}
              {serviceDue && (
                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-yellow-600 text-xs">
                    <AlertTriangle className="w-3 h-3" />
                    Service due: {new Date(vehicle.next_service_day).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredVehicles.length === 0 && !loading && (
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-12 text-center`}>
          <Truck className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
          <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            No vehicles found
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || filterStatus !== "all" 
              ? "Try adjusting your search criteria or filters"
              : "Add your first vehicle to get started"
            }
          </p>
          {!searchTerm && filterStatus === "all" && (
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Vehicle
            </button>
          )}
        </div>
      )}

      {/* Add Vehicle Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 w-full max-w-md`}>
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

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Plate Number *
                </label>
                <input
                  type="text"
                  value={newVehicle.plate_number}
                  onChange={(e) => setNewVehicle({...newVehicle, plate_number: e.target.value})}
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
                  Vehicle Name
                </label>
                <input
                  type="text"
                  value={newVehicle.name}
                  onChange={(e) => setNewVehicle({...newVehicle, name: e.target.value})}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="e.g., Toyota Hiace 2020"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Status
                </label>
                <select
                  value={newVehicle.status}
                  onChange={(e) => setNewVehicle({...newVehicle, status: e.target.value})}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Last Service Date
                </label>
                <input
                  type="date"
                  value={newVehicle.last_service_day}
                  onChange={(e) => setNewVehicle({...newVehicle, last_service_day: e.target.value})}
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
                  value={newVehicle.next_service_day}
                  onChange={(e) => setNewVehicle({...newVehicle, next_service_day: e.target.value})}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div>
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
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 w-full max-w-md`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Edit Vehicle: {editingVehicle.plate_number}
              </h3>
              <button
                onClick={() => setEditingVehicle(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Vehicle Name
                </label>
                <input
                  type="text"
                  value={editingVehicle.name}
                  onChange={(e) => setEditingVehicle({...editingVehicle, name: e.target.value})}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Status
                </label>
                <select
                  value={editingVehicle.status}
                  onChange={(e) => setEditingVehicle({...editingVehicle, status: e.target.value})}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Last Service Date
                </label>
                <input
                  type="date"
                  value={editingVehicle.last_service_day}
                  onChange={(e) => setEditingVehicle({...editingVehicle, last_service_day: e.target.value})}
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
                  value={editingVehicle.next_service_day}
                  onChange={(e) => setEditingVehicle({...editingVehicle, next_service_day: e.target.value})}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div>
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