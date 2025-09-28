import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaSpinner } from "react-icons/fa";
import {
  PackageSearch,
  Package,
  Scale,
  Star,
  ArrowRight,
  Trophy,
  Sparkles,
} from "lucide-react";
import axios from "axios";


// Mock service function for demo
const getPopularProductsData = async () => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Generate mock data
  const mockProducts = [
    {
      name: "Wireless Headphones Pro",
      category: "Electronics",
      totalSold: 245,
      
    },
    {
      name: "Smart Fitness Watch",
      category: "Wearables",
      totalSold: 189,
      
    },
    {
      name: "Organic Coffee Beans",
      category: "Food & Beverage",
      totalSold: 156,
    },
    {
      name: "Designer Backpack",
      category: "Fashion",
      totalSold: 134,
    },
    {
      name: "Gaming Mechanical Keyboard",
      category: "Electronics",
      totalSold: 98,
      
    },
  ];

  return { success: true, data: mockProducts };
};

const getPopularProductsDataOriginal = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(
      "http://localhost:3000/api/products/popular",
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    console.log('getPopularProductsOriginal',response.data.data.products);

    const dataToFrontend = response.data.data.products.map((product) => {
      // Apply regex per product
      let nameOnly = product.product_name;
      let quantity = "";

      const match = product.product_name.match(/^(.*)\s(\d+\s?[a-zA-Z]+)$/);
      if (match) {
        nameOnly = match[1];
        quantity = match[2];
      }

      return {
        name: nameOnly,
        category: quantity,
        totalSold: product.total_quantity || 0,
      };
    });

    console.log("dataToFrontend: ", dataToFrontend);

    return { success: true, data: dataToFrontend };
  } catch (error) {
    console.error("Error fetching popular products:", error);
    return { success: false, message: "Error fetching popular products" };
  }
};
export default function PopularProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getPopularProductsDataOriginal();
        if (result.success) {
          console.log("result: ", result.data);
          setProducts(Array.isArray(result.data) ? result.data : []);
        } else {
          setProducts([]);
          throw new Error(result.message || "Failed to fetch data");
        }
      } catch (err) {
        console.error("Failed to fetch popular products data:", err);
        setProducts([]);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const LoadingSpinner = () => (
    <div className="h-full w-full flex flex-col items-center justify-center gap-6 py-12">
      <div className="relative">
        <div className="w-20 h-20 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-full flex items-center justify-center animate-pulse">
          <FaSpinner size={32} color="white" className="animate-spin" />
        </div>
        <div className="absolute inset-0 w-20 h-20 border-4 border-purple-200 rounded-full animate-ping opacity-75"></div>
      </div>
      <div className="flex items-center gap-3 text-gray-600">
        <span className="text-xl font-medium">Loading product data</span>
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-0"></div>
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce delay-150"></div>
          <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce delay-300"></div>
        </div>
      </div>
    </div>
  );

  const ProductCard = ({ product, index, rank }) => {
    const getRankColor = (rank) => {
      if (rank === 1) return "from-blue-500 to-indigo-600";
      if (rank === 2) return "from-blue-500 to-indigo-600";
      if (rank === 3) return "from-blue-500 to-indigo-600";
      return "from-blue-400 to-indigo-400";
    };

    const getRankIcon = (rank) => {
      if (rank <= 3) return Trophy;
      return Star;
    };

    const RankIcon = getRankIcon(rank);

    return (
      <div className="group relative bg-white rounded-2xl border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
        <div className="p-4">
          <div className="flex items-center gap-4">
            {/* Rank Badge */}
            <div className="relative flex-shrink-0">
              <div
                className={`w-12 h-12 bg-gradient-to-br ${getRankColor(rank)} rounded-xl flex items-center justify-center shadow-lg`}
              >
                <span className="text-white font-bold text-lg">#{rank}</span>
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                <RankIcon className="w-3 h-3 text-yellow-500" />
              </div>
            </div>

            {/* Product Image */}
            {/* <div className="w-16 h-16 flex-shrink-0">
              <div className="w-full h-full rounded-xl overflow-hidden shadow-md group-hover:shadow-lg transition-shadow duration-300">
                <img
                  src={product.main_image}
                  alt="product-image"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src =
                      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150&h=150&fit=crop&crop=center";
                  }}
                />
              </div>
            </div> */}

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide truncate group-hover:text-gray-700 transition-colors">
                {product.name}
              </h3>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <Scale className="w-3 h-3" />
                {product.category}
              </p>
            </div>

            {/* Sales Count */}
            <div className="flex-shrink-0 text-right">
              <div className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full">
                <Package className="w-3 h-3" />
                <span className="font-bold text-sm">{product.totalSold}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-3xl border border-gray-200 shadow-xl">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-red-50 to-red-100 rounded-3xl border border-red-200 flex items-center justify-center shadow-xl">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <PackageSearch className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-red-700 font-semibold text-lg mb-2">
            Error Loading Data
          </h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden flex flex-col">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-400 text-white p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-white/10"></div>
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <PackageSearch className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-1">Popular Products</h2>
            <p className="text-white/80">Top selling items this period</p>
          </div>
          <div className="ml-auto">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Products List */}
      <div className="flex-1 p-6 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Column Headers */}
          <div className="flex justify-between items-center text-gray-500 text-sm mb-4 px-4 pb-2 border-b border-gray-100">
            <span className="font-medium">Product Rankings</span>
            <span className="font-medium">Stock</span>
          </div>

          {/* Products Container */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {Array.isArray(products) && products.length > 0 ? (
              products.map((product, index) => (
                <ProductCard
                  key={index}
                  product={product}
                  index={index}
                  rank={index + 1}
                />
              ))
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <PackageSearch className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">
                    No popular products data available
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-t border-gray-100">
        <Link to="/administrator/productlist" className="block w-full group">
          <button className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 group">
            <span>View All Products</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </Link>
      </div>
    </div>
  );
}
