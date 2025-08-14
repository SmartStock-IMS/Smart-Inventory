import PropTypes from "prop-types";
import { InputWithLabel } from "@components/ui/InputWithLabel.jsx";

const VariantCard = ({ product }) => {
  return (
    <>
      <div className="w-full mt-2 p-4 flex flex-row gap-4 border rounded-lg bg-white">
        <div className="w-fit">
          <img
            src={product.image}
            alt={product.product_id}
            className="w-28 h-28 p-2 object-contain rounded-lg border shadow-lg"
          />
        </div>
        <div className="p-2 flex flex-grow flex-col gap-y-4">
          <div className="w-full flex flex-row items-center gap-4">
            <InputWithLabel
              label={"Product Code"}
              inputType={"text"}
              inputId={"productCode"}
              inputName={"product_code"}
              value={product.product_code}
              readOnly={true}
              className={"pointer-events-none"}
            />
            <InputWithLabel
              label={"Product Color"}
              inputType={"text"}
              inputId={"productColor"}
              inputName={"product_color"}
              value={product.color}
              readOnly={true}
              className={"pointer-events-none"}
            />
            <InputWithLabel
              label={"Unit Price"}
              inputType={"text"}
              inputId={"productPrice"}
              inputName={"product_price"}
              value={product.price}
              readOnly={true}
              className={"pointer-events-none"}
            />
          </div>
          <div className="w-full flex flex-row items-center gap-4">
            <InputWithLabel
              label={"Total Quantity"}
              inputType={"number"}
              inputId={"productQuantity"}
              inputName={"product_quantity"}
              value={product.quantity}
              readOnly={true}
              className={"pointer-events-none"}
            />
            <InputWithLabel
              label={"Minimum Quantity"}
              inputType={"text"}
              inputId={"productMinQuantity"}
              inputName={"product_min_quantity"}
              value={product.min_qty}
              readOnly={true}
              className={"pointer-events-none"}
            />
          </div>
          <div className="w-full flex flex-row items-center gap-4">
            <InputWithLabel
              label={"Manufacturer Date"}
              inputType={"text"}
              inputId={"mfdDate"}
              inputName={"mfd_date"}
              value={product.mfd_date}
              readOnly={true}
              className={"pointer-events-none"}
            />
            <InputWithLabel
              label={"Expiration Date"}
              inputType={"text"}
              inputId={"expDate"}
              inputName={"exp_date"}
              value={product.exp_date}
              readOnly={true}
              className={"pointer-events-none"}
            />
          </div>
        </div>
      </div>
    </>
  );
};

VariantCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.number,
    product_id: PropTypes.string,
    product_code: PropTypes.string,
    color: PropTypes.string,
    image: PropTypes.string,
    price: PropTypes.string,
    quantity: PropTypes.number,
    min_qty: PropTypes.number,
    mfd_date: PropTypes.string,
    exp_date: PropTypes.string,
  }),
};

export default VariantCard;
