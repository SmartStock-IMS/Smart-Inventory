import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts } from "@services/product-services";
import { FaSpinner, FaSearch } from "react-icons/fa";

const Home = () => {
  const navigate = useNavigate();
  // init local-variables
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // fetch db-products
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const response = await getProducts();
        if (response.success) {
          setProducts(response.data);
        } else {
          console.error("Error fetching products: ", response.message);
        }
      } catch (error) {
        console.error("Error getting products.", error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const filteredProducts = filterProducts(products, searchTerm);
    const filteredCategoriesMap = filteredProducts.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = [];
      }
      acc[product.category].push(product);
      return acc;
    }, {});

    const filterCategories = Object.entries(filteredCategoriesMap).map(
      ([name, products]) => ({
        name,
        products,
      }),
    );

    const filteredCategories = selectedCategory
      ? filterCategories.filter(
        (category) => category.name === selectedCategory.value
      )
      : filterCategories;

    setFilteredCategories(filteredCategories);
  }, [products, searchTerm, selectedCategory]);

  const categoriesMap = products.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {});

  const categories = Object.entries(categoriesMap).map(([name, products]) => ({
    name,
    products,
  }));

  const filterProducts = (products, searchTerm) => {
    if (!searchTerm) return products;
    return products.filter((product) => {
      const nameMatch = product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const variantMatch = product.variants.some((variant) =>
        variant.product_code.toLowerCase().includes(searchTerm.toLowerCase())
      );

      return nameMatch || variantMatch;
    });
  };

  const handleCategoryChange = (selectedOption) => {
    if (selectedOption.value === "") {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(selectedOption);
    }
  };

  const handleProductSelect = (product) => {
    console.log("product selected:", product);
    navigate("/product", {
      state: product,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 pt-32">
      {/* section: search */}
      <div className="w-full mb-8 flex flex-col md:flex-row gap-4">
        {/* search: search box */}
        <div className="w-full md:w-2/3 relative text-sm lg:text-base">
          <input
            type="text"
            placeholder="Search Products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-yellow-500"
          />
          <span className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <FaSearch className="w-5 h-5 text-gray-400" />
          </span>
        </div>

        {/* search: select drop-down */}
        <div className="w-full md:w-1/3 px-2 bg-gray-100 rounded-lg text-sm lg:text-base border border-gray-200 focus:ring-1 focus:ring-yellow-500">
          <select
            value={selectedCategory?.value || ""}
            onChange={(e) =>
              handleCategoryChange(
                e.target.value
                  ? { value: e.target.value, label: e.target.value }
                  : { value: "", label: "All Categories" },
              )
            }
            className="w-full ps-3 pe-6 py-3 bg-gray-100 focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option className="" key={category.name} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* section: product list */}
      {isLoading ? (
        <div className="mt-3 flex flex-row items-center justify-center">
          <FaSpinner size={20} color="black" className="animate-spin" />
        </div>
      ) : (
        <div className="space-y-8">
          {filteredCategories.map((category) => {
            return (
              <div
                key={category.name}
                className="bg-white rounded-lg shadow-sm p-0 lg:p-4"
              >
                <h2 className="text-sm lg:text-base font-semibold bg-black text-white py-2 px-6 rounded-md mb-4">
                  {category.name}
                </h2>

                {category.products.length > 0 ? (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {category.products.map((product) => (
                        <div key={product.id} className="flex flex-col gap-2">
                          <button
                            onClick={() => handleProductSelect(product)}
                            // onClick={() => navigate(`/product/${product.name.replace(/\s+/g, "-")}`)}
                            className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200"
                          >
                            <img
                              src={product.main_image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </button>
                          <span className="text-sm text-gray-600 line-clamp-2">
                            {product.name}
                          </span>
                          <span className="text-sm font-semibold text-red-600">
                            Rs. {product.variants[0].price}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No products found
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Home;
