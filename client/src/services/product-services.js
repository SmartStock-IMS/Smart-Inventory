import api from "@lib/api.js";

export const getAllProducts = async (cursor, limit) => {
  try {
    const response = await api.get(
      `/products/get-all?cursor=${cursor}&limit=${limit}`,
    );

    if (response.status === 200) {
      return {
        success: true,
        data: response.data.products,
        nextCursor: response.data.nextCursor,
      };
    } else {
      return { success: false, error: response.statusText };
    }
  } catch (error) {
    return {
      success: false,
      message: error,
    };
  }
};

export const getProducts = async () => {
  try {
    const response = await api.get(`/products/get-all`);

    if (response.status === 200) {
      return {
        success: true,
        data: response.data.products,
        nextCursor: response.data.nextCursor,
      };
    } else {
      return { success: false, error: response.statusText };
    }
  } catch (error) {
    return {
      success: false,
      message: error,
    };
  }
};

export const getProductVariants = async () => {
  try {
    const response = await api.get(`/products/get-variants`);

    if (response.status === 200) {
      return {
        success: true,
        data: response.data.variants,
      };
    } else {
      return { success: false, error: response.statusText };
    }
  } catch (error) {
    return {
      success: false,
      message: error,
    };
  }
};

export const getProduct = async (id) => {
  try {
    const response = await api.get(`/products/get/${id}`);

    if (response.status === 200) {
      return {
        success: true,
        data: response.data.product,
      };
    } else {
      return { success: false, error: response.statusText };
    }
  } catch (error) {
    return {
      success: false,
      message: error,
    };
  }
};

export const uploadImage = async (formData) => {
  try {
    const response = await api.post(`/products/upload-image`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.status === 200) {
      console.log("img-url: ", response.data.imageUrl);
      return {
        success: true,
        data: response.data.imageUrl,
      };
    } else {
      return { success: false, error: response.statusText };
    }
  } catch (error) {
    return {
      success: false,
      message: error,
    };
  }
};

export const removeImage = async (publicId) => {
  try {
    const response = await api.delete(
      `/products/delete-file?public_id=${publicId}`,
    );

    if (response.status === 200) {
      return {
        success: true,
        data: response.data,
      };
    } else {
      return { success: false, error: response.statusText };
    }
  } catch (error) {
    return {
      success: false,
      message: error,
    };
  }
};

export const addProduct = async (productData) => {
  try {
    const response = await api.post("/products/add", productData);

    // handle success (201 Created or 200 OK)
    if (response.status === 201 || response.status === 200) {
      return {
        success: true,
        data: response.data || "Product added successfully", // fallback message
      };
    } else {
      // handle unexpected status codes
      return {
        success: false,
        error: response.statusText || "Unexpected error occurred",
        status: response.status, // include status code for debugging
      };
    }
  } catch (error) {
    // handle network errors, 500 errors, etc.
    if (error.response) {
      // the request was made, but the server responded with an error (e.g., 500, 400)
      return {
        success: false,
        message: error.response.data?.message || "Server error occurred",
        status: error.response.status, // include status code for debugging
      };
    } else if (error.request) {
      // the request was made, but no response was received (e.g., network error)
      return {
        success: false,
        message: "No response received from the server",
      };
    } else {
      // something happened in setting up the request (e.g., invalid request config)
      return {
        success: false,
        message: error.message || "An unexpected error occurred",
      };
    }
  }
};

export const deleteProduct = async (productId) => {
  try {
    const response = await api.delete(`/products/delete/${productId}`);

    // handle success (201 Created or 200 OK)
    if (response.status === 201 || response.status === 200) {
      return {
        success: true,
        data: response.data,
      };
    } else {
      // handle unexpected status codes
      return {
        success: false,
        error: response.statusText || "Unexpected error occurred",
        status: response.status, // include status code for debugging
      };
    }
  } catch (error) {
    // handle network errors, 500 errors, etc.
    if (error.response) {
      // the request was made, but the server responded with an error (e.g., 500, 400)
      return {
        success: false,
        message: error.response.data?.message || "Server error occurred",
        status: error.response.status, // include status code for debugging
      };
    } else if (error.request) {
      // the request was made, but no response was received (e.g., network error)
      return {
        success: false,
        message: "No response received from the server",
      };
    } else {
      // something happened in setting up the request (e.g., invalid request config)
      return {
        success: false,
        message: error.message || "An unexpected error occurred",
      };
    }
  }
};

export const updateProduct = async (productId, productData) => {
  try {
    const response = await api.put(`/products/update/${productId}`, productData);
    if (response.status === 201) {
      console.log("Product updated: ", response);
      return {
        success: true,
        data: response.data,
      };
    } else {
      return { success: false, error: response.statusText };
    }
  } catch (error) {
    return {
      success: false,
      error: error,
    };
  }
};

export const updateProductQuantity = async (updateData) => {
  try {
    const response = await api.put("/products/update-quantity", updateData);
    if (response.status === 201) {
      console.log("Product updated: ", response);
      return {
        success: true,
        data: response.data,
      };
    } else {
      return { success: false, error: response.statusText };
    }
  } catch (error) {
    return {
      success: false,
      error: error,
    };
  }
};

export const deleteVariant = async (productId, variantId) => {
  try {
    const response = await api.delete(`/products/delete-variant/${productId}?variant_id=${variantId}`);

    // handle success
    if (response.status === 200) {
      return {
        success: true,
        data: response.data,
      };
    } else {
      // handle unexpected status codes
      return {
        success: false,
        error: response.statusText || "Unexpected error occurred",
        status: response.status, // include status code for debugging
      };
    }
  } catch (error) {
    // handle network errors, 500 errors, etc.
    if (error.response) {
      // the request was made, but the server responded with an error (e.g., 500, 400)
      return {
        success: false,
        message: error.response.data?.message || "Server error occurred",
        status: error.response.status, // include status code for debugging
      };
    } else if (error.request) {
      // the request was made, but no response was received (e.g., network error)
      return {
        success: false,
        message: "No response received from the server",
      };
    } else {
      // something happened in setting up the request (e.g., invalid request config)
      return {
        success: false,
        message: error.message || "An unexpected error occurred",
      };
    }
  }
};
