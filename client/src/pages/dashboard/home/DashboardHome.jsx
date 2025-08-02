import Overview from "../../../components/dashboard/home/Overviwe.jsx";
import Income from "../../../components/dashboard/home/Income.jsx";
import Popular from "../../../components/dashboard/home/Popularproducts.jsx";

export const DashboardHome = () => {
  return (
    <div className="h-full w-full flex flex-row gap-2">
      <div className="w-2/3 h-full flex flex-col gap-2">
        <div className="h-fit">
          <Overview />
        </div>
        <div className="flex flex-grow">
          <Income />
        </div>
      </div>
      <div className="w-1/3 h-full">
        <Popular />
      </div>
    </div>
  );
};

export default DashboardHome;
