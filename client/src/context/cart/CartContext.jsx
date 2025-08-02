import { createContext, useState, useContext, useEffect } from "react";
import PropTypes from "prop-types";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    // localStorage.removeItem('cart');
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [customer, setCustomer] = useState({});
  const [cartState, setCartState] = useState(null);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity, selectedVariant) => {
    const existingItemIndex = cart.findIndex(
      (item) => item.code === selectedVariant.product_code,
    );

    console.log("existing item: ", existingItemIndex);

    if (existingItemIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += quantity;
      console.log("updated cart: ", updatedCart);
      setCart(updatedCart);
    } else {
      setCart([
        ...cart,
        {
          id: product.id,
          name: product.name,
          category: product.category,
          price: selectedVariant.price,
          code: selectedVariant.product_code,
          color: selectedVariant.color,
          url: product.main_image,
          discount: selectedVariant.discount,
          quantity: quantity,
        },
      ]);
    }
  };

  const removeFromCart = (code) => {
    console.log("remove item code: ", code);
    setCart(cart.filter((item) => item.code !== code));
  };

  const updateQuantity = (code, newQuantity) => {
    const updatedCart = cart.map((item) =>
      item.code === code ? { ...item, quantity: newQuantity } : item,
    );
    setCart(updatedCart);
  };

  const clearCart = () => {
    localStorage.removeItem('cart');
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartState,
        addToCart,
        removeFromCart,
        updateQuantity,
        customer,
        setCustomer,
        setCartState,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Define prop types
CartProvider.propTypes = {
  children: PropTypes.node.isRequired, // Validate children prop
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
};
