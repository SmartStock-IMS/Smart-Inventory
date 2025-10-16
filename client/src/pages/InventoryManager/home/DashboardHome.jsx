import Overview from "../../../components/InventoryManager/home/Overviwe.jsx";
import Income from "../../../components/InventoryManager/home/Income.jsx";
import Popular from "../../../components/InventoryManager/home/Popularproducts.jsx";
import { useTheme } from "../../../context/theme/ThemeContext.jsx";

export const DashboardHome = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`w-full min-h-full flex flex-col lg:flex-row gap-4 overflow-y-auto transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-white'
    }`}>
      <div className="w-full lg:w-2/3 flex flex-col gap-4">
        <div className="min-h-[300px]">
          <Overview />
        </div>
        <div className="min-h-[400px] lg:min-h-[500px]">
          <Income />
        </div>
      </div>
      <div className="w-full lg:w-1/3 min-h-[500px] lg:min-h-[600px]">
        <Popular />
      </div>
    </div>
  );
};

export default DashboardHome;
