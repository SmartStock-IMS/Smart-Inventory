import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { useCart } from "../../context/cart/CartContext";
import { cn } from "@lib/utils";
import { ToastContainer, toast } from "react-toastify";
import { getAllProducts } from "../../services/product-services.js";

const AddItems = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, setCartState } = useCart(); // get cart data from context
  // local-variables
  const [items, setItems] = useState(cart);
  const [cartSelectedItems, setCartSelectedItems] = useState(cart);
  const [discount, setDiscount] = useState("");
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    const _selectedItems = items.filter((item) => selectedItems.has(item.code));
    setCartSelectedItems(_selectedItems);
  }, [items, selectedItems]);

  // getAllProducts
  // useEffect(() => {
  //   //TODO: add pagination
  //   const handleGetAllProducts = async () => {
  //     const response = await getAllProducts();
  //     if (response.success) {
  //       console.log("getAllProducts: ", response.data);
  //       // setItems(response.data);
  //
  //       console.log("productsVarientList loop: ");
  //       const productsVarientList = [];
  //       for (const product of response.data) {
  //         for (const variant of product.variants) {
  //           productsVarientList.push({
  //             ...product,
  //             ...variant,
  //           });
  //         }
  //       }
  //       console.log(productsVarientList);
  //       setItems(productsVarientList);
  //     } else {
  //       // toast.error("Error loading products");
  //     }
  //   };
  //   console.log("==== getAllProducts ==");
  //   handleGetAllProducts();
  // }, []);

  const toggleItemSelection = (id) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
    setIsAllSelected(newSelected.size === items.length);
  };

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map((item) => item.code)));
    }
    setIsAllSelected(!isAllSelected);
  };

  const deleteSelected = () => {
    const selectedItem = items.find((item) => selectedItems.has(item.code));
    removeFromCart(selectedItem.code);
    const newItems = items.filter((item) => !selectedItems.has(item.code));
    setItems(newItems);
    setSelectedItems(new Set());
    setIsAllSelected(false);

    // const newItems = items.filter(item => !selectedItems.has(item.product_code));
    // setItems(newItems);
    // setSelectedItems(new Set());
    // setIsAllSelected(false);
    // localStorage.setItem('selectedCartItems', JSON.stringify([]));
  };

  const updateQuantity = (id, increment) => {
    setItems(
      items.map((item) =>
        item.code === id
          ? {
              ...item,
              quantity: Math.max(1, item.quantity + increment),
            }
          : item,
      ),
    );
  };

  const calculateSubtotal = () => {
    return cartSelectedItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    const discountPercent = parseFloat(discount) || 0;
    return Math.round((subtotal * discountPercent) / 100);
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount();
  };

  const handleApplyDiscount = () => {
    const discountValue = parseFloat(discount);
    if (isNaN(discountValue) || discountValue < 0 || discountValue > 100) {
      alert("Please enter a valid discount percentage between 0 and 100");
      setDiscount("");
      return;
    }
    localStorage.setItem("cartDiscount", discount);
  };

  const handleCheckout = () => {
    const cartState = {
      items: items,
      selectedItems: cartSelectedItems,
      discount: discount,
      subtotal: calculateSubtotal(),
      total: calculateTotal(),
    };
    console.log("cart state: ", cartState);
    setCartState(cartState);
    // localStorage.setItem("cartState", JSON.stringify(cartState));
    navigate("/order/billing-details");
  };

  // Mobile Summary Toggle Button
  const SummaryToggle = () => (
    <button
      onClick={() => setShowSummary(!showSummary)}
      className="fixed bottom-4 right-4 lg:hidden z-50 bg-black text-white p-4 rounded-full shadow-lg"
    >
      <Menu className="w-6 h-6" />
    </button>
  );

  return (
    <div className="w-full mx-auto p-4 flex flex-col lg:flex-row gap-6">
      {/* Cart Items Section */}
      <div className="flex-grow">
        {/* section: select-all */}
        <div className="flex items-center justify-between mb-4 p-3 bg-gray-100 rounded-lg shadow-sm">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="font-medium">SELECT ALL</span>
          </label>
          <button
            onClick={deleteSelected}
            disabled={selectedItems.size === 0}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors
              ${
                selectedItems.size === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-red-500 text-white hover:bg-red-600"
              }`}
          >
            <span>🗑️</span>
            <span className="hidden sm:inline">DELETE</span>
          </button>
        </div>

        {/* Mobile/Tablet Cart Items */}
        <div className="lg:hidden space-y-4">
          {items.map((item, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-start space-x-4">
                <input
                  type="checkbox"
                  checked={selectedItems.has(item.code)}
                  onChange={() => toggleItemSelection(item.code)}
                  className="w-4 h-4 mt-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <img
                  src={item.url}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
                />
                <div className="flex-grow">
                  <h3 className="font-medium">{item.name}</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-4 h-4 rounded-full border-2 border-gray-200`}
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm text-gray-500">
                        {item.color}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600"># {item.code}</p>
                    <p className="font-medium">Rs.{item.price}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => updateQuantity(item.code, -1)}
                    className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-medium">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.code, 1)}
                    className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Cart Items */}
        <div className="hidden lg:block bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-600">
                <th className="p-4">SELECT</th>
                <th className="p-4">PRODUCT</th>
                <th className="p-4">COLOUR</th>
                <th className="p-4">ITEM CODE</th>
                <th className="p-4">PRICE</th>
                <th className="p-4">QUANTITY</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} className="border-t hover:bg-gray-50">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.code)}
                      onChange={() => toggleItemSelection(item.code)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.url}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <span className="font-medium">{item.name}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <div
                        className={`w-6 h-6 rounded-full border-2 border-gray-200`}
                        style={{ backgroundColor: item.color }}
                      ></div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{item.code}</td>
                  <td className="p-4 font-medium">Rs.{item.price}</td>
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => updateQuantity(item.code, -1)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.code, 1)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Summary Section */}
      <div
        className={`
        fixed inset-x-0 bottom-0 lg:static
        ${showSummary ? "translate-y-0" : "translate-y-full"} 
        lg:translate-y-0 transform transition-transform duration-300 ease-in-out
        bg-white lg:w-80 shadow-lg lg:shadow-md p-6 rounded-t-2xl lg:rounded-lg
      `}
      >
        <h2 className="text-xl font-bold mb-6">Order Summary</h2>

        <div className="space-y-6">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span className="font-medium">
              Rs.{calculateSubtotal().toLocaleString()}
            </span>
          </div>

          <div className="space-y-2">
            <input
              type="text"
              placeholder="Enter Discount %"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-yellow-400 focus:border-yellow-400"
            />
            {/*<button*/}
            {/*  onClick={handleApplyDiscount}*/}
            {/*  className="w-full bg-yellow-400 text-white py-3 rounded-lg hover:bg-yellow-500 transition-colors"*/}
            {/*>*/}
            {/*  Apply Discount*/}
            {/*</button>*/}
          </div>

          <div className="flex justify-between text-gray-600">
            <span>Discount</span>
            <span className="font-medium">
              Rs.{calculateDiscount().toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>Rs.{calculateTotal().toLocaleString()}</span>
          </div>

          <button
            className={cn(
              "w-full py-3 rounded-lg transition-colors font-medium",
              selectedItems.size === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-black text-white hover:bg-gray-800",
            )}
            onClick={handleCheckout}
            disabled={selectedItems.size === 0}
          >
            PROCEED TO CHECKOUT
          </button>
        </div>
      </div>

      <SummaryToggle />
      <ToastContainer autoClose={3000} />
    </div>
  );
};

export default AddItems;
