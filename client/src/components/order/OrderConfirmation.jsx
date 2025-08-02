import { useState} from "react";
import { useCart } from "../../context/cart/CartContext";
import { useAuth } from "../../context/auth/AuthContext";
import Invoice from "./Invoice";
import { ToastContainer, toast } from "react-toastify";
import { createNewQuotation } from "@services/quotation-service";
import generateId from "@lib/generate-id.js";
import {cn} from "@lib/utils.js";

const OrderConfirmation = () => {
  const { customer, cartState } = useCart();
  const { user } = useAuth();
  // init local-variables
  const [quotationData, setQuotationData] = useState({});
  const [showDownloadButton, setShowDownloadButton] = useState(false);
  const [orderTerm, setOrderTerm] = useState("");
  const [orderTermError, setOrderTermError] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [companyError, setCompanyError] = useState(false);

  const quotationId = generateId("QT");
  const currentDate = new Date().toISOString().split("T")[0];
  const initDueDate = new Date();
  initDueDate.setMonth(new Date().getMonth() + 1);
  const dueDate = initDueDate.toISOString().split("T")[0];

  if (!cartState || !customer) {
    return null;
  }

  const handleConfirmOrder = async () => {
    try {
      if (orderTerm === "") {
        setOrderTermError(true);
        toast.error("Please select payment term");
        return;
      }

      if (companyName === "") {
        setCompanyError(true);
        toast.error("Please select billing company");
        return;
      }

      const qtData = {
        quotation_id: quotationId,
        quotation_date: currentDate,
        quotation_due_date: dueDate,
        subtotal: cartState.subtotal,
        discount: Number(cartState.discount),
        selected_items: cartState.selectedItems,
        customer_code: customer.user_code,
        sales_rep_id: user.user_code,
        payment_term: orderTerm,
        company: companyName,
      };

      setQuotationData(qtData);
      console.log("quotation-data: ", qtData);

      const response = await createNewQuotation(qtData);
      if (response.success) {
        // setItems(response.data);
        toast.success("Successfully Created");
        setOrderTermError(false);
        setShowDownloadButton(true);
      } else {
        toast.error("Place order failed");
      }
    } catch (error) {
      console.error("Place order failed: ", error);
    }
  };

  return (
    <>
      {!showDownloadButton && (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          <h2 className="text-2xl font-bold text-center">Order Confirmation</h2>

          {/* Billing Details Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Billing Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-600">
              <div>
                <span className="font-medium">Name:</span> {customer.firstName}{" "}
                {customer.lastName}
              </div>
              <div>
                <span className="font-medium">Email:</span> {customer.email}
              </div>
              <div>
                <span className="font-medium">Phone:</span>{" "}
                {customer.contactNumber}
              </div>
              <div className="col-span-1 sm:col-span-2">
                <span className="font-medium">Address:</span>{" "}
                {customer.addressLine1},{" "}
                {customer.addressLine2 && customer.addressLine2},{" "}
                {customer.city}, {customer.district}, {customer.province},{" "}
                {customer.postalCode}.
              </div>
            </div>
          </div>

          {/* Order Items Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Order Items</h3>
            <div className="divide-y">
              {cartState.selectedItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-4"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.main_image}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg border border-gray-300"
                    />
                    <div>
                      <h4 className="font-medium">{item.name}</h4>
                      <div className="text-sm text-gray-500">
                        Colour: {item.color} | Code: {item.code}
                      </div>
                      <div className="text-sm text-gray-500">
                        Quantity: {item.quantity} × Rs.
                        {item.price.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="font-medium">
                    Rs.{(item.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Term Section */}
          <div className="bg-white p-6 flex flex-col gap-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Order Payment</h3>
            {/* Payment Term */}
            <div className="flex flex-col gap-2">
              <p>Payment Term</p>
              <div className={cn(
                "p-2 border rounded-md",
                orderTermError && "border-red-500"
              )}>
                <select
                  name="invoice-terms"
                  id="invoiceTemrs"
                  className="w-full pe-2 focus-visible:outline-none"
                  value={orderTerm}
                  onChange={(e) => {
                    setOrderTerm(e.target.value);
                    if (e.target.value !== "") {
                      setOrderTermError(false);
                    }
                  }}
                >
                  <option value="">Select payment term...</option>
                  <option value="Cash">Cash</option>
                  <option value="Credit">Credit</option>
                  <option value="30 Days">30 Days</option>
                  <option value="45 Days">45 Days</option>
                  <option value="60 Days">60 Days</option>
                </select>
              </div>
            </div>
            {/* Payment Company */}
            <div className="flex flex-col gap-2">
              <p>Billing Company</p>
              <div className={cn(
                "p-2 border rounded-md",
                companyError && "border-red-500"
              )}>
                <select
                  name="invoice-terms"
                  id="invoiceTemrs"
                  className="w-full pe-2 focus-visible:outline-none"
                  value={companyName}
                  onChange={(e) => {
                    setCompanyName(e.target.value);
                    if (e.target.value !== "") {
                      setCompanyError(false);
                    }
                  }}
                >
                  <option value="">Select company...</option>
                  <option value="Trollius">Trollius</option>
                  <option value="Mehera">Mehera</option>
                </select>
              </div>
            </div>
          </div>

          {/* Order Summary Section */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>Rs.{cartState.subtotal.toLocaleString()}</span>
              </div>
              {cartState.discount && (
                <div className="flex justify-between text-gray-600">
                  <span>Discount ({cartState.discount}%)</span>
                  <span>
                    -Rs.
                    {(
                      (cartState.subtotal * cartState.discount) /
                      100
                    ).toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-3 border-t">
                <span>Total</span>
                <span>Rs.{cartState.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Confirm Order Button */}
          <button
            onClick={() => handleConfirmOrder()}
            className="w-full bg-black text-white py-4 rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Place Order
          </button>
        </div>
      )}
      {showDownloadButton && (
        <Invoice cartState={cartState} billingDetails={customer} quotationData={quotationData} />
      )}
      <ToastContainer autoClose={2000} />
    </>
  );
};

export default OrderConfirmation;
