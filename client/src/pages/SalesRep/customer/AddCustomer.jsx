import { useForm } from "react-hook-form";
import { cn } from "@lib/utils.js";
import { createCustomer } from "../../../services/customer-services";
import generateId from "@lib/generate-id";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState } from "react";
import { FaSpinner } from "react-icons/fa";

const AddCustomerForm = () => {
  const { register, handleSubmit, reset } = useForm({
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
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      const customerCode = generateId("C");
      const formData = {
        user_code: customerCode,
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

      // set time-out for success message
      setTimeout(() => {
        reset(); // clear form-fields
      }, 3000);
    } catch (error) {
      console.error("Error in customer submit: ", error);
      toast.error("Failed to create customer. Try again.");
    } finally {
      setIsLoading(false); // reset loading status
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-32 px-4">
      <div className="bg-white shadow-md rounded-lg p-6 sm:p-8 w-full max-w-4xl">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Title */}
          <h2 className="text-center text-2xl font-bold mb-6">ADD CUSTOMER</h2>
          {/* customer Information */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Customer Information</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <input
                type="text"
                name="firstName"
                {...register("firstName")}
                placeholder="First Name"
                className="p-2 border rounded-md w-full"
              />
              <input
                type="text"
                name="lastName"
                {...register("lastName")}
                placeholder="Last Name"
                className="p-2 border rounded-md w-full"
              />
              <input
                type="email"
                name="email"
                {...register("email")}
                placeholder="Email"
                className="lg:col-span-2 p-2 border rounded-md w-full"
              />
              <input
                type="text"
                name="contactNumber"
                {...register("contactNumber")}
                placeholder="Contact Number"
                className="p-2 border rounded-md w-full"
              />
              <input
                type="text"
                name="whatsappNumber"
                {...register("whatsappNumber")}
                placeholder="WhatsApp Number"
                className="p-2 border rounded-md w-full"
              />
            </div>
          </div>
          {/* Divider */}
          <hr className="my-6 border-gray-300" />
          {/* Address */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="addressLine1"
                {...register("addressLine1")}
                placeholder="Address Line 1"
                className="p-2 border rounded-md w-full"
              />
              <input
                type="text"
                name="addressLine2"
                {...register("addressLine2")}
                placeholder="Address Line 2"
                className="p-2 border rounded-md w-full"
              />
              <input
                type="text"
                name="city"
                {...register("city")}
                placeholder="City"
                className="p-2 border rounded-md w-full"
              />
              <select
                name="district"
                required={true}
                defaultValue=""
                {...register("district")}
                className={cn(
                  "p-2 border rounded-md w-full text-black",
                  "invalid:text-gray-400",
                )}
              >
                <option value="" disabled>
                  District
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
              <input
                type="text"
                name="province"
                {...register("province")}
                placeholder="Province"
                className="p-2 border rounded-md w-full"
              />
              <input
                type="text"
                name="postalCode"
                {...register("postalCode")}
                placeholder="Postal Code"
                className="p-2 border rounded-md w-full"
              />
            </div>
          </div>
          {/* Divider */}
          <hr className="my-6 border-gray-300" />
          {/* Additional Note */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Additional Note</h3>
            <textarea
              name="additionalNote"
              {...register("additionalNote")}
              placeholder="Type here..."
              className="w-full p-2 border rounded-md h-24"
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
            Add Customer
            {isLoading && (
              <FaSpinner
                size={20}
                color="white"
                className="ms-3 animate-spin"
              />
            )}
          </button>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default AddCustomerForm;
