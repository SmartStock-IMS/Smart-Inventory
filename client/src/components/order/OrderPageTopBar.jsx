import { NavLink, useLocation } from "react-router-dom";
import { topbarLinks } from "../../constants";
import { useEffect, useState } from "react";

const OrderConfirmationTopBar = () => {
  const { pathname } = useLocation();
  const [hasSelectedItems, setHasSelectedItems] = useState(false);

  useEffect(() => {
    const savedSelectedItems = JSON.parse(localStorage.getItem("selectedItems") || "[]");
    setHasSelectedItems(savedSelectedItems.length > 0);
  }, [pathname]); // Add pathname dependency to update when route changes

  // Debug logging
  // console.log("Current pathname:", pathname);
  // console.log("Topbar links:", topbarLinks);
  
  // Ensure topbarLinks exists and has content
  if (!topbarLinks || topbarLinks.length === 0) {
    console.error("topbarLinks is empty or undefined");
    return null; // Don't render if no links available
  }
  
  const currentStepIndex = topbarLinks.findIndex(l => l.route === pathname);
  // console.log("Current step index:", currentStepIndex);
  
  // Better logic for determining current step
  let validCurrentStepIndex = currentStepIndex;
  if (currentStepIndex === -1) {
    // If exact route not found, try to determine based on pathname
    if (pathname.includes('/add-items')) {
      validCurrentStepIndex = 0;
    } else if (pathname.includes('/billing-details')) {
      validCurrentStepIndex = 1;
    } else if (pathname.includes('/confirmation')) {
      validCurrentStepIndex = 2;
    } else {
      validCurrentStepIndex = 0; // Default to first step
    }
  }
  
  const progressPercentage = ((validCurrentStepIndex + 1) / topbarLinks.length) * 100;
  
  // console.log("Valid current step index:", validCurrentStepIndex);
  // console.log("Progress percentage:", progressPercentage);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 mb-3">
      {/* Mobile Layout */}
      <div className="block lg:hidden">
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg border border-slate-200/60 p-4 backdrop-blur-sm">
          <div className="space-y-3">
            {topbarLinks.map((link, index) => {
              const isActive = pathname === link.route;
              const isDisabled = link.route === "/order/add-items" && !hasSelectedItems;
              const isCompleted = validCurrentStepIndex > index;
              
              // console.log(`Step ${index + 1}: ${link.label}`, { isActive, isCompleted, isDisabled });
              
              return (
                <div key={index} className="relative">
                  {/* Connecting Line */}
                  {index < topbarLinks.length - 1 && (
                    <div className={`absolute left-4 top-9 w-0.5 h-6 ${
                      isCompleted ? "bg-gradient-to-b from-emerald-500 to-emerald-400" : "bg-slate-200"
                    }`} />
                  )}
                  
                  <div className="flex items-center gap-3 relative z-10">
                    {/* Step Circle with Glow */}
                    <div className="relative">
                      {isActive && (
                        <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-30 animate-pulse" />
                      )}
                      <div
                        className={`
                          relative w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm
                          transition-all duration-300 shadow-lg
                          ${isActive 
                            ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-blue-500/50 scale-110" 
                            : isCompleted
                            ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-emerald-500/30"
                            : isDisabled
                            ? "bg-slate-100 text-slate-400 shadow-slate-200/50"
                            : "bg-white text-slate-600 shadow-slate-300/50 border-2 border-slate-200"
                          }
                        `}
                      >
                        {isCompleted ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          index + 1
                        )}
                      </div>
                    </div>
                    
                    {/* Step Info */}
                    <div className="flex-1">
                      <p className={`
                        font-semibold text-sm leading-tight
                        transition-colors duration-200
                        ${isActive 
                          ? "text-blue-700" 
                          : isCompleted
                          ? "text-emerald-700"
                          : isDisabled 
                          ? "text-slate-400" 
                          : "text-slate-700"
                        }
                      `}>
                        {link.label}
                      </p>
                      <p className={`text-xs mt-0.5 font-medium ${
                        isActive ? "text-blue-600" : isCompleted ? "text-emerald-600" : "text-slate-500"
                      }`}>
                        {isActive ? "In Progress" : isCompleted ? "Completed" : isDisabled ? "Locked" : "Upcoming"}
                      </p>
                    </div>
                    
                    {/* Status Icon */}
                    {isActive && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 border border-blue-200">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
                        <span className="text-xs font-bold text-blue-700">Active</span>
                      </div>
                    )}
                    {isCompleted && (
                      <div className="p-1 rounded-full bg-emerald-100">
                        <svg className="w-3.5 h-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="w-full max-w-6xl mx-auto">
          <div className="bg-gradient-to-br from-white via-slate-50 to-white rounded-2xl shadow-xl border border-slate-200/60 p-6 backdrop-blur-sm">
            <div className="relative">
              {/* Progress Line Container */}
              <div className="absolute top-6 left-0 right-0 flex items-center px-8">
                <div className="flex-1 flex items-center">
                  {/* Background Line */}
                  <div className="flex-1 h-1 bg-slate-200 rounded-full" />
                  
                  {/* Active Progress Line with Gradient */}
                  <div 
                    className="absolute h-1 bg-gradient-to-r from-blue-500 via-blue-600 to-emerald-500 rounded-full transition-all duration-700 ease-out shadow-lg shadow-blue-500/30"
                    style={{ 
                      width: `calc(${Math.max(0, (validCurrentStepIndex / (topbarLinks.length - 1)) * 100)}% - 2rem)`,
                      left: '2rem'
                    }}
                  />
                </div>
              </div>

              {/* Steps */}
              <div className="relative flex items-start justify-between">
                {topbarLinks.map((link, index) => {
                  const isActive = pathname === link.route;
                  const isDisabled = link.route === "/order/add-items" && !hasSelectedItems;
                  const isCompleted = validCurrentStepIndex > index;
                  
                  // console.log(`Desktop Step ${index + 1}: ${link.label}`, { isActive, isCompleted, isDisabled });
                  
                  return (
                    <div key={index} className="relative flex flex-col items-center z-10 flex-1 group">
                      {/* Glow Effect for Active Step */}
                      {isActive && (
                        <div className="absolute top-0 inset-x-0 mx-auto w-14 h-14 bg-blue-500 rounded-full blur-2xl opacity-20 animate-pulse" />
                      )}
                      
                      {/* Step Circle */}
                      <div className="relative">
                        <div
                          className={`
                            w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm
                            transition-all duration-300 shadow-lg relative
                            ${isActive 
                              ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-blue-500/50 scale-110 ring-4 ring-blue-100" 
                              : isCompleted
                              ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-emerald-500/40 hover:scale-105"
                              : isDisabled
                              ? "bg-slate-100 text-slate-400 shadow-slate-200/50"
                              : "bg-white text-slate-600 shadow-slate-300/50 border-2 border-slate-300 hover:border-slate-400 hover:scale-105"
                            }
                          `}
                        >
                          {isCompleted ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            index + 1
                          )}
                        </div>
                      </div>
                      
                      {/* Step Label */}
                      <div className="mt-3 text-center max-w-[140px]">
                        <p className={`
                          text-sm font-semibold leading-tight mb-1
                          transition-colors duration-200
                          ${isActive 
                            ? "text-blue-700" 
                            : isCompleted
                            ? "text-emerald-700"
                            : isDisabled 
                            ? "text-slate-400" 
                            : "text-slate-700 group-hover:text-slate-900"
                          }
                        `}>
                          {link.label}
                        </p>
                        
                        {/* Status Badge */}
                        <div className={`
                          inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold
                          transition-all duration-200
                          ${isActive 
                            ? "bg-blue-100 text-blue-700 border border-blue-200" 
                            : isCompleted
                            ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                          }
                        `}>
                          {isActive && <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />}
                          {isActive ? "Current" : isCompleted ? "Done" : isDisabled ? "Locked" : "Pending"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Summary Card */}
      <div className="mt-2 max-w-xl mx-auto">
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-3 shadow-sm border border-slate-200/60">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-slate-700">Overall Progress</span>
            </div>
            <span className="text-base font-bold text-slate-800">
              {validCurrentStepIndex + 1}/{topbarLinks.length}
            </span>
          </div>
          
          {/* Enhanced Progress Bar */}
          <div className="relative w-full h-2.5 bg-slate-200 rounded-full overflow-hidden shadow-inner">
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-blue-600 to-emerald-500 rounded-full transition-all duration-700 ease-out shadow-lg"
              style={{ width: `${progressPercentage}%` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </div>
          
          <p className="text-xs text-slate-600 mt-1.5 text-center font-medium">
            {progressPercentage === 100 ? "All steps completed! 🎉" : `${Math.round(progressPercentage)}% Complete`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationTopBar;