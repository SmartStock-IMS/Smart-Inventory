import product1 from "../assets/images/product/product-1.png";
import product2 from "../assets/images/product/product-2.png";
import product3 from "../assets/images/product/product-3.png";
import product4 from "../assets/images/product/product-4.png";
import product5 from "../assets/images/product/product-5.png";
// import product6 from "../assets/images/product/product-6.png";

// header section
export const navigation = [
  {
    id: "0",
    title: "Home",
    url: "/salesrep",
  },
  {
    id: "1",
    title: "Add customer",
    url: "/salesrep/addcustomer",
  },
  {
    id: "2",
    title: "Create Order",
    url: "/salesrep/order/add-items",
  },
  {
    id: "3",
    title: "History",
    url: "/salesrep/history",
  },
  {
    id: "4",
    title: "Logout",
    url: "/",
  },
];

// order section
export const topbarLinks = [
  {
    route: "/salesrep/order/add-items",
    label: "Add items",
  },
  {
    route: "/salesrep/order/billing-details",
    label: "Billing Details",
  },
  {
    route: "/salesrep/order/confirmation",
    label: "Confirmation",
  },
];

export const dummyCustomers = [
  {
    _id: "0",
    name: "John Doe",
    email: "example1@gmail.com",
    phone: "1234567890",
    address: "123, Lorem Ipsum, Dolor Sit",
  },
  {
    _id: "1",
    name: "Jane Doe",
    email: "example2@gmail.com",
    phone: "1234567890",
    address: "123, Lorem Ipsum, Dolor Sit",
  },
  {
    _id: "2",
    name: "John Smith",
    email: "example3@gmail.com",
    phone: "1234567890",
    address: "123, Lorem Ipsum, Dolor Sit",
  },
  {
    _id: "3",
    name: "Jane Smith",
    email: "example4@gmail.com",
    phone: "1234567890",
    address: "123, Lorem Ipsum, Dolor Sit",
  },
];

// product section
// TODO: remove dummy products (replaces by db data)
export const dummyProducts = [
  {
    _id: "0",
    name: "LIPSATIN LIPSTICK",
    category: "Lipstick",
    varients: [
      {
        code: 1,
        url: product1,
        color: "#d61377",
        colorCode: "72",
        price: 120,
        discount: 20,
      },
      {
        code: 2,
        url: product2,
        color: "#c1161f",
        colorCode: "80",
        price: 120,
        discount: 20,
      },
    ],
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, lacus nec lacinia ultrices, turpis neque rhoncus mauris, in pellentesque metus erat nec nisi. Sed nec nisl ut lacus t",
  },
  {
    _id: "1",
    name: "LIPSATIN LIPSTICK 2",
    category: "Lipstick",
    varients: [
      {
        code: 3,
        url: product2,
        color: "#d61377",
        colorCode: "72",
        price: 100,
        discount: 20,
      },
      {
        code: 4,
        url: product1,
        color: "#c1161f",
        colorCode: "80",
        price: 120,
        discount: 0,
      },
    ],
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, lacus nec lacinia ultrices, turpis neque rhoncus mauris, in pellentesque metus erat nec nisi. Sed nec nisl ut lacus t",
  },
  {
    _id: "2",
    name: "Cleancer",
    category: "Cleancer",
    varients: [
      {
        code: 5,
        url: product5,
        color: "#d61377",
        colorCode: "72",
        price: 100,
        discount: 20,
      },
      {
        code: 6,
        url: product5,
        color: "#c1161f",
        colorCode: "80",
        price: 120,
        discount: 0,
      },
    ],
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, lacus nec lacinia ultrices, turpis neque rhoncus mauris, in pellentesque metus erat nec nisi. Sed nec nisl ut lacus t",
  },
  {
    _id: "3",
    name: "MATTIFYING UNDER MAKEUP BASE",
    category: "Makeup Base",
    varients: [
      {
        code: 7,
        url: product3,
        color: "#d61377",
        colorCode: "72",
        price: 100,
        discount: 20,
      },
      {
        code: 8,
        url: product3,
        color: "#c1161f",
        colorCode: "80",
        price: 120,
        discount: 0,
      },
    ],
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, lacus nec lacinia ultrices, turpis neque rhoncus mauris, in pellentesque metus erat nec nisi. Sed nec nisl ut lacus t",
  },
  {
    _id: "4",
    name: "SMOOTHING UNDER MAKEUP BASE",
    category: "Makeup Base",
    varients: [
      {
        code: 9,
        url: product4,
        color: "#d61377",
        colorCode: "72",
        price: 100,
        discount: 20,
      },
      {
        code: 10,
        url: product4,
        color: "#c1161f",
        colorCode: "80",
        price: 120,
        discount: 0,
      },
    ],
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, lacus nec lacinia ultrices, turpis neque rhoncus mauris, in pellentesque metus erat nec nisi. Sed nec nisl ut lacus t",
  },
];
