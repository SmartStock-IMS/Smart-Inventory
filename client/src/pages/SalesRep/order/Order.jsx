import { Outlet } from "react-router-dom";
import OrderConfirmationTopBar from "../../../components/order/OrderPageTopBar";

const Order = () => {
  return (
    <div className="bg-white flex flex-col items-center py-8 pt-32">
      <div className="max-w-7xl">
        <h1 className="text-3xl md:text-5xl font-medium text-center text-black mb-6">
          Create Quotation
        </h1>
        <OrderConfirmationTopBar />
        <div className="grid grid-cols-1 mt-6">
          <div className="col-span-1">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Order;