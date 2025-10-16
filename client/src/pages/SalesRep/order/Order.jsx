import { Outlet } from "react-router-dom";
import OrderConfirmationTopBar from "../../../components/order/OrderPageTopBar";

const Order = () => {
  return (
    <div className="bg-white min-h-screen flex flex-col items-center py-4 pt-16 sm:pt-20 md:pt-24 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-7xl">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium text-center text-black mb-2 sm:mb-3">
          Create Quotation
        </h1>
        <OrderConfirmationTopBar />
        <div className="w-full mt-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Order;