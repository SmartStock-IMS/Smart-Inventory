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
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(
        (item) => item.code === selectedVariant.product_code,
      );

      console.log("existing item: ", existingItemIndex);

      if (existingItemIndex > -1) {
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += quantity;
        console.log("updated cart: ", updatedCart);
        return updatedCart;
      } else {
        return [
          ...prevCart,
          {
            id: product.id,
            name: product.name,
            category: product.category,
            price: selectedVariant.price,
            code: selectedVariant.product_code,
            color: selectedVariant.color || selectedVariant.weight || 'N/A', // Handle spices which have weight instead of color
            url: product.main_image,
            discount: selectedVariant.discount || 0,
            quantity: quantity,
            weight: selectedVariant.weight, // Add weight for spices
            variantDetails: selectedVariant, // Store full variant details
          },
        ];
      }
    });
  };

  const addMultipleToCart = (product, variantQuantityMap) => {
    setCart(prevCart => {
      let updatedCart = [...prevCart];
      
      for (const [variantCode, quantity] of variantQuantityMap.entries()) {
        const variant = variantCode;
        const existingItemIndex = updatedCart.findIndex(
          (item) => item.code === variant.product_code,
        );

        if (existingItemIndex > -1) {
          updatedCart[existingItemIndex].quantity += quantity;
        } else {
          updatedCart.push({
            id: product.id,
            name: product.name,
            category: product.category,
            price: variant.price,
            code: variant.product_code,
            color: variant.color || variant.weight || 'N/A',
            url: product.main_image,
            discount: variant.discount || 0,
            quantity: quantity,
            weight: variant.weight,
            variantDetails: variant,
          });
        }
      }
      
      console.log("Multiple items added to cart: ", updatedCart);
      return updatedCart;
    });
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
    setCart([]);
    setCustomer({});
    setCartState(null);
    localStorage.removeItem('cart');
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartState,
        addToCart,
        addMultipleToCart,
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
