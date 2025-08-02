import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '@components/ui/Avatar';
import { createSalesRep } from '@services/salesrep-service';
import generateId from "@lib/generate-id.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {FaSpinner} from "react-icons/fa";
import {UserRoundCheck} from "lucide-react";

const AddSalesRep = () => {
  // TODO: replace form handling with react-hook-form
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    region: '',
    status: 'active',
    // notes: '',
    photo: null, // will hold the uploaded image file
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Callback to handle image file upload from Avatar component
  const handleImageUpload = (file) => {
    setFormData(prev => ({
      ...prev,
      photo: file,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
    if (!formData.region.trim()) newErrors.region = 'Region is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      if (validateForm()) {
        // Prepare form data for submission
        const salesRepData = {
          user_code: generateId("SR"),
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          contact: formData.phone,
          address: formData.address,
          city: formData.city,
          province: formData.state,
          postal_code: formData.zipCode,
          sales_area: formData.region,
          status: formData.status,
          photo: formData.photo, // assuming your backend accepts this field
        };

        // Call the createSalesRep function from the service
        const result = await createSalesRep(salesRepData);
        if (result.success) {
          toast.success(result.data.message);
          setTimeout(() => {
            setIsLoading(false);
            navigate('/dashboard/repslist');
          }, 3000); // make delay to show toast message
        } else {
          console.error('Failed to create sales rep:', result.message);
        }
      }
    } catch (error) {
      console.error("error: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full px-2 bg-white rounded-md">
      <div className="h-[10%] px-3 border-b border-gray-500 flex flex-row items-center">
        <div className="flex flex-row items-center gap-3 font-bold">
          <UserRoundCheck className="w-6 h-6" />
          <p className="text-lg">Add Sales Representative</p>
        </div>
      </div>
      <div className="h-[90%] p-4 overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Upload Section using Avatar */}
          <div className="mb-6 flex justify-center">
            <Avatar 
              firstName={formData.firstName} 
              lastName={formData.lastName} 
              imageUrl={formData.photo ? URL.createObjectURL(formData.photo) : ''}
              editable={true}
              onImageUpload={handleImageUpload}
              size={100}
            />
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded-lg ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded-lg ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded-lg ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded-lg ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className={`w-full p-2 border rounded-lg ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
          </div>

          {/* City, State, ZIP */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded-lg ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded-lg ${errors.state ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ZIP Code
              </label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded-lg ${errors.zipCode ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
            </div>
          </div>

          {/* Region */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sales Region
            </label>
            <input
              type="text"
              name="region"
              value={formData.region}
              onChange={handleInputChange}
              className={`w-full p-2 border rounded-lg ${errors.region ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.region && <p className="text-red-500 text-sm mt-1">{errors.region}</p>}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            {/*<button*/}
            {/*  type="button"*/}
            {/*  onClick={() => navigate('/dashboard/repslist')}*/}
            {/*  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"*/}
            {/*>*/}
            {/*  Cancel*/}
            {/*</button>*/}
            <button
              type="submit"
              className="px-4 py-2 flex flex-row items-center text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              disabled={isLoading}
            >
              Add Sales Rep
              {isLoading && (
                <FaSpinner
                  size={20}
                  color="white"
                  className="ms-3 animate-spin"
                />
              )}
            </button>
          </div>
        </form>
      </div>
      <ToastContainer autoClose={2000} />
    </div>
  );
};

export default AddSalesRep;
