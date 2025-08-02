import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import Invoice from "./Invoice";

const ViewQuotation = () => {
  const navigate = useNavigate();

  const [tempCart, setTempCart] = useState({
    items: [],
    selectedItems: [
      {
        id: 1,
        category: "APPLICATORS",
        name: "COSMETIC APPLICATOR",
        main_image:
          "https://res.cloudinary.com/dbdbn416o/image/upload/v1739968044/logo_cnekfn.png",
        no_variants: 1,
        createdAt: "2025-02-02T00:00:00.000Z",
        updatedAt: "2025-02-02T00:00:00.000Z",
        variants: [
          {
            id: 1,
            product_id: 1,
            product_code: "CA",
            color: "#",
            price: "0.00",
            image: null,
            quantity: 50,
            min_qty: 10,
            mfd_date: "2025-01-01T00:00:00.000Z",
            exp_date: "2099-12-31T00:00:00.000Z",
            createdAt: "2025-02-02T00:00:00.000Z",
            updatedAt: "2025-02-02T00:00:00.000Z",
          },
        ],
        product_id: 1,
        product_code: "CA",
        color: "#",
        price: "0.00",
        image: null,
        quantity: 50,
        min_qty: 10,
        mfd_date: "2025-01-01T00:00:00.000Z",
        exp_date: "2099-12-31T00:00:00.000Z",
      },
      {
        id: 3,
        category: "BLUSH",
        name: "INGLOT CREAM BLUSH",
        main_image:
          "https://res.cloudinary.com/dbdbn416o/image/upload/v1739968044/logo_cnekfn.png",
        no_variants: 1,
        createdAt: "2025-02-02T00:00:00.000Z",
        updatedAt: "2025-02-02T00:00:00.000Z",
        variants: [
          {
            id: 3,
            product_id: 3,
            product_code: "ICB98",
            color: "#000",
            price: "0.00",
            image: null,
            quantity: 50,
            min_qty: 10,
            mfd_date: "2025-01-01T00:00:00.000Z",
            exp_date: "2099-12-31T00:00:00.000Z",
            createdAt: "2025-02-02T00:00:00.000Z",
            updatedAt: "2025-02-02T00:00:00.000Z",
          },
          {
            id: 4,
            product_id: 3,
            product_code: "ICBL98",
            color: "#000",
            price: "0.00",
            image: null,
            quantity: 50,
            min_qty: 10,
            mfd_date: "2025-01-01T00:00:00.000Z",
            exp_date: "2099-12-31T00:00:00.000Z",
            createdAt: "2025-02-02T00:00:00.000Z",
            updatedAt: "2025-02-02T00:00:00.000Z",
          },
          {
            id: 5,
            product_id: 3,
            product_code: "ICBL99",
            color: "#000",
            price: "0.00",
            image: null,
            quantity: 50,
            min_qty: 10,
            mfd_date: "2025-01-01T00:00:00.000Z",
            exp_date: "2099-12-31T00:00:00.000Z",
            createdAt: "2025-02-02T00:00:00.000Z",
            updatedAt: "2025-02-02T00:00:00.000Z",
          },
        ],
        product_id: 3,
        product_code: "ICB98",
        color: "#000",
        price: "0.00",
        image: null,
        quantity: 50,
        min_qty: 10,
        mfd_date: "2025-01-01T00:00:00.000Z",
        exp_date: "2099-12-31T00:00:00.000Z",
      },
    ],
    discount: 0,
    subtotal: 0,
    total: 0,
  });

  const handleDuplicateQuotation = async () => {};

  const handleStartCreateOeder = async () => {};

  const handleEditQuotation = async () => {};

  return (
    <div className="bg-red flex flex-col items-center py-8 pt-32">
      <div className="max-w-7xl ">
        {/* <h1 className="text-3xl md:text-5xl font-medium text-center text-black mb-6">
          View Quotation
        </h1> */}
        <div className="grid grid-cols-1 mt-6">
          <div className="col-span-1">
            <div className="flex flex-row gap-3">
              <button
                onClick={handleStartCreateOeder}
                className="bg-yellow-400 text-black px-6 py-2 rounded-lg hover:bg-yellow-300 hover:text-gray-2 transition-colors font-medium"
              >
                Start Creating an Order
              </button>
              <button
                onClick={handleDuplicateQuotation}
                className="bg-yellow-400 text-black px-6 py-2 rounded-lg hover:bg-yellow-300 hover:text-gray-2 transition-colors font-medium"
              >
                Make Duplicate
              </button>
              <button
                onClick={handleEditQuotation}
                className="bg-yellow-400 text-black px-6 py-2 rounded-lg hover:bg-yellow-300 hover:text-gray-2 transition-colors font-medium"
              >
                Edit
              </button>
            </div>
            <Invoice
              cartState={tempCart}
              billingDetails={{
                id: 1,
                type: "001",
                email: "sales@test.com",
                iat: 1740363273,
                exp: 1740384873,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewQuotation;
