import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/cart/CartContext.jsx';

const BillingDetailsSimple = () => {
  console.log("🛒 Simple BillingDetails component rendering");
  
  const navigate = useNavigate();
  const { cartState } = useCart();
  
  console.log("🛒 Cart state:", cartState);

  return (
    <div className="min-h-screen bg-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-800 mb-6">Billing Details - Test Page</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Component is working!</h2>
          <p className="mb-4">Cart state: {JSON.stringify(cartState, null, 2)}</p>
          
          <div className="flex gap-4">
            <button 
              onClick={() => navigate("../add-items")} 
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              ← Back to Add Items
            </button>
            
            <button 
              onClick={() => navigate("confirmation")} 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Continue to Confirmation →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingDetailsSimple;