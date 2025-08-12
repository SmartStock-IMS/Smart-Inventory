import React, { useState } from 'react';

const EditProfileForm = () => {
  const [formData, setFormData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    company: 'Tech Solutions Inc.',
    website: 'www.johndoe.com',
    address: '123 Main Street, City, Country',
    role: 'Senior Developer',
    joinDate: '2023-01-15'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-rose-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              JD
            </div>
            <div>
              <h1 className="text-2xl font-bold">Edit Profile</h1>
              <p className="text-gray-500">Update your personal information</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Basic Information</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700" htmlFor="firstName">
                    First Name
                  </label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700" htmlFor="lastName">
                    Last Name
                  </label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700" htmlFor="email">
                  Email
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700" htmlFor="phone">
                  Phone
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700" htmlFor="company">
                  Company
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700" htmlFor="website">
                  Website
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Additional Information</h2>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700" htmlFor="address">
                  Address
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Role Information</h2>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700" htmlFor="role">
                  Role
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700" htmlFor="joinDate">
                  Join Date
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  id="joinDate"
                  name="joinDate"
                  type="date"
                  value={formData.joinDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfileForm;