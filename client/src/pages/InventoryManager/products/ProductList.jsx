import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ExternalLink, Trash2, List, Sparkles, Package, Scale, Eye, AlertCircle, CheckCircle, Filter, Grid3X3, TableProperties, Edit3 } from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import axios from "axios";


// Mock spice products data
const mockSpiceProducts = [
  {
    id: "SP001",
    name: "Premium Turmeric Powder",
    main_image: "https://images.unsplash.com/photo-1615485925600-97237c4fc1ec?w=400",
    no_variants: 3,
    variants: [
      { product_code: "TUR-100G", weight: "100g", price: 45 },
      { product_code: "TUR-250G", weight: "250g", price: 95 },
      { product_code: "TUR-500G", weight: "500g", price: 180 }
    ],
    description: "Premium quality turmeric powder with high curcumin content",
    stock_quantity: 250
  },
  {
    id: "SP002",
    name: "Organic Black Pepper",
    main_image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
    no_variants: 4,
    variants: [
      { product_code: "BP-50G", weight: "50g", price: 120 },
      { product_code: "BP-100G", weight: "100g", price: 220 },
      { product_code: "BP-250G", weight: "250g", price: 500 },
      { product_code: "BP-500G", weight: "500g", price: 950 }
    ],
    description: "Organic black pepper from Kerala plantations",
    stock_quantity: 180
  },
  {
    id: "SP003",
    name: "Kashmiri Red Chili Powder",
    main_image: "https://images.unsplash.com/photo-1583479964730-28532b684e3d?w=400",
    no_variants: 2,
    variants: [
      { product_code: "KRC-200G", weight: "200g", price: 85 },
      { product_code: "KRC-500G", weight: "500g", price: 200 }
    ],
    description: "Mild heat Kashmiri red chili powder for vibrant color",
    stock_quantity: 320
  },
  {
    id: "SP004",
    name: "Garam Masala Blend",
    main_image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400",
    no_variants: 3,
    variants: [
      { product_code: "GM-100G", weight: "100g", price: 75 },
      { product_code: "GM-200G", weight: "200g", price: 140 },
      { product_code: "GM-500G", weight: "500g", price: 320 }
    ],
    description: "Traditional blend of aromatic whole spices",
    stock_quantity: 150
  },
  {
    id: "SP005",
    name: "Whole Cumin Seeds",
    main_image: "https://images.unsplash.com/photo-1596040033676-ba0e24eb5e0d?w=400",
    no_variants: 3,
    variants: [
      { product_code: "CUM-100G", weight: "100g", price: 65 },
      { product_code: "CUM-250G", weight: "250g", price: 150 },
      { product_code: "CUM-500G", weight: "500g", price: 280 }
    ],
    description: "Premium quality whole cumin seeds",
    stock_quantity: 200
  },
  {
    id: "SP006",
    name: "Coriander Seeds",
    main_image: "https://images.unsplash.com/photo-1585742244019-7e1e6a502106?w=400",
    no_variants: 2,
    variants: [
      { product_code: "COR-200G", weight: "200g", price: 55 },
      { product_code: "COR-500G", weight: "500g", price: 130 }
    ],
    description: "Fresh aromatic coriander seeds",
    stock_quantity: 175
  },
  {
    id: "SP007",
    name: "Cinnamon Sticks",
    main_image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
    no_variants: 2,
    variants: [
      { product_code: "CIN-50G", weight: "50g", price: 180 },
      { product_code: "CIN-100G", weight: "100g", price: 340 }
    ],
    description: "Premium Ceylon cinnamon sticks",
    stock_quantity: 95
  },
  {
    id: "SP008",
    name: "Star Anise",
    main_image: "https://images.unsplash.com/photo-1571091655789-405eb7a3a3a8?w=400",
    no_variants: 2,
    variants: [
      { product_code: "SA-25G", weight: "25g", price: 90 },
      { product_code: "SA-50G", weight: "50g", price: 170 }
    ],
    description: "Premium star anise for aromatic cooking",
    stock_quantity: 60
  },
  {
    id: "SP009",
    name: "Cardamom Pods (Green)",
    main_image: "https://images.unsplash.com/photo-1609501676725-7186f734d4c5?w=400",
    no_variants: 3,
    variants: [
      { product_code: "CAR-25G", weight: "25g", price: 220 },
      { product_code: "CAR-50G", weight: "50g", price: 420 },
      { product_code: "CAR-100G", weight: "100g", price: 800 }
    ],
    description: "Premium green cardamom pods from Western Ghats",
    stock_quantity: 80
  },
  {
    id: "SP010",
    name: "Biryani Masala",
    main_image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400",
    no_variants: 2,
    variants: [
      { product_code: "BM-100G", weight: "100g", price: 85 },
      { product_code: "BM-250G", weight: "250g", price: 200 }
    ],
    description: "Authentic biryani masala blend",
    stock_quantity: 130
  },
  {
    id: "SP011",
    name: "Mustard Seeds (Yellow)",
    main_image: "https://images.unsplash.com/photo-1471195653727-34409dfca46a?w=400",
    no_variants: 2,
    variants: [
      { product_code: "MS-100G", weight: "100g", price: 45 },
      { product_code: "MS-250G", weight: "250g", price: 105 }
    ],
    description: "Fresh yellow mustard seeds",
    stock_quantity: 220
  },
  {
    id: "SP012",
    name: "Fenugreek Seeds",
    main_image: "https://images.unsplash.com/photo-1596735886653-ac2327c39d12?w=400",
    no_variants: 2,
    variants: [
      { product_code: "FEN-100G", weight: "100g", price: 55 },
      { product_code: "FEN-250G", weight: "250g", price: 125 }
    ],
    description: "Premium quality fenugreek seeds",
    stock_quantity: 140
  }
];



const getProducts = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get('http://localhost:3000/api/products', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error fetching products:', error);
    return { success: false, error: error.message };
  }
};

const getAllProducts = async (page = 1, limit = 15) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get('http://localhost:3000/api/products', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      params: {
        page: page,
        limit: limit,
      }
    });

    const data = response.data.data || response.data;
    const products = data.products || [];
    const total = data.total || products.length;
    const hasMore = page * limit < total;
    
    return { 
      success: true, 
      data: products, 
      hasMore, 
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    };
  } catch (error) {
    console.error('Error fetching paginated products:', error);
    return { success: false, error: error.message };
  }
};


const deleteProductsByCategory = async (categoryName) => {
  try {
    const token = localStorage.getItem("token");
    // First, get all products to find products in this category
    const productsResponse = await axios.get('http://localhost:3000/api/products', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    
    if (productsResponse.data?.data?.products) {
      const productsInCategory = productsResponse.data.data.products.filter(
        product => product.category_name === categoryName
      );
      
      // Delete each product in the category
      const deletePromises = productsInCategory.map(product => 
        axios.delete(`http://localhost:3000/api/products/${product.product_id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
      );
      
      await Promise.all(deletePromises);
      
      return { 
        success: true, 
        message: `All ${productsInCategory.length} products in category "${categoryName}" deleted successfully`,
        deletedCount: productsInCategory.length
      };
    }
    
    return { success: false, error: "No products found in category" };
  } catch (error) {
    console.error('Error deleting products by category:', error);
    return { success: false, error: error.message };
  }
};

const toast = {
  success: (message) => console.log(`✅ ${message}`),
  error: (message) => console.log(`❌ ${message}`)
};

const cn = (...classes) => classes.filter(Boolean).join(' ');

const ProductList = () => {
  const navigate = useNavigate();
  const [cursor, setCursor] = useState(0);
  const [limit] = useState(15);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
  (async () => {
    try {
      const response = await getProducts();
      const apiProducts = response.data.data.products || [];
      
      // Debug log to see the actual API response
      console.log('API Products Response:', apiProducts);
      if (apiProducts.length > 0) {
        console.log('Sample Product:', apiProducts[0]);
        console.log('Available fields:', Object.keys(apiProducts[0]));
        console.log('Stock fields:', {
          current_stock: apiProducts[0].current_stock,
          quantity: apiProducts[0].quantity,
          stock: apiProducts[0].stock,
          inventory_quantity: apiProducts[0].inventory_quantity
        });
      }
      
      // Find least stocked product per category
      const leastStockedByCategory = {};
      for (const product of apiProducts) {
        const cat = product.category_name;
        const currentStock = product.current_stock || product.quantity || 0;
        const existingStock = leastStockedByCategory[cat] ? 
          (leastStockedByCategory[cat].current_stock || leastStockedByCategory[cat].quantity || 0) : 
          Infinity;
        
        if (!leastStockedByCategory[cat] || currentStock < existingStock) {
          leastStockedByCategory[cat] = product;
        }
      }
      // Count products per category
      const categoryCounts = apiProducts.reduce((acc, item) => {
        const key = item?.category_name || "";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});

      const categoryImage = (name) => {
          switch (name) {
            case "Black Pepper":
              return "https://images.unsplash.com/photo-1591801058986-9e28e68670f7?q=80&w=1228&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
            case "Herbs":
              return "https://plus.unsplash.com/premium_photo-1693266635481-37de41003239?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
            case "Cinnamon":
              return "https://images.unsplash.com/photo-1601379758962-cadba22b1e3a?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
            case "Cardamom":
              return "https://images.unsplash.com/photo-1701190588800-67a7007492ad?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
            case "White Pepper":
              return "https://media.istockphoto.com/id/2159774748/photo/white-pepper-or-peppercorns-in-wooden-spoon-with-bowl.jpg?s=2048x2048&w=is&k=20&c=8E_80C-Xsj_iCRfzfJSwlTKUqmxrGKy5-puKqfc8glc=";
            case "Blends":
              return "https://media.istockphoto.com/id/2195466084/photo/curry-powder.jpg?s=2048x2048&w=is&k=20&c=BMSyanE-Q-2Sja8JrSeATaaEHW_R_V_4icRo0H0ioXs=";
            case "Spices":
              return "https://images.unsplash.com/photo-1532336414038-cf19250c5757?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
          }}


      // Group products by category and show one representative per category
      if (response.success && response.data && response.data.data && Array.isArray(response.data.data.products)) {
        const categoryGroups = {};
        
        // Group products by category
        apiProducts.forEach(product => {
          const categoryName = product.category_name;
          if (!categoryGroups[categoryName]) {
            categoryGroups[categoryName] = [];
          }
          categoryGroups[categoryName].push(product);
        });
        
        // Create one representative product per category
        const mapped = Object.keys(categoryGroups).map(categoryName => {
          const products = categoryGroups[categoryName];
          const representativeProduct = products[0]; // Use first product as representative
          
          return {
            id: `category_${categoryName}`,
            name: categoryName,
            main_image: categoryImage(categoryName),
            no_variants: products.length,
            variants: [],
            description: `${categoryName} category with ${products.length} products`,
            category_name: categoryName,
            product_count: products.length
          };
        });
        
        console.log('Mapped categories:', mapped);
        setAllProducts(mapped);
      } else {
        setAllProducts(mockSpiceProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      console.log('Using mock data as fallback');
      setAllProducts(mockSpiceProducts);
    }
  })();

  // (async () => {
  //   try {
  //     const response = await getAllProducts(cursor, limit);
  //     if (response.data && response.data.products) {
  //       // Map API products to frontend format
  //       const mapped = response.data.products.map(mapProductsToFrontend,categoryCounts);
  //       setProducts(mapped);
  //       setHasMore(false); // Set according to your pagination logic
  //     } else {
  //       setProducts(mockSpiceProducts.slice(0, limit));
  //       setHasMore(mockSpiceProducts.length > limit);
  //     }
  //   } catch (error) {
  //     setProducts(mockSpiceProducts.slice(0, limit));
  //     setHasMore(mockSpiceProducts.length > limit);
  //   }
  // })();
}, []);

  // const fetchProducts = async (cursor, limit) => {
  //   try {
  //     const response = await getAllProducts(cursor, limit);
  //     if (response.data && response.data.length > 0) {
  //       setProducts(response.data);
  //       setHasMore(response.nextCursor !== null);
  //     } else {
  //       const startIndex = cursor;
  //       const endIndex = cursor + limit;
  //       setProducts(mockSpiceProducts.slice(startIndex, endIndex));
  //       setHasMore(endIndex < mockSpiceProducts.length);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching products, using mock data:", error);
  //     const startIndex = cursor;
  //     const endIndex = cursor + limit;
  //     setProducts(mockSpiceProducts.slice(startIndex, endIndex));
  //     setHasMore(endIndex < mockSpiceProducts.length);
  //   }
  // };

  const handleRemoveProduct = async (categoryName) => {
  try {
    setIsLoading(true);
    // Use the new deleteProductsByCategory function
    const result = await deleteProductsByCategory(categoryName);
    if (result.success) {
      console.log(`All products in category "${categoryName}" deleted successfully`);
      toast.success(`${result.deletedCount} products deleted successfully`);
      
      // Refresh the products list after deletion
      const response = await getProducts();
      const apiProducts = response.data.data.products || [];
      
      // Rebuild the category-based product list
      const leastStockedByCategory = {};
      for (const product of apiProducts) {
        const cat = product.category_name;
        const currentStock = product.current_stock || product.quantity || 0;
        const existingStock = leastStockedByCategory[cat] ? 
          (leastStockedByCategory[cat].current_stock || leastStockedByCategory[cat].quantity || 0) : 
          Infinity;
        
        if (!leastStockedByCategory[cat] || currentStock < existingStock) {
          leastStockedByCategory[cat] = product;
        }
      }
      
      const categoryCounts = apiProducts.reduce((acc, item) => {
        const key = item?.category_name || "";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});
      
      // Rebuild category groups
      const categoryGroups = {};
      
      apiProducts.forEach(product => {
        const categoryName = product.category_name;
        if (!categoryGroups[categoryName]) {
          categoryGroups[categoryName] = [];
        }
        categoryGroups[categoryName].push(product);
      });
      
      const mapped = Object.keys(categoryGroups).map(categoryName => {
        const products = categoryGroups[categoryName];
        const representativeProduct = products[0];
        
        return {
          id: `category_${categoryName}`,
          name: categoryName,
          main_image: categoryImage(categoryName),
          no_variants: products.length,
          variants: [],
          description: `${categoryName} category with ${products.length} products`,
          category_name: categoryName,
          product_count: products.length
        };
      });
      
      setAllProducts(mapped);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    } else {
      console.log("Error deleting products");
      toast.error("Error deleting products: " + result.error);
    }
  } catch (error) {
    console.error("Error removing products: ", error);
    toast.error("Error removing products");
  } finally {
    setIsLoading(false);
  }
};

  const filteredProducts = (allProducts || []).filter((item) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(query) ||
      (item.variants || []).some((variant) =>
        variant.product_code.toLowerCase().includes(query)
      )
    );
  });

 
  const openDeleteDialog = (product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleViewProduct = async (category) => {
    try {
      setIsLoading(true);
      
      // Fetch all products in this category
      const response = await getProducts();
      const apiProducts = response.data.data.products || [];
      
      // Filter products by category
      const categoryProducts = apiProducts.filter(product => 
        product.category_name === category.category_name
      );
      
      console.log('Category products:', categoryProducts);
      
      // Navigate to a detail view with all products in this category
      // Navigate to existing route: /inventorymanager/product/:id
      // Use category name as the id segment since detail page relies on state
      navigate(`/inventorymanager/product/${encodeURIComponent(category.category_name)}`, { 
        state: {
          categoryName: category.category_name,
          products: categoryProducts,
          categoryImage: category.main_image
        } 
      });
    } catch (error) {
      console.error('Error fetching category products:', error);
      toast.error('Error loading category details');
    } finally {
      setIsLoading(false);
    }
  };


  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredProducts.map((product, index) => (
        <div key={index} className="bg-white rounded-2xl border border-gray-200 hover:border-orange-300 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
          <div className="aspect-square overflow-hidden">
            <img
              src={product.main_image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </div>
          
          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {product.product_count || product.no_variants} products
                </div>
              </div>
            </div>
            
            <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{product.name}</h3>
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
            
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <div className="flex items-center gap-1">
                <Scale className="w-4 h-4" />
                <span>{product.product_count || product.no_variants} products</span>
              </div>
              <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                Category
              </span>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => handleViewProduct(product)}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 text-white rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                View
              </button>
              <button
                onClick={() => openDeleteDialog(product)}
                className="px-4 py-2 text-red-600 border border-red-200 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const TableView = () => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Products Count
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredProducts.map((product, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm border border-gray-100">
                      <img
                        src={product.main_image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => handleViewProduct(product)}
                        className="text-blue-600 hover:text-blue-800 font-medium hover:underline text-left"
                      >
                        {product.name}
                      </button>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">{product.description}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-800">{product.product_count || product.no_variants}</span>
                    <span className="text-sm text-gray-500">products</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleViewProduct(product)}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 text-white rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View
                    </button>
                    <button
                      onClick={() => openDeleteDialog(product)}
                      className="px-4 py-2 text-red-600 border border-red-200 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2"
                      disabled={isLoading}
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="h-full w-full bg-gradient-to-br from-orange-50 via-white to-yellow-50 rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-400 text-white p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-white/10"></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <List className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">Product Categories</h2>
                <p className="text-white/80">Manage your product categories and inventory</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Search and Controls */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                <input
                  type="text"
                  placeholder="Search categories by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.location.reload()}
                  className="p-3 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 transition-colors duration-200"
                  title="Refresh Data"
                >
                  <Search className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={cn(
                    "p-3 rounded-lg transition-colors duration-200",
                    viewMode === 'table' 
                      ? "bg-white/30 text-white" 
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  )}
                >
                  <TableProperties className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "p-3 rounded-lg transition-colors duration-200",
                    viewMode === 'grid' 
                      ? "bg-white/30 text-white" 
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  )}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="h-[calc(100%-200px)] p-6 overflow-y-auto">
        {filteredProducts.length > 0 ? (
          <>
            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{filteredProducts.length}</p>
                    <p className="text-sm text-gray-600">Total Categories</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">
                      {filteredProducts.reduce((total, category) => total + (category.product_count || category.no_variants), 0)}
                    </p>
                    <p className="text-sm text-gray-600">Total Products</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Display */}
            {viewMode === 'table' ? <TableView /> : <GridView />}
          </>
        ) : (
          <div className="h-full flex items-center justify-center">
            {isLoading ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <FaSpinner className="w-8 h-8 text-white animate-spin" />
                </div>
                <p className="text-gray-600 font-medium">Loading categories...</p>
              </div>
            ) : (
              <div className="text-center">
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 font-medium">No categories found</p>
                <p className="text-sm text-gray-500 mt-2">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && productToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4">
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Confirm Category Deletion</h3>
                  <p className="text-white/80 text-sm">This action cannot be undone</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm border border-gray-100">
                  <img
                    src={productToDelete.main_image}
                    alt={productToDelete.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 mb-1">{productToDelete.name}</h4>
                  <p className="text-xs text-gray-500 mt-1">Products: {productToDelete.product_count || productToDelete.no_variants} items</p>
                </div>
              </div>
              
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this category? This will permanently remove all products in this category from your inventory.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => handleRemoveProduct(productToDelete.name)}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete Category
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setDeleteDialogOpen(false);
                    setProductToDelete(null);
                  }}
                  className="px-6 py-3 border border-gray-300 hover:bg-gray-50 rounded-xl font-semibold transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;