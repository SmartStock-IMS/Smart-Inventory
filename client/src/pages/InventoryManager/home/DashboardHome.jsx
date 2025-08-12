import Overview from "../../../components/InventoryManager/home/Overviwe.jsx";
import Income from "../../../components/InventoryManager/home/Income.jsx";
import Popular from "../../../components/InventoryManager/home/Popularproducts.jsx";

export const DashboardHome = () => {
  return (
    <div className="h-full w-full flex flex-col lg:flex-row gap-2 lg:gap-4">
      <div className="w-full lg:w-2/3 h-full flex flex-col gap-2 lg:gap-4">
        <div className="h-fit">
          <Overview />
        </div>
        <div className="flex flex-grow min-h-0">
          <Income />
        </div>
      </div>
      <div className="w-full lg:w-1/3 h-96 lg:h-full">
        <Popular />
      </div>
    </div>
  );
};

export default DashboardHome;
