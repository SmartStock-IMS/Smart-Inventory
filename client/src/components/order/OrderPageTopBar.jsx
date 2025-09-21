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
    <div className="w-full px-4 sm:px-6 mb-8 mt-6">
      {/* Mobile Layout */}
      <div className="block sm:hidden">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="space-y-4">
            {topbarLinks.map((link, index) => {
              const isActive = pathname === link.route;
              const isDisabled = link.route === "/order/add-items" && !hasSelectedItems;
              const isCompleted = topbarLinks.findIndex(l => l.route === pathname) > index;
              
              return (
                <div key={index} className="flex items-center gap-4">
                  {/* Step Circle */}
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                      ${isActive 
                        ? "bg-blue-600 text-white" 
                        : isCompleted
                        ? "bg-green-600 text-white"
                        : isDisabled
                        ? "bg-gray-300 text-gray-500"
                        : "bg-slate-200 text-slate-600"
                      }
                    `}
                  >
                    {isCompleted ? "✓" : index + 1}
                  </div>
                  
                  {/* Step Info */}
                  <div className="flex-1">
                    <p className={`
                      font-medium text-sm
                      ${isActive 
                        ? "text-blue-600" 
                        : isCompleted
                        ? "text-green-600"
                        : isDisabled 
                        ? "text-gray-400" 
                        : "text-slate-600"
                      }
                    `}>
                      {link.label}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {isActive ? "Current Step" : isCompleted ? "Completed" : isDisabled ? "Pending" : "Next"}
                    </p>
                  </div>
                  
                  {/* Status Badge */}
                  <div className={`
                    px-2 py-1 rounded-full text-xs font-medium
                    ${isActive 
                      ? "bg-blue-100 text-blue-700" 
                      : isCompleted
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-500"
                    }
                  `}>
                    {isActive ? "Active" : isCompleted ? "Done" : "Pending"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden sm:block">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="relative flex items-center justify-between">
              {/* Progress Line Background */}
              <div className="absolute top-6 left-12 right-12 h-0.5 bg-slate-200" />
              
              {/* Progress Line Active */}
              <div 
                className="absolute top-6 left-12 h-0.5 bg-blue-600"
                style={{ 
                  width: `${Math.max(0, (topbarLinks.findIndex(l => l.route === pathname) / (topbarLinks.length - 1)) * 100)}%` 
                }}
              />

              {topbarLinks.map((link, index) => {
                const isActive = pathname === link.route;
                const isDisabled = link.route === "/order/add-items" && !hasSelectedItems;
                const isCompleted = topbarLinks.findIndex(l => l.route === pathname) > index;
                
                return (
                  <div key={index} className="relative flex flex-col items-center z-10">
                    {/* Step Circle */}
                    <div
                      className={`
                        w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm border-2
                        ${isActive 
                          ? "bg-blue-600 text-white border-blue-600" 
                          : isCompleted
                          ? "bg-green-600 text-white border-green-600"
                          : isDisabled
                          ? "bg-white border-gray-300 text-gray-400"
                          : "bg-white border-slate-300 text-slate-600"
                        }
                      `}
                    >
                      {isCompleted ? "✓" : index + 1}
                    </div>
                    
                    {/* Step Label */}
                    <div className="mt-3 text-center">
                      <p className={`
                        text-sm font-medium
                        ${isActive 
                          ? "text-blue-600" 
                          : isCompleted
                          ? "text-green-600"
                          : isDisabled 
                          ? "text-gray-400" 
                          : "text-slate-600"
                        }
                      `}>
                        {link.label}
                      </p>
                      
                      {/* Status */}
                      <p className="text-xs text-slate-500 mt-1">
                        {isActive ? "Current" : isCompleted ? "Completed" : isDisabled ? "Pending" : "Next"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Simple Progress Summary */}
      <div className="mt-4 max-w-md mx-auto">
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Progress:</span>
            <span className="font-medium text-slate-800">
              Step {topbarLinks.findIndex(l => l.route === pathname) + 1} of {topbarLinks.length}
            </span>
          </div>
          
          {/* Simple Progress Bar */}
          <div className="mt-2 w-full bg-slate-200 rounded-full h-1.5">
            <div 
              className="bg-blue-600 h-1.5 rounded-full"
              style={{ 
                width: `${((topbarLinks.findIndex(l => l.route === pathname) + 1) / topbarLinks.length) * 100}%` 
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationTopBar;