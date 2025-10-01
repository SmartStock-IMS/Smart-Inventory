import { createContext, useContext, useState } from 'react';

const VehicleContext = createContext();

export const useVehicles = () => {
  const context = useContext(VehicleContext);
  if (!context) {
    throw new Error('useVehicles must be used within a VehicleProvider');
  }
  return context;
};

export const VehicleProvider = ({ children }) => {
  const [vehicles, setVehicles] = useState([
    {
      id: 1,
      ownerName: "Rajesh Kumar",
      vehicleNo: "WP CAA-1234",
      type: "van",
      brand: "Toyota",
      model: "Hiace",
      year: 2020,
      condition: "excellent",
      status: "available",
      lastService: "2024-08-15",
      nextService: "2024-11-15",
      mileage: 45000,
      fuelType: "diesel",
      assignedDriver: "John Silva",
      location: "Colombo Depot",
      registrationExp: "2025-12-31",
      insuranceExp: "2025-06-30",
      notes: "Regular maintenance completed"
    },
    {
      id: 2,
      ownerName: "Priya Sharma",
      vehicleNo: "WP KL-5678",
      type: "three-wheel",
      brand: "Bajaj",
      model: "RE Auto",
      year: 2019,
      condition: "good",
      status: "in-use",
      lastService: "2024-09-01",
      nextService: "2024-12-01",
      mileage: 78000,
      fuelType: "petrol",
      assignedDriver: "Ravi Perera",
      location: "Kandy Branch",
      registrationExp: "2025-08-15",
      insuranceExp: "2025-03-20",
      notes: "Minor repairs needed"
    },
    {
      id: 3,
      ownerName: "Ahmed Hassan",
      vehicleNo: "WP CB-9012",
      type: "bike",
      brand: "Honda",
      model: "CB 150",
      year: 2021,
      condition: "excellent",
      status: "maintenance",
      lastService: "2024-09-20",
      nextService: "2024-12-20",
      mileage: 12000,
      fuelType: "petrol",
      assignedDriver: "Saman Kumar",
      location: "Service Center",
      registrationExp: "2026-01-10",
      insuranceExp: "2025-07-15",
      notes: "Scheduled maintenance in progress"
    },
    {
      id: 4,
      ownerName: "Sarah Williams",
      vehicleNo: "WP GH-3456",
      type: "car",
      brand: "Honda",
      model: "Civic",
      year: 2022,
      condition: "excellent",
      status: "available",
      lastService: "2024-09-10",
      nextService: "2024-12-10",
      mileage: 25000,
      fuelType: "petrol",
      assignedDriver: "Mike Johnson",
      location: "Galle Office",
      registrationExp: "2026-03-15",
      insuranceExp: "2025-09-20",
      notes: "Recently serviced"
    },
    {
      id: 5,
      ownerName: "David Chen",
      vehicleNo: "WP BC-7890",
      type: "bike",
      brand: "Honda",
      model: "CB 150",
      year: 2023,
      condition: "excellent",
      status: "available",
      lastService: "2024-09-25",
      nextService: "2025-01-25",
      mileage: 8000,
      fuelType: "petrol",
      assignedDriver: "Alex Rodriguez",
      location: "Negombo Station",
      registrationExp: "2027-05-20",
      insuranceExp: "2025-11-30",
      notes: "New addition to fleet"
    }
  ]);

  const addVehicle = (vehicle) => {
    setVehicles(prev => [...prev, { ...vehicle, id: Date.now() }]);
  };

  const updateVehicle = (id, updates) => {
    setVehicles(prev => prev.map(vehicle => 
      vehicle.id === id ? { ...vehicle, ...updates } : vehicle
    ));
  };

  const deleteVehicle = (id) => {
    setVehicles(prev => prev.filter(vehicle => vehicle.id !== id));
  };

  const getAvailableVehicles = () => {
    return vehicles.filter(vehicle => vehicle.status === 'available');
  };

  const assignVehicle = (vehicleId, assignment) => {
    updateVehicle(vehicleId, { 
      status: 'in-use',
      currentAssignment: assignment,
      assignedAt: new Date().toISOString()
    });
  };

  const releaseVehicle = (vehicleId) => {
    updateVehicle(vehicleId, { 
      status: 'available',
      currentAssignment: null,
      assignedAt: null,
      releasedAt: new Date().toISOString()
    });
  };

  const value = {
    vehicles,
    setVehicles,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    getAvailableVehicles,
    assignVehicle,
    releaseVehicle
  };

  return (
    <VehicleContext.Provider value={value}>
      {children}
    </VehicleContext.Provider>
  );
};

export default VehicleContext;
