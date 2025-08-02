import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../../../context/cart/CartContext";
import { cn } from "../../../lib/utils";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Product = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const product = location.state || {};
  const { variants, ...productData } = product;
  // context data
  const { cart, addToCart } = useCart();
  // local state variables
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedItemCode, setSelectedItemCode] = useState("");
  const [selectedVariant, setSelectedVariant] = useState({});
  const [stock, setStock] = useState();
  const [itemCode, setItemCode] = useState();
  const [itemPrice, setItemPrice] = useState(0.00);
  const [itemUrl, setItemUrl] = useState();

  useEffect(() => {
    if (selectedItemCode === "") {
      setSelectedItemCode(variants[0].product_code);
      // setSelectedColor(variants[0].color);
      setStock(variants[0].quantity);
      setItemCode(variants[0].product_code);
      setItemPrice(variants[0].price);
      setSelectedVariant(variants[0]);
      setItemUrl(variants[0].image);
    } else {
      const selectedVariant = variants.find(
        (variant) => variant.product_code === selectedItemCode,
        // (variant) => variant.color === selectedColor,
      );
      setStock(selectedVariant.quantity);
      setItemCode(selectedVariant.product_code);
      setItemPrice(selectedVariant.price);
      setItemUrl(selectedVariant.image);
      setSelectedVariant(selectedVariant);
    }
  }, [selectedItemCode, variants]);

  const handleSelectColor = (code) => {
    // setSelectedColor(color);
    setSelectedItemCode(code);
  };

  // function: handle qty increment
  const handleIncrement = () => {
    setQuantity((prev) => prev + 1);
  };
  // function: handle qty decrement
  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  // function: handle item add to order
  const handleOrderItemAdd = () => {
    if (!selectedItemCode) {
      alert("Please select color variant.");
      return;
    }
    console.log("product data: ", productData);
    console.log("selected variant: ", selectedVariant);
    console.log("quantity: ", quantity);
    addToCart(productData, quantity, selectedVariant);
    console.log("cart: ", cart);
    // alert("Item added to order.");
    toast.success("Item added to order.");
  };

  const handleViewOrder = () => {
    console.log("init handle view order function");
    navigate("/order/add-items");
  };

  return (
    <div className="max-w-6xl mx-auto pt-32">
      {/* Breadcrumb Navigation */}
      {/* <div className="bg-black text-white p-2 text-sm">
        <span className="mx-4">Home &gt; Lipsticks &gt; Lipsticks Matte</span>
      </div> */}

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div>
            <div className="w-full border rounded-sm p-4">
              <img
                src={itemUrl}
                // src={product1}
                alt="item-image"
                // alt="Lipstick Matte"
                className="w-96 h-96 object-contain"
              />
            </div>
            {/* Color Selection */}
            <div className="space-y-3 pt-4">
              <p className="text-gray-600">SELECT VARIANT : {selectedItemCode}</p>
              <div className="grid grid-cols-6 gap-2">
                {/* {colors.map((color) => (
                  <button
                    key={color.code}
                    onClick={() => setSelectedColor(color.code)}
                    className={`w-12 h-12 border ${
                      selectedColor === color.code ? 'ring-2 ring-black' : ''
                    }`}
                  >
                    <span className="text-xs text-gray-500">{color.code}</span>
                  </button>
                ))} */}
                {product.variants.map((variant, index) => (
                  <button
                    key={index}
                    // onClick={() => setSelectedColor(variant.color)}
                    onClick={() => handleSelectColor(variant.product_code)}
                    // onClick={() => handleSelectColor(variant.color)}
                    className={cn(
                      "w-12 h-12 border rounded-full lg:rounded-lg",
                      selectedItemCode === variant.product_code
                        ? "ring-2 ring-black"
                        : "",
                    )}
                    style={{ backgroundColor: variant.color }}
                  >
                    <span className="text-xs text-black">{variant.product_code}</span>
                    {/*<span className="text-xs text-gray-500">*/}
                    {/*  {variant.color}*/}
                    {/*</span>*/}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="flex flex-col items-center lg:items-start space-y-4">
            <h1 className="text-base lg:text-2xl font-bold">{product.name}</h1>
            <p className="text-sm lg:text-xl">Rs. {itemPrice}</p>

            <div className="text-sm lg:text-base space-y-2">
              <p className="text-gray-600">
                Availability :{" "}
                <span className="text-black font-medium">{stock} in stock</span>
              </p>
              <p className="text-gray-600">
                Item Code :{" "}
                <span className="text-black font-medium">{itemCode}</span>
              </p>
            </div>

            <p className="text-sm text-center lg:text-left leading-relaxed text-gray-700">
              Classic face blush that adds healthy colour to one&apos;s face.
              Rich formula allows smooth application and buildable colour. The
              unique Freedom System allows you to mix and match products and
              colours to make your own custom designed palette of almost any
              size. All Freedom System palettes are eco friendly and reusable.
              Products may be purchased with the palettes or individually.
            </p>
            <p className="text-sm text-gray-600">4.5 g/0.16 US OZ</p>

            {/* Quantity Selector and Buttons */}
            <div className="flex flex-col lg:flex-row items-center space-x-4">
              <div className="flex items-center border border-gray-300">
                <button
                  onClick={handleDecrement}
                  className="px-4 py-1 text-lg bg-gray-100 hover:bg-gray-200"
                >
                  -
                </button>
                <input
                  type="text"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value) || 1)}
                  className="w-12 text-center border-x border-gray-300 focus:outline-none"
                />
                <button
                  onClick={handleIncrement}
                  className="px-4 py-1 text-lg bg-gray-100 hover:bg-gray-200"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleOrderItemAdd}
                className="mt-4 lg:mt-0 px-8 py-2 bg-black text-white hover:bg-gray-800"
              >
                ADD TO ORDER
              </button>
            </div>

            <button
              onClick={handleViewOrder}
              className="w-40 py-2 bg-gray-200 text-black hover:bg-gray-300"
            >
              VIEW ORDER
            </button>
          </div>
        </div>
      </div>
      <ToastContainer autoClose={2000} />
    </div>
  );
};

export default Product;
