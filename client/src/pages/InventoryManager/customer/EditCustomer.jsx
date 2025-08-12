import { useState, useEffect } from "react";
import { ChevronLeft, User, Save, X, Camera, Upload, Sparkles, Mail, Phone, MapPin, Building, Hash, FileText, AlertCircle, CheckCircle } from "lucide-react";

// Mock Avatar component for demo
const Avatar = ({ firstName, lastName, imageUrl, editable, size, onImageUpload }) => {
  const fileInputRef = useState(null)[0];
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && onImageUpload) {
      onImageUpload(file);
    }
  };

  const initials = `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  
  return (
    <div className="relative group">
      <div 
        className={`w-32 h-32 rounded-2xl overflow-hidden shadow-lg border-4 border-white bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold transition-transform duration-300 group-hover:scale-105`}
        style={{ width: size, height: size }}
      >
        {imageUrl ? (
          <img src={imageUrl} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <span className="text-3xl">{initials || '👤'}</span>
        )}
      </div>
      
      {editable && (
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl flex items-center justify-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="text-white text-center">
            <Camera className="w-6 h-6 mx-auto mb-1" />
            <span className="text-xs font-medium">Update Photo</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Mock customer data matching the CustomerList and CustomerDetails data
const mockCustomers = [
  {
    user_code: "CUST001",
    first_name: "Rajesh",
    last_name: "Kumar",
    contact1: "+91 98765 43210",
    contact2: "+91 98765 43211",
    email: "rajesh.kumar@email.com",
    city: "Mumbai",
    address_line1: "123 Business Street",
    address_line2: "Near Trade Center",
    district: "Mumbai Central",
    province: "Maharashtra",
    postal_code: "400001",
    note: "Regular customer since 2020",
    photo: ""
  },
  {
    user_code: "CUST002", 
    first_name: "Priya",
    last_name: "Sharma",
    contact1: "+91 87654 32109",
    contact2: "+91 87654 32110",
    email: "priya.sharma@email.com",
    city: "Delhi",
    address_line1: "456 Market Road",
    address_line2: "Sector 15",
    district: "New Delhi",
    province: "Delhi",
    postal_code: "110001",
    note: "Bulk orders preferred",
    photo: ""
  },
  {
    user_code: "CUST003",
    first_name: "Amit",
    last_name: "Patel",
    contact1: "+91 76543 21098",
    contact2: "+91 76543 21099",
    email: "amit.patel@email.com",
    city: "Ahmedabad",
    address_line1: "789 Trade Center",
    address_line2: "Commercial Complex",
    district: "Ahmedabad West",
    province: "Gujarat",
    postal_code: "380001",
    note: "Fast payment cycles",
    photo: ""
  },
  {
    user_code: "CUST004",
    first_name: "Sunita",
    last_name: "Singh",
    contact1: "+91 65432 10987",
    contact2: "+91 65432 10988",
    email: "sunita.singh@email.com",
    city: "Pune",
    address_line1: "321 Industrial Area",
    address_line2: "Phase 2",
    district: "Pune",
    province: "Maharashtra",
    postal_code: "411001",
    note: "Quality focused customer",
    photo: ""
  },
  {
    user_code: "CUST005",
    first_name: "Vikram",
    last_name: "Gupta",
    contact1: "+91 54321 09876",
    contact2: "+91 54321 09877",
    email: "vikram.gupta@email.com",
    city: "Bangalore",
    address_line1: "654 Tech Park",
    address_line2: "Electronic City",
    district: "Bangalore South",
    province: "Karnataka",
    postal_code: "560001",
    note: "Technology sector client",
    photo: ""
  },
  {
    user_code: "CUST006",
    first_name: "Kavita",
    last_name: "Joshi",
    contact1: "+91 43210 98765",
    contact2: "+91 43210 98766",
    email: "kavita.joshi@email.com",
    city: "Hyderabad",
    address_line1: "987 Commercial Complex",
    address_line2: "Hi-Tech City",
    district: "Hyderabad",
    province: "Telangana",
    postal_code: "500001",
    note: "Long term partnership",
    photo: ""
  },
  {
    user_code: "CUST007",
    first_name: "Rahul",
    last_name: "Verma",
    contact1: "+91 32109 87654",
    contact2: "+91 32109 87655",
    email: "rahul.verma@email.com",
    city: "Chennai",
    address_line1: "147 Export Hub",
    address_line2: "Industrial Estate",
    district: "Chennai Central",
    province: "Tamil Nadu",
    postal_code: "600001",
    note: "Export business client",
    photo: ""
  },
  {
    user_code: "CUST008",
    first_name: "Meera",
    last_name: "Reddy",
    contact1: "+91 21098 76543",
    contact2: "+91 21098 76544",
    email: "meera.reddy@email.com",
    city: "Kolkata",
    address_line1: "258 Wholesale Market",
    address_line2: "Market Area",
    district: "Kolkata",
    province: "West Bengal",
    postal_code: "700001",
    note: "Wholesale distributor",
    photo: ""
  }
];

const EditCustomer = () => {
  // Mock useParams - in real app this would come from react-router-dom
  const user_code = "CUST001"; // For demo purposes
  const navigate = {
    back: () => console.log("Navigate back"),
    to: (path) => console.log(`Navigate to: ${path}`)
  };
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    user_code: "",
    first_name: "",
    last_name: "",
    email: "",
    contact1: "",
    contact2: "",
    address_line1: "",
    address_line2: "",
    city: "",
    district: "",
    province: "",
    postal_code: "",
    note: "",
    photo: ""
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
        
        const foundCustomer = mockCustomers.find(c => c.user_code === user_code);
        
        if (foundCustomer) {
          setFormData({
            user_code: foundCustomer.user_code || "",
            first_name: foundCustomer.first_name || "",
            last_name: foundCustomer.last_name || "",
            email: foundCustomer.email || "",
            contact1: foundCustomer.contact1 || "",
            contact2: foundCustomer.contact2 || "",
            address_line1: foundCustomer.address_line1 || "",
            address_line2: foundCustomer.address_line2 || "",
            city: foundCustomer.city || "",
            district: foundCustomer.district || "",
            province: foundCustomer.province || "",
            postal_code: foundCustomer.postal_code || "",
            note: foundCustomer.note || "",
            photo: foundCustomer.photo || ""
          });
          setPreviewImage(foundCustomer.photo || null);
          console.log("Customer loaded:", foundCustomer);
        } else {
          setError("Customer not found");
        }
      } catch (err) {
        setError("Error loading customer data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomer();
  }, [user_code]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.first_name.trim()) newErrors.first_name = "First name is required";
    if (!formData.last_name.trim()) newErrors.last_name = "Last name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.contact1.trim()) newErrors.contact1 = "Primary phone is required";
    if (!formData.address_line1.trim()) newErrors.address_line1 = "Address is required";
    if (!formData.district.trim()) newErrors.district = "District is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.province.trim()) newErrors.province = "Province is required";
    if (!formData.postal_code.trim()) newErrors.postal_code = "Postal code is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      const payload = {
        user_code: formData.user_code,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        contact1: formData.contact1,
        contact2: formData.contact2,
        address_line1: formData.address_line1,
        address_line2: formData.address_line2,
        city: formData.city,
        district: formData.district,
        province: formData.province,
        postal_code: formData.postal_code,
        note: formData.note,
        photo: previewImage
      };

      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        console.log("Customer updated successfully:", payload);
        alert("Customer updated successfully!");
        
        navigate.to(`/inventorymanager/customer/${formData.user_code}`);
      } catch (err) {
        alert("Error updating customer: " + err.message);
      }
    }
  };

  const InputField = ({ label, name, type = "text", icon: Icon, error, required = false, ...props }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-gray-500" />}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleInputChange}
          className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm hover:border-gray-400 ${
            error ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
          }`}
          {...props}
        />
        {error && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <AlertCircle className="w-4 h-4 text-red-500" />
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
        <AlertCircle className="w-3 h-3" />
        {error}
      </p>}
    </div>
  );

  if (loading) {
    return (
      <div className="h-full w-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-3xl border border-gray-200 shadow-xl flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <User className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className="text-gray-600 font-medium">Loading customer details...</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-0"></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-150"></div>
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce delay-300"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full bg-gradient-to-br from-red-50 via-white to-red-50 rounded-3xl border border-red-200 shadow-xl flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-red-700 font-semibold text-lg mb-2">Error Loading Customer</h3>
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <button
            onClick={() => navigate.to('/inventorymanager/customer-list')}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Customer List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-white/10"></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate.to(`/inventorymanager/customer/${user_code}`)}
              className="flex items-center gap-2 text-white hover:text-white/80 transition-colors bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm hover:bg-white/20"
            >
              <ChevronLeft className="w-5 h-5" />
              Back to Customer Details
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Edit Customer Profile</h1>
              <p className="text-white/80 text-lg">
                {formData.first_name} {formData.last_name} • {formData.user_code}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="h-[calc(100%-140px)] p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {/* Avatar Section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Camera className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Profile Photo</h3>
              </div>
              
              <div className="flex items-center gap-6">
                <Avatar
                  firstName={formData.first_name}
                  lastName={formData.last_name}
                  imageUrl={previewImage}
                  editable={true}
                  size={128}
                  onImageUpload={(file) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setPreviewImage(reader.result);
                    };
                    reader.readAsDataURL(file);
                  }}
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 mb-2">Update Profile Photo</h4>
                  <p className="text-gray-600 text-sm mb-3">Click on the avatar to upload a new customer photo</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Upload className="w-4 h-4" />
                    Supports PNG, JPG up to 10MB
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Hash className="w-4 h-4 text-gray-500" />
                    User Code
                  </label>
                  <input
                    type="text"
                    name="user_code"
                    value={formData.user_code}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                </div>
                
                <InputField
                  label="First Name"
                  name="first_name"
                  icon={User}
                  error={errors.first_name}
                  required={true}
                />
                
                <InputField
                  label="Last Name"
                  name="last_name"
                  icon={User}
                  error={errors.last_name}
                  required={true}
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Phone className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Contact Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <InputField
                  label="Email Address"
                  name="email"
                  type="email"
                  icon={Mail}
                  error={errors.email}
                  required={true}
                />
                
                <InputField
                  label="Primary Phone"
                  name="contact1"
                  type="tel"
                  icon={Phone}
                  error={errors.contact1}
                  required={true}
                />
              </div>
              
              <InputField
                label="Additional Phone"
                name="contact2"
                type="tel"
                icon={Phone}
                error={errors.contact2}
              />
            </div>

            {/* Address Information */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Address Information</h3>
              </div>
              
              <div className="space-y-6">
                <InputField
                  label="Address Line 1"
                  name="address_line1"
                  icon={MapPin}
                  error={errors.address_line1}
                  required={true}
                />
                
                <InputField
                  label="Address Line 2"
                  name="address_line2"
                  icon={MapPin}
                  error={errors.address_line2}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <InputField
                    label="District"
                    name="district"
                    icon={Building}
                    error={errors.district}
                    required={true}
                  />
                  
                  <InputField
                    label="City"
                    name="city"
                    icon={Building}
                    error={errors.city}
                    required={true}
                  />
                  
                  <InputField
                    label="Postal Code"
                    name="postal_code"
                    icon={Hash}
                    error={errors.postal_code}
                    required={true}
                  />
                </div>
                
                <InputField
                  label="Province"
                  name="province"
                  icon={MapPin}
                  error={errors.province}
                  required={true}
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Additional Information</h3>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  Notes
                </label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Any additional notes about this customer..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm resize-none transition-all duration-200"
                ></textarea>
              </div>
            </div>

            {/* Form Actions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate.to(`/inventorymanager/customer/${user_code}`)}
                  className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-medium flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel Changes
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-8 py-3 text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl transition-all duration-200 font-medium flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCustomer;