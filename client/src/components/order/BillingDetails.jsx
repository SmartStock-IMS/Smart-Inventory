import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  createCustomer,
  getAllCustomers,
} from "../../services/user-services.js";
import { useCart } from "../../context/cart/CartContext.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useForm } from "react-hook-form";
import { cn } from "@lib/utils.js";
import generateId from "@lib/generate-id.js";
import { FaSpinner } from "react-icons/fa";

const BillingDetails = () => {
  const navigate = useNavigate();
  const { setCustomer } = useCart();
  // init local state variables
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      contactNumber: "",
      whatsappNumber: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      district: "",
      province: "",
      postalCode: "",
      additionalNote: "",
    },
  });
  const [customers, setCustomers] = useState([]); // set customer local-variable
  const [searchQuery, setSearchQuery] = useState("");
  const [showCustomerSearch, setShowCustomerSearch] = useState(true);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [isCustomer, setIsCustomer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // set customers list
  useEffect(() => {
    getCustomers().then((response) => {
      if (!response) {
        toast.error("Error fetching customers.");
      }
      setCustomers(response);
    });
  }, []);

  // filter customers by search keyword
  useEffect(() => {
    console.log("customers: ", customers);
    if (searchQuery.trim()) {
      const filtered = customers.filter(
        (customer) =>
          `${customer.first_name}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers([]);
    }
  }, [searchQuery, customers]);

  // fetch all customers
  // TODO: replace fetch specific customer based on the user input
  const getCustomers = async () => {
    try {
      const response = await getAllCustomers();
      if (response.success) {
        return response.data;
      } else {
        console.error("Error fetching customers: ", response.message);
        return null;
      }
    } catch (error) {
      console.error("Error getting customers.", error);
      return null;
    }
  };

  const handleCustomerSelect = (customer) => {
    const selectedCustomer = {
      firstName: customer.first_name,
      lastName: customer.last_name,
      email: customer.email,
      contactNumber: customer.contact1,
      whatsappNumber: customer.contact2,
      addressLine1: customer.address_line1,
      addressLine2: customer.address_line2,
      city: customer.city,
      district: customer.district,
      province: customer.province,
      postalCode: customer.postal_code,
      additionalNote: customer.note,
    };
    reset(selectedCustomer); // reset form-fields
    setCustomer({
      ...selectedCustomer,
      user_code: customer.user_code,
    }); // set cart-context customer data
    setIsCustomer(true);
    setSearchQuery("");
    setFilteredCustomers([]);
    setShowCustomerSearch(false);
  };

  // submit customer create form
  const customerSubmit = async (data) => {
    setIsLoading(true);

    try {
      if (!isCustomer) {
        const newCustomerCode = generateId("C");
        const formData = {
          user_code: newCustomerCode,
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          contact1: data.contactNumber,
          contact2: data.whatsappNumber,
          address_line1: data.addressLine1,
          address_line2: data.addressLine2,
          city: data.city,
          district: data.district,
          province: data.province,
          postal_code: data.province,
          note: data.additionalNote,
        };
        const response = await createCustomer(formData);

        if (!response.success) {
          console.error("Error creating customer: ", response.message);
          toast.error(response.message.response.data.error);
          return;
        }
        console.log("success message: ", response.data.message);
        toast.success("Customer added successfully!");
        setIsCustomer(true); // mark as customer
        setCustomer(data);
      }
      // set time-out for success message
      setTimeout(() => {
        reset(); // clear form-fields
        navigate("/order/confirmation");
      }, 3000);
    } catch (error) {
      console.error("Error in customer submit: ", error);
      toast.error("Failed to create customer. Try again.");
    } finally {
      setIsLoading(false); // reset loading status
    }
  };

  return (
    <div className="min-h-screen py-8 w-full">
      <div className="mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {showCustomerSearch && (
            <>
              <h2 className="text-3xl font-semibold text-center mb-8">
                SEARCH CUSTOMER
              </h2>

              <div className="mb-8 relative">
                <input
                  type="text"
                  placeholder="Search existing customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-1"
                />
                {filteredCustomers.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredCustomers.map((customer) => (
                      <button
                        key={customer.id}
                        onClick={() => handleCustomerSelect(customer)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                      >
                        <div className="font-medium">
                          {customer.first_name} {customer.last_name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {customer.email}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => setShowCustomerSearch(false)}
                  className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
                >
                  + Add New Customer
                </button>
              </div>
            </>
          )}

          {!showCustomerSearch && (
            <>
              <h2 className="text-3xl font-semibold text-center mb-4">
                ADD CUSTOMER
              </h2>

              <button
                onClick={() => setShowCustomerSearch(true)}
                className="mt-2 text-blue-600 hover:text-blue-800 font-medium mb-4"
              >
                + Search Customer
              </button>

              <form
                onSubmit={handleSubmit(customerSubmit)}
                className="space-y-8"
              >
                {/* customer Information */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    <div>
                      <input
                        type="text"
                        name="firstName"
                        placeholder="First Name"
                        // value={formData.firstName}
                        // onChange={handleInputChange}
                        {...register("firstName", {
                          required: "First name required.",
                        })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none focus:ring-yellow-1 ${
                          errors.firstName
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.firstName.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <input
                        type="text"
                        name="lastName"
                        placeholder="Last Name"
                        // value={formData.lastName}
                        // onChange={handleInputChange}
                        {...register("lastName")}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none focus:ring-yellow-1 ${
                          errors.lastName ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.lastName.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        // value={formData.email}
                        // onChange={handleInputChange}
                        {...register("email")}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none focus:ring-yellow-1 ${
                          errors.email ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <input
                        type="tel"
                        name="contactNumber"
                        placeholder="Contact Number"
                        // value={formData.contactNumber}
                        // onChange={handleInputChange}
                        {...register("contactNumber")}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none focus:ring-yellow-1 ${
                          errors.contactNumber
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {errors.contactNumber && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.contactNumber.message}
                        </p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <input
                        type="tel"
                        name="whatsappNumber"
                        placeholder="WhatsApp Number (Optional)"
                        // value={formData.whatsappNumber}
                        // onChange={handleInputChange}
                        {...register("whatsappNumber")}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none focus:ring-yellow-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* <div>
                      <input
                        type="text"
                        name="addressNumber"
                        placeholder="Address Number"
                        value={formData.addressNumber}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none focus:ring-yellow-1"
                      />
                    </div> */}
                    <div>
                      <input
                        type="text"
                        name="addressLine1"
                        placeholder="Address Line 1"
                        // value={formData.addressLine1}
                        // onChange={handleInputChange}
                        {...register("addressLine1")}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none focus:ring-yellow-1 ${
                          errors.addressLine1
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {errors.addressLine1 && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.addressLine1.message}
                        </p>
                      )}
                    </div>
                    <div className="md:col-span-1">
                      <input
                        type="text"
                        name="addressLine2"
                        placeholder="Address Line 2 (Optional)"
                        // value={formData.addressLine2}
                        // onChange={handleInputChange}
                        {...register("addressLine2")}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none focus:ring-yellow-1"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        name="city"
                        placeholder="City"
                        // value={formData.city}
                        // onChange={handleInputChange}
                        {...register("city")}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none focus:ring-yellow-1 ${
                          errors.city ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.city && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.city.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <select
                        name="district"
                        // value={formData.district}
                        // onChange={handleInputChange}
                        {...register("district")}
                        defaultValue=""
                        className={cn(
                          "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none focus:ring-yellow-1 text-black",
                          "invalid:text-gray-400",
                          errors.district
                            ? "border-red-500"
                            : "border-gray-300",
                        )}
                      >
                        <option value="" disabled>
                          Select District
                        </option>
                        <option value="Colombo">Colombo</option>
                        <option value="Gampaha">Gampaha</option>
                        <option value="Kalutara">Kalutara</option>
                        <option value="Kandy">Kandy</option>
                        <option value="Matale">Matale</option>
                        <option value="Nuwara-eliya">Nuwara Eliya</option>
                        <option value="Galle">Galle</option>
                        <option value="Matara">Matara</option>
                        <option value="Hambantota">Hambantota</option>
                        <option value="Jaffna">Jaffna</option>
                        <option value="Kilinochchi">Kilinochchi</option>
                        <option value="Mannar">Mannar</option>
                        <option value="Mullaitivu">Mullaitivu</option>
                        <option value="Vavuniya">Vavuniya</option>
                        <option value="Trincomalee">Trincomalee</option>
                        <option value="Batticaloa">Batticaloa</option>
                        <option value="Ampara">Ampara</option>
                        <option value="Kurunegala">Kurunegala</option>
                        <option value="Puttalam">Puttalam</option>
                        <option value="Anuradhapura">Anuradhapura</option>
                        <option value="Polonnaruwa">Polonnaruwa</option>
                        <option value="Badulla">Badulla</option>
                        <option value="Monaragala">Monaragala</option>
                        <option value="Ratnapura">Ratnapura</option>
                        <option value="Kegalle">Kegalle</option>
                      </select>
                      {errors.district && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.district.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <input
                        type="text"
                        name="province"
                        placeholder="Province"
                        // value={formData.province}
                        // onChange={handleInputChange}
                        {...register("province")}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none focus:ring-yellow-1"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        name="postalCode"
                        placeholder="Postal Code"
                        // value={formData.postalCode}
                        // onChange={handleInputChange}
                        {...register("postalCode")}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none focus:ring-yellow-1 ${
                          errors.postalCode
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {errors.postalCode && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.postalCode.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Note */}
                <div>
                  <h3 className="text-xl font-semibold">Additional Note</h3>
                  <textarea
                    name="additionalNote"
                    placeholder="Type here..."
                    // value={formData.additionalNote}
                    // onChange={handleInputChange}
                    {...register("additionalNote")}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none focus:ring-yellow-1"
                  ></textarea>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className={cn(
                    "w-full p-3 flex flex-row items-center justify-center gap-4 rounded-lg bg-black",
                    "font-semibold uppercase text-white",
                    "hover:bg-gray-5 transition-colors",
                  )}
                  disabled={isLoading}
                >
                  Confirm
                  {isLoading && (
                    <FaSpinner
                      size={20}
                      color="white"
                      className="ms-3 animate-spin"
                    />
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default BillingDetails;
