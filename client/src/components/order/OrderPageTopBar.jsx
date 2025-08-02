import { NavLink, useLocation } from "react-router-dom";
import { topbarLinks } from "../../constants";
import { useEffect, useState } from "react";

const OrderConfirmationTopBar = () => {
  const { pathname } = useLocation();
  const [hasSelectedItems, setHasSelectedItems] = useState(false);

  useEffect(() => {
    const savedSelectedItems = JSON.parse(localStorage.getItem("selectedItems") || "[]");
    setHasSelectedItems(savedSelectedItems.length > 0);
  }, []);

  return (
    <div className="flex items-center justify-center mb-6 mt-8">
      <div className="relative flex items-center">
        <div className="absolute top-5 left-12 right-12 sm:left-24 sm:right-24  md:left-28 md:right-28 h-[2px] bg-gray-5"></div>
        {topbarLinks.map((link, index) => {
          const isActive = pathname === link.route;
          const isDisabled = link.route === "/order/add-items" && !hasSelectedItems;
          
          return (
            <div
              key={index}
              className="relative flex flex-col items-center z-10 mx-6 sm:mx-12 md:mx-16"
            >
              <div
                className={`h-10 w-10 flex flex-col items-center justify-center rounded-full border-2 font-normal text-xl z-10 ${
                  isActive
                    ? "bg-gray-5 text-white border-gray-5"
                    : !isDisabled
                      ? "bg-white text-gray-5 border-gray-5"
                      : "bg-white text-black border-black"
                }`}
              >
                {index + 1}
              </div>
              <p className="text-[10px] xxs:text-xs sm:text-sm mt-2 text-gray-600 text-nowrap">
                {link.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderConfirmationTopBar;
