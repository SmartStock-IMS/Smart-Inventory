import React from 'react';
import { Pencil, X } from 'lucide-react';

const ProductList = () => {
  const products = [
    {
      id: 1,
      name: 'Product A',
      description: 'UI Kit',
      price: 5461,
      itemCode: '12345678',
      stock: 'WL12345678',
    },
    {
      id: 2,
      name: 'Product A',
      description: 'UI Kit',
      price: 5461,
      itemCode: '12345678',
      stock: 'WL12345678',
    },
    {
      id: 3,
      name: 'Product A',
      description: 'UI Kit',
      price: 5461,
      itemCode: '12345678',
      stock: 'WL12345678',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-xl font-bold mb-6">Product List</h1>
      <div className="space-y-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex items-center justify-between p-4 border rounded-lg bg-white"
          >
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
              <div>
                <h3 className="font-medium">{product.name}</h3>
                <p className="text-sm text-gray-600">{product.description}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-8">
              <div className="text-right">
                <span className="font-medium">${product.price}</span>
              </div>
              
              <div className="text-right">
                <span className="text-gray-600">#{product.itemCode}</span>
              </div>
              
              <div className="text-right">
                <span className="text-gray-600">{product.stock}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="inline-flex items-center px-3 py-1.5 bg-gray-200 text-gray-800 rounded-full text-sm font-medium hover:bg-gray-300">
                  <Pencil className="w-4 h-4 mr-1" />
                  Edit Product
                </button>
                <button className="inline-flex items-center px-3 py-1.5 text-red-500 border border-red-500 rounded-full text-sm font-medium hover:bg-red-50">
                  <X className="w-4 h-4 mr-1" />
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;