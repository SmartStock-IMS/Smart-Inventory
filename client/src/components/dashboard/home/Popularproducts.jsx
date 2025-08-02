import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getPopularProductsData } from "../../../services/dashboard-service";
import {FaSpinner} from "react-icons/fa";
import { PackageSearch } from "lucide-react";

export default function PopularProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getPopularProductsData();
        if (result.success) {
          console.log("result: ", result.data);
          setProducts(result.data);
        } else {
          throw new Error(result.message || "Failed to fetch data");
        }
      } catch (err) {
        console.error("Failed to fetch popular products data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-full w-full flex flex-row items-center justify-center gap-2 bg-white rounded-md">
        Loading product data
        <FaSpinner size={20} color="black" className="animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="w-full h-full px-4 pt-4 bg-white rounded-md">
      <div className="h-[90%] flex flex-col gap-4">
        <div className="flex flex-row items-center gap-2">
          <PackageSearch className="w-6 h-6" />
          <h2 className="text-lg font-semibold">Popular Products</h2>
        </div>
        <div>
          <div className="flex justify-between text-gray-500 text-sm mb-2 px-2">
            <span>Product</span>
            <span>Total Sold</span>
          </div>
          <div className="divide-y overflow-y-auto">
            {products.map((product, index) => (
              <div key={index} className="p-2 flex flex-row justify-between items-center text-sm">
                <div className="w-5/6 flex flex-row items-center gap-3">
                  <div className="w-1/4 rounded-md shadow">
                    <img src={product.main_image} alt="product-image" className="object-contain aspect-square"/>
                  </div>
                  <div className="w-3/4">
                    <p className="font-medium uppercase">{product.name}</p>
                    <p className="text-gray-500">{product.category}</p>
                  </div>
                </div>
                <div className="w-1/6 flex flex-row items-center justify-end">
                  <span className="font-medium">{product.totalSold}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="h-[10%] flex flex-row items-center justify-end">
        <Link
          to="/dashboard/productlist"
          className="w-full p-2 flex flex-row items-center justify-center bg-white"
        >
          <button className="w-full py-1.5 border border-gray-300 rounded-md hover:bg-gray-200">
            All Products
          </button>
        </Link>
      </div>
    </div>
  );
}
