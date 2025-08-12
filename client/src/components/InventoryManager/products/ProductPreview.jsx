import point_icon from "../../../assets/images/InventoryManager/products/point.png";
import ImageGallery from "./ImageGallery";

const ProductPreview = ({ productDetails, image, isEditing }) => {
  const getImageURLs = (files) =>
    files.map((file) =>
      file instanceof File ? URL.createObjectURL(file) : file
    );
  return (
    <div className="relative flex flex-col items-start justify-center gap-8">
      <div className="relative product-preview p-6 flex flex-col gap-6 items-start h-max w-full">
        <div className="w-full mr-6">
          {isEditing &&
          productDetails.image &&
          productDetails.image.length > 0 ? (
            <ImageGallery images={productDetails.image} />
          ) : image.length > 0 ? (
            <ImageGallery images={getImageURLs(image)} />
          ) : (
            <div className="w-80 h-80 mx-auto bg-gray-200 flex items-center justify-center text-gray-500 rounded-lg">
              No Image Selected
            </div>
          )}
        </div>
        <div className="product-details w-full flex flex-col">
          <div className="flex items-center gap-8 w-full mb-2">
            <h2 className="font-base text-xl">
              {productDetails.name || "Product Name"}
            </h2>
          </div>
          <div className="flex items-center mt-auto gap-4">
              <span className="text-base font-semibold text-green-600">
                {productDetails.new_price
                  ? `$${productDetails.new_price}`
                  : "Offer Price"}
              </span>
              {productDetails.old_price && (
                <span className="text-sm line-through text-gray-500">
                  ${productDetails.old_price}
                </span>
              )}
            </div>
          <p className="text-gray-700 mb-4 text-base overflow-wrap break-words">
            {productDetails.description.formatted_text || "Product Description"}
          </p>
          {productDetails.description.bullet_points &&
            productDetails.description.bullet_points.length > 0 && (
              <ul className={`pl-6 text-gray-700 mb-4`}>
                {productDetails.description.bullet_points.map(
                  (point, index) => (
                    <li key={index} className="mb-1 text-sm flex items-center gap-2">
                        <img src={point_icon} alt="point" className="w-3 h-3" />
                      {point}
                    </li>
                  )
                )}
              </ul>
            )}
          <p className="text-gray-700 mb-4 text-sm overflow-wrap break-words">
            {productDetails.description.plain_text || "Additional Information"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductPreview;
