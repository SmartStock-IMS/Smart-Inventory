import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getCustomerByUserCode, updateCustomer } from "@services/customer-services";
import Avatar from "@components/ui/Avatar";
import {ChevronLeft} from "lucide-react";

const EditCustomer = () => {
  const { user_code } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form state; note that field names should match your API (or be mapped accordingly)
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

  // Load customer data on mount using the user_code from URL
  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await getCustomerByUserCode(user_code);
        console.log("res: ", res);
        if (res.success) {
          const data = res.data.customer;
          setFormData({
            user_code: data.user_code || "",
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            email: data.email || "",
            contact1: data.contact1 || "",
            contact2: data.contact2 || "",
            address_line1: data.address_line1 || "",
            address_line2: data.address_line2 || "",
            city: data.city || "",
            district: data.district || "",
            province: data.province || "",
            postal_code: data.postal_code || "",
            note: data.note || "",
            photo: data.photo || ""
          });
          setPreviewImage(data.photo || null);
        } else {
          setError(res.message || "Error fetching customer data.");
        }
      } catch (err) {
        setError(err.message || "Error fetching customer data.");
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
    // Clear any error for this field
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
        const res = await updateCustomer(formData.user_code, payload);
        if (res.success) {
          navigate("/dashboard/customer-list");
        } else {
          alert("Error updating customer: " + res.message);
        }
      } catch (err) {
        alert("Error updating customer: " + err.message);
      }
    }
  };

  if (loading) {
    return <div className="container mx-auto p-6">Loading customer details...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-6 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="h-full px-2">
      <div className="h-[6%] px-2 flex flex-row items-center">
        <Link to={`/dashboard/customer/${user_code}`} className="flex flex-row items-center gap-1 text-blue-500 hover:underline underline-offset-4 inline-block">
          <ChevronLeft className="w-5 h-5" />
          <p>Back to Customer Details</p>
        </Link>
      </div>
      <div className="h-[94%] bg-white shadow-lg rounded-lg p-6 overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar / Photo Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Photo
            </label>
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
          </div>

          {/* Basic Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">User Code</label>
              <input
                type="text"
                name="user_code"
                value={formData.user_code}
                disabled
                className="w-full p-2 border rounded-lg bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded-lg ${errors.first_name ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded-lg ${errors.last_name ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>}
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded-lg ${errors.email ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Phone</label>
              <input
                type="tel"
                name="contact1"
                value={formData.contact1}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded-lg ${errors.contact1 ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.contact1 && <p className="text-red-500 text-sm mt-1">{errors.contact1}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Phone</label>
            <input
              type="tel"
              name="contact2"
              value={formData.contact2}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-lg border-gray-300"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1</label>
            <input
              type="text"
              name="address_line1"
              value={formData.address_line1}
              onChange={handleInputChange}
              className={`w-full p-2 border rounded-lg ${errors.address_line1 ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.address_line1 && <p className="text-red-500 text-sm mt-1">{errors.address_line1}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
            <input
              type="text"
              name="address_line2"
              value={formData.address_line2}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-lg border-gray-300"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded-lg ${errors.district ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.district && <p className="text-red-500 text-sm mt-1">{errors.district}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded-lg ${errors.city ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
              <input
                type="text"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded-lg ${errors.postal_code ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.postal_code && <p className="text-red-500 text-sm mt-1">{errors.postal_code}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Province</label>
            <input
              type="text"
              name="province"
              value={formData.province}
              onChange={handleInputChange}
              className={`w-full p-2 border rounded-lg ${errors.province ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.province && <p className="text-red-500 text-sm mt-1">{errors.province}</p>}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleInputChange}
              rows="4"
              className="w-full p-2 border rounded-lg border-gray-300"
            ></textarea>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard/customer-list")}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCustomer;
