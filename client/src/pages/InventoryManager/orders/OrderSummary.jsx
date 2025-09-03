import { useEffect, useState } from "react";
import { BookOpenCheck, Search, Filter, Eye, Calendar, Hash, User, Users, DollarSign, Package, Activity, Sparkles, ChevronDown, RefreshCw, TrendingUp, Clock, CheckCircle, AlertCircle } from "lucide-react";
import OrderDetails from "@components/InventoryManager/orders/OrderDetails";
import { getAllSalesReps } from "@services/salesrep-service";

// Mock sales reps data (same as RMList.jsx) for consistency
const mockSalesReps = [
  {
    emp_code: "EMP001",
    sales_area: "Mumbai Central",
    commission_rate: 5.5,
    target_amount: 500000,
    achievements: 420000,
    join_date: "2022-01-15",
    status: "Active",
    users: {
      name: "Arjun Singh",
      email: "arjun.singh@company.com",
      phone: "+91 98765 43210"
    }
  },
  {
    emp_code: "EMP002",
    sales_area: "Delhi North",
    commission_rate: 6.0,
    target_amount: 450000,
    achievements: 465000,
    join_date: "2021-08-20",
    status: "Active",
    users: {
      name: "Sneha Patel",
      email: "sneha.patel@company.com",
      phone: "+91 87654 32109"
    }
  },
  {
    emp_code: "EMP003",
    sales_area: "Bangalore East",
    commission_rate: 5.8,
    target_amount: 600000,
    achievements: 580000,
    join_date: "2020-12-10",
    status: "Active",
    users: {
      name: "Rajesh Kumar",
      email: "rajesh.kumar@company.com",
      phone: "+91 76543 21098"
    }
  },
  {
    emp_code: "EMP004",
    sales_area: "Chennai South",
    commission_rate: 5.2,
    target_amount: 400000,
    achievements: 380000,
    join_date: "2022-03-05",
    status: "Active",
    users: {
      name: "Priya Sharma",
      email: "priya.sharma@company.com",
      phone: "+91 65432 10987"
    }
  },
  {
    emp_code: "EMP005",
    sales_area: "Pune West",
    commission_rate: 6.2,
    target_amount: 550000,
    achievements: 610000,
    join_date: "2019-11-18",
    status: "Active",
    users: {
      name: "Vikram Gupta",
      email: "vikram.gupta@company.com",
      phone: "+91 54321 09876"
    }
  },
  {
    emp_code: "EMP006",
    sales_area: "Hyderabad Central",
    commission_rate: 5.7,
    target_amount: 480000,
    achievements: 445000,
    join_date: "2021-06-12",
    status: "Active",
    users: {
      name: "Kavita Joshi",
      email: "kavita.joshi@company.com",
      phone: "+91 43210 98765"
    }
  },
  {
    emp_code: "EMP007",
    sales_area: "Kolkata East",
    commission_rate: 5.5,
    target_amount: 420000,
    achievements: 390000,
    join_date: "2022-07-08",
    status: "Active",
    users: {
      name: "Amit Roy",
      email: "amit.roy@company.com",
      phone: "+91 32109 87654"
    }
  },
  {
    emp_code: "EMP008",
    sales_area: "Ahmedabad West",
    commission_rate: 6.1,
    target_amount: 520000,
    achievements: 540000,
    join_date: "2020-09-25",
    status: "Active",
    users: {
      name: "Meera Shah",
      email: "meera.shah@company.com",
      phone: "+91 21098 76543"
    }
  },
  {
    emp_code: "EMP009",
    sales_area: "Jaipur Central",
    commission_rate: 5.3,
    target_amount: 380000,
    achievements: 365000,
    join_date: "2023-01-20",
    status: "Active",
    users: {
      name: "Rohit Agarwal",
      email: "rohit.agarwal@company.com",
      phone: "+91 10987 65432"
    }
  },
  {
    emp_code: "EMP010",
    sales_area: "Lucknow North",
    commission_rate: 5.9,
    target_amount: 460000,
    achievements: 475000,
    join_date: "2021-04-15",
    status: "Active",
    users: {
      name: "Sonal Verma",
      email: "sonal.verma@company.com",
      phone: "+91 09876 54321"
    }
  },
  {
    emp_code: "EMP011",
    sales_area: "Coimbatore South",
    commission_rate: 5.4,
    target_amount: 350000,
    achievements: 340000,
    join_date: "2022-10-12",
    status: "Active",
    users: {
      name: "Karthik Raman",
      email: "karthik.raman@company.com",
      phone: "+91 87659 43210"
    }
  },
  {
    emp_code: "EMP012",
    sales_area: "Indore Central",
    commission_rate: 5.6,
    target_amount: 410000,
    achievements: 425000,
    join_date: "2020-05-30",
    status: "Active",
    users: {
      name: "Neha Malhotra",
      email: "neha.malhotra@company.com",
      phone: "+91 76549 32108"
    }
  }
];

// Mock service function for demo
const getQuotations = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Generate mock data with realistic quotation items and variant details
  const mockQuotations = [
    {
      id: 1,
      quotation_id: "QT-2024-001",
      customer_id: "CUST-001",
      sales_rep_id: "REP-001",
      quotation_date: "2024-08-10",
      quotation_due_date: "2024-08-20",
      net_total: 125000,
      sub_total: 135000,
      discount: 7.4,
      no_items: 5,
      status: "Pending",
      payment_term: "Cash",
      company: "Trollius",
      quotationItems: [
        {
          id: 1,
          quotation_id: "QT-2024-001",
          item_code: "TR-LIP-001-RED",
          description: "Trollius Matte Lipstick - Ruby Red",
          item_qty: 2,
          unit_price: 1500,
          total_amount: 3000,
          variant_details: {
            color: "Ruby Red",
            weight: "3.5g",
            category: "Lipstick",
            batch_no: "B2024-001",
            exp_date: "2025-12-31",
            image_url: "/products/lipstick-red.jpg"
          }
        },
        {
          id: 2,
          quotation_id: "QT-2024-001",
          item_code: "TR-FOUND-002-FAIR",
          description: "Trollius Liquid Foundation - Fair Tone",
          item_qty: 1,
          unit_price: 2800,
          total_amount: 2800,
          variant_details: {
            color: "Fair Tone",
            weight: "30ml",
            category: "Foundation",
            batch_no: "B2024-002",
            exp_date: "2025-11-30",
            image_url: "/products/foundation-fair.jpg"
          }
        },
        {
          id: 3,
          quotation_id: "QT-2024-001",
          item_code: "TR-MASCARA-001-BLK",
          description: "Trollius Waterproof Mascara - Jet Black",
          item_qty: 2,
          unit_price: 1200,
          total_amount: 2400,
          variant_details: {
            color: "Jet Black",
            weight: "8ml",
            category: "Mascara",
            batch_no: "B2024-003",
            exp_date: "2026-01-15",
            image_url: "/products/mascara-black.jpg"
          }
        }
      ]
    },
    {
      id: 2,
      quotation_id: "QT-2024-002",
      customer_id: "CUST-002",
      sales_rep_id: "REP-002",
      quotation_date: "2024-08-09",
      quotation_due_date: "2024-08-19",
      net_total: 89750,
      sub_total: 95000,
      discount: 5.5,
      no_items: 3,
      status: "In Progress",
      payment_term: "Credit",
      company: "Mehera",
      quotationItems: [
        {
          id: 4,
          quotation_id: "QT-2024-002",
          item_code: "MH-CREAM-001-GLOW",
          description: "Mehera Glow Face Cream - Anti-Aging",
          item_qty: 1,
          unit_price: 3500,
          total_amount: 3500,
          variant_details: {
            color: "Natural",
            weight: "50g",
            category: "Face Cream",
            batch_no: "B2024-004",
            exp_date: "2025-10-30",
            image_url: "/products/face-cream.jpg"
          }
        },
        {
          id: 5,
          quotation_id: "QT-2024-002",
          item_code: "MH-SERUM-002-VIT",
          description: "Mehera Vitamin C Serum - Brightening",
          item_qty: 2,
          unit_price: 2750,
          total_amount: 5500,
          variant_details: {
            color: "Clear",
            weight: "20ml",
            category: "Serum",
            batch_no: "B2024-005",
            exp_date: "2025-09-15",
            image_url: "/products/vitamin-c-serum.jpg"
          }
        }
      ]
    },
    {
      id: 3,
      quotation_id: "QT-2024-003",
      customer_id: "CUST-003",
      sales_rep_id: "REP-001",
      quotation_date: "2024-08-08",
      quotation_due_date: "2024-08-18",
      net_total: 247500,
      sub_total: 275000,
      discount: 10,
      no_items: 8,
      status: "Approved",
      payment_term: "30 Days",
      company: "Trollius",
      quotationItems: [
        {
          id: 6,
          quotation_id: "QT-2024-003",
          item_code: "TR-PALETTE-001-WARM",
          description: "Trollius Eyeshadow Palette - Warm Tones",
          item_qty: 1,
          unit_price: 4500,
          total_amount: 4500,
          variant_details: {
            color: "Warm Tones",
            weight: "15g",
            category: "Eyeshadow",
            batch_no: "B2024-006",
            exp_date: "2026-02-28",
            image_url: "/products/eyeshadow-warm.jpg"
          }
        },
        {
          id: 7,
          quotation_id: "QT-2024-003",
          item_code: "TR-BLUSH-001-PINK",
          description: "Trollius Powder Blush - Rose Pink",
          item_qty: 3,
          unit_price: 1800,
          total_amount: 5400,
          variant_details: {
            color: "Rose Pink",
            weight: "6g",
            category: "Blush",
            batch_no: "B2024-007",
            exp_date: "2025-12-15",
            image_url: "/products/blush-pink.jpg"
          }
        },
        {
          id: 8,
          quotation_id: "QT-2024-003",
          item_code: "TR-LINER-001-BRN",
          description: "Trollius Eye Liner - Coffee Brown",
          item_qty: 4,
          unit_price: 980,
          total_amount: 3920,
          variant_details: {
            color: "Coffee Brown",
            weight: "1.2g",
            category: "Eye Liner",
            batch_no: "B2024-008",
            exp_date: "2025-08-30",
            image_url: "/products/eyeliner-brown.jpg"
          }
        }
      ]
    },
    {
      id: 4,
      quotation_id: "QT-2024-004",
      customer_id: "CUST-004",
      sales_rep_id: "REP-003",
      quotation_date: "2024-08-07",
      quotation_due_date: "2024-08-17",
      net_total: 156890,
      sub_total: 168000,
      discount: 6.6,
      no_items: 6,
      status: "Approved",
      payment_term: "45 Days",
      company: "Trollius",
      quotationItems: [
        {
          id: 9,
          quotation_id: "QT-2024-004",
          item_code: "TR-PRIMER-001-MATTE",
          description: "Trollius Face Primer - Matte Finish",
          item_qty: 2,
          unit_price: 2200,
          total_amount: 4400,
          variant_details: {
            color: "Clear",
            weight: "25ml",
            category: "Primer",
            batch_no: "B2024-009",
            exp_date: "2025-11-20",
            image_url: "/products/primer-matte.jpg"
          }
        },
        {
          id: 10,
          quotation_id: "QT-2024-004",
          item_code: "TR-CONCEALER-002-MED",
          description: "Trollius Liquid Concealer - Medium Shade",
          item_qty: 2,
          unit_price: 1650,
          total_amount: 3300,
          variant_details: {
            color: "Medium",
            weight: "12ml",
            category: "Concealer",
            batch_no: "B2024-010",
            exp_date: "2025-10-10",
            image_url: "/products/concealer-medium.jpg"
          }
        },
        {
          id: 11,
          quotation_id: "QT-2024-004",
          item_code: "TR-POWDER-001-TRANS",
          description: "Trollius Setting Powder - Translucent",
          item_qty: 2,
          unit_price: 1900,
          total_amount: 3800,
          variant_details: {
            color: "Translucent",
            weight: "20g",
            category: "Setting Powder",
            batch_no: "B2024-011",
            exp_date: "2026-01-05",
            image_url: "/products/setting-powder.jpg"
          }
        }
      ]
    },
    {
      id: 5,
      quotation_id: "QT-2024-005",
      customer_id: "CUST-005",
      sales_rep_id: "REP-002",
      quotation_date: "2024-08-06",
      quotation_due_date: "2024-08-16",
      net_total: 98450,
      sub_total: 105000,
      discount: 6.2,
      no_items: 4,
      status: "Completed",
      payment_term: "Cash",
      company: "Mehera",
      quotationItems: [
        {
          id: 12,
          quotation_id: "QT-2024-005",
          item_code: "MH-CLEANSER-001-FOAM",
          description: "Mehera Foaming Face Cleanser - Gentle Formula",
          item_qty: 2,
          unit_price: 1850,
          total_amount: 3700,
          variant_details: {
            color: "White",
            weight: "150ml",
            category: "Cleanser",
            batch_no: "B2024-012",
            exp_date: "2025-12-25",
            image_url: "/products/cleanser-foam.jpg"
          }
        },
        {
          id: 13,
          quotation_id: "QT-2024-005",
          item_code: "MH-TONER-002-ROSE",
          description: "Mehera Rose Water Toner - Hydrating",
          item_qty: 2,
          unit_price: 1675,
          total_amount: 3350,
          variant_details: {
            color: "Pink",
            weight: "200ml",
            category: "Toner",
            batch_no: "B2024-013",
            exp_date: "2025-11-11",
            image_url: "/products/rose-toner.jpg"
          }
        }
      ]
    }
  ];
  
  return { success: true, data: { data: mockQuotations } };
};

const OrderSummary = () => {
  const [quotations, setQuotations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedResourceManager, setSelectedResourceManager] = useState("");
  const [showResourceManagerModal, setShowResourceManagerModal] = useState(false);
  const [orderToPass, setOrderToPass] = useState(null);
  const [rmSearchQuery, setRmSearchQuery] = useState("");
  const [lockedResourceManager, setLockedResourceManager] = useState("");
  const [assignedOrders, setAssignedOrders] = useState(new Set());
  const [orderResourceManagers, setOrderResourceManagers] = useState(new Map());
  const [resourceManagers, setResourceManagers] = useState([]);

  useEffect(() => {
    fetchQuotations().then((data) => {
      if (data && Array.isArray(data)) {
        setQuotations(data);
      }
    });

    // Fetch resource managers
    fetchResourceManagers();
  }, []);

  // Auto-assign approved orders when both quotations and resource managers are loaded
  useEffect(() => {
    if (quotations.length > 0 && resourceManagers.length > 0) {
      const approvedOrders = quotations.filter(q => q.status === "Approved");
      const existingAssigned = JSON.parse(localStorage.getItem("assignedOrders") || "[]");
      
      // Only auto-assign if no orders are already assigned
      if (approvedOrders.length > 0 && existingAssigned.length === 0) {
        const firstRM = resourceManagers[0];
        const ordersToPass = approvedOrders.map(q => ({
          id: q.quotation_id,
          quotation_id: q.quotation_id,
          customer: q.customer_id,
          customerName: q.customer_id,
          status: q.status,
          date: q.quotation_date,
          quotation_date: q.quotation_date,
          net_total: q.net_total,
          no_items: q.no_items,
          assignedTo: firstRM.id,
          assignedResourceManager: {
            id: firstRM.id,
            name: firstRM.name,
            assignedAt: new Date().toISOString()
          },
          assignedAt: new Date().toISOString(),
          items: q.quotationItems?.map(item => ({
            name: item.description,
            description: item.description,
            qty: item.item_qty,
            item_qty: item.item_qty,
            unit_price: item.unit_price,
            total_amount: item.total_amount,
            item_code: item.item_code,
            variant_details: item.variant_details
          })) || []
        }));
        
        localStorage.setItem("assignedOrders", JSON.stringify(ordersToPass));
        console.log(`Auto-assigned ${ordersToPass.length} approved orders to ${firstRM.name} (${firstRM.id})`);
        
        // Dispatch custom event to notify ResourceOrders page
        window.dispatchEvent(new CustomEvent('orderAssigned', {
          detail: {
            count: ordersToPass.length,
            resourceManager: firstRM.name,
            type: 'auto-assignment',
            assignedAt: new Date().toISOString()
          }
        }));
        
        // Update the assigned orders state
        const assignedIds = new Set(ordersToPass.map(order => order.quotation_id));
        setAssignedOrders(assignedIds);
        
        // Update the resource manager mapping
        const rmMap = new Map();
        ordersToPass.forEach(order => {
          rmMap.set(order.quotation_id, order.assignedResourceManager);
        });
        setOrderResourceManagers(rmMap);
      }
    }
  }, [quotations, resourceManagers]);

  // Restore Resource Manager assignments from localStorage
  useEffect(() => {
    const storedOrders = JSON.parse(localStorage.getItem("assignedOrders") || "[]");
    if (storedOrders.length > 0) {
      const restoredAssignments = new Set();
      const restoredRMMap = new Map();
      
      storedOrders.forEach(order => {
        if (order.assignedResourceManager) {
          restoredAssignments.add(order.quotation_id);
          restoredRMMap.set(order.quotation_id, order.assignedResourceManager);
        }
      });
      
      setAssignedOrders(restoredAssignments);
      setOrderResourceManagers(restoredRMMap);
    }
  }, [quotations]);

  // Listen for order completion updates from Resource Manager
  useEffect(() => {
    const handleOrderCompletion = () => {
      console.log("Order completion detected, refreshing UI...");
      // Force a re-render to update button states
      setAssignedOrders(new Set(assignedOrders));
    };

    // Listen for storage changes (when RM completes orders)
    const handleStorageChange = (event) => {
      if (event.key === 'assignedOrders') {
        handleOrderCompletion();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [assignedOrders]);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const response = await getQuotations();
      if (response.success) {
        console.log("qt: ", response.data.data);
        return response.data.data || [];
      } else {
        console.error("Error fetching quotations");
        return [];
      }
    } catch (error) {
      console.error(error);
      return [];
    } finally {
      setLoading(false);
    }
  }

  const fetchResourceManagers = async () => {
    try {
      // Use mock data directly for frontend UI testing since backend isn't connected
      await new Promise(resolve => setTimeout(resolve, 200)); // Simulate loading time
      
      console.log("Loading resource managers from mock data");
      
      // Transform the sales rep data to resource manager format
      const transformedRMs = mockSalesReps.map(rep => ({
        id: rep.emp_code, // Use emp_code as ID (e.g., "EMP001")
        name: rep.users?.name || 'N/A',
        area: rep.sales_area || 'N/A'
      }));
      
      setResourceManagers(transformedRMs);
      
      // Uncomment below when backend is ready:
      /*
      const result = await getAllSalesReps();
      if (result.success && result.data) {
        const transformedRMs = result.data.map(rep => ({
          id: rep.emp_code,
          name: rep.users?.name || 'N/A',
          area: rep.sales_area || 'N/A'
        }));
        setResourceManagers(transformedRMs);
      } else {
        console.error("Failed to fetch resource managers:", result.message);
        setResourceManagers(transformedRMs);
      }
      */
    } catch (error) {
      console.error("Error loading resource managers:", error);
      // Fallback to mock data
      const transformedRMs = mockSalesReps.map(rep => ({
        id: rep.emp_code,
        name: rep.users?.name || 'N/A',
        area: rep.sales_area || 'N/A'
      }));
      setResourceManagers(transformedRMs);
    }
  }

  const handleOrderView = (orderItem) => {
    console.log("Order view: ", orderItem);
    
    // Add resource manager information to the order if it's assigned
    const rmInfo = orderResourceManagers.get(orderItem.quotation_id);
    const orderWithRM = {
      ...orderItem,
      assignedResourceManager: rmInfo || null
    };
    
    setIsOpen(true);
    setSelectedItem(orderWithRM);
  };

  const statusOptions = ["All", ...new Set((quotations || []).map((item) => item.status))];

  const filteredQuotations = (quotations || []).filter((item) => {
    const matchesSearch = searchQuery
      ? item.quotation_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.customer_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sales_rep_id.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesStatus = statusFilter === "All" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleRefresh = () => {
    setIsOpen(false);
    fetchQuotations().then((data) => {
      if (data && Array.isArray(data)) {
        setQuotations(data);
      }
    });
  }

  // Function to check if an order is completed by Resource Manager
  const isOrderCompletedByRM = (quotationId) => {
    try {
      const assignedOrders = JSON.parse(localStorage.getItem("assignedOrders") || "[]");
      const order = assignedOrders.find(o => o.quotation_id === quotationId);
      return order && order.status === "Complete";
    } catch (error) {
      console.error("Error checking order completion status:", error);
      return false;
    }
  };

  // Function to get completion statistics
  const getCompletionStats = () => {
    try {
      const assignedOrders = JSON.parse(localStorage.getItem("assignedOrders") || "[]");
      const totalAssigned = assignedOrders.length;
      const completedOrders = assignedOrders.filter(o => o.status === "Complete").length;
      const pendingOrders = totalAssigned - completedOrders;
      
      return {
        totalAssigned,
        completedOrders,
        pendingOrders,
        completionRate: totalAssigned > 0 ? Math.round((completedOrders / totalAssigned) * 100) : 0
      };
    } catch (error) {
      console.error("Error calculating completion stats:", error);
      return { totalAssigned: 0, completedOrders: 0, pendingOrders: 0, completionRate: 0 };
    }
  };

  // Function to pass orders to Resource Manager
  const passOrdersToResourceManager = () => {
    try {
      // Transform quotations to match ResourceOrders expected format
      const ordersToPass = quotations.map(q => ({
        id: q.quotation_id,
        quotation_id: q.quotation_id,
        customer: q.customer_id,
        customerName: q.customer_id,
        status: q.status,
        date: q.quotation_date,
        quotation_date: q.quotation_date,
        net_total: q.net_total,
        no_items: q.no_items,
        items: q.quotationItems?.map(item => ({
          name: item.description,
          description: item.description,
          qty: item.item_qty,
          item_qty: item.item_qty,
          unit_price: item.unit_price,
          total_amount: item.total_amount,
          item_code: item.item_code,
          variant_details: item.variant_details
        })) || []
      }));

      localStorage.setItem("assignedOrders", JSON.stringify(ordersToPass));
      alert(`Successfully passed ${ordersToPass.length} orders to Resource Manager!`);
    } catch (error) {
      console.error("Error passing orders to Resource Manager:", error);
      alert("Error passing orders to Resource Manager");
    }
  }

  // Filter resource managers based on search query
  const filteredResourceManagers = resourceManagers.filter((rm) => {
    if (!rmSearchQuery) return true;
    const query = rmSearchQuery.toLowerCase();
    return (
      rm.name.toLowerCase().includes(query) ||
      rm.id.toLowerCase().includes(query) ||
      rm.area.toLowerCase().includes(query)
    );
  });

  // Function to initiate passing a single order
  const initiatePassOrder = (order) => {
    if (lockedResourceManager) {
      // If resource manager is locked, directly assign
      assignOrderToLockedManager(order);
    } else {
      // Show modal to select resource manager
      setOrderToPass(order);
      setShowResourceManagerModal(true);
    }
  };

  // Function to assign order to locked resource manager
  const assignOrderToLockedManager = (order) => {
    try {
      const lockedRM = resourceManagers.find(rm => rm.id === lockedResourceManager);
      
      const orderData = {
        id: order.quotation_id,
        quotation_id: order.quotation_id,
        customer: order.customer_id,
        customerName: order.customer_id,
        status: order.status,
        date: order.quotation_date,
        quotation_date: order.quotation_date,
        net_total: order.net_total,
        no_items: order.no_items,
        assignedTo: lockedResourceManager,
        assignedResourceManager: {
          id: lockedResourceManager,
          name: lockedRM.name,
          assignedAt: new Date().toISOString()
        },
        assignedAt: new Date().toISOString(),
        items: order.quotationItems?.map(item => ({
          name: item.description,
          description: item.description,
          qty: item.item_qty,
          item_qty: item.item_qty,
          unit_price: item.unit_price,
          total_amount: item.total_amount,
          item_code: item.item_code,
          variant_details: item.variant_details
        })) || []
      };

      const existingOrders = JSON.parse(localStorage.getItem("assignedOrders") || "[]");
      // Remove any existing order with the same quotation_id to prevent duplicates
      const filteredOrders = existingOrders.filter(o => o.quotation_id !== orderData.quotation_id);
      const updatedOrders = [...filteredOrders, orderData];
      localStorage.setItem("assignedOrders", JSON.stringify(updatedOrders));
      
      alert(`Successfully assigned Order ${order.quotation_id} to ${lockedRM.name}!`);
      
      // Dispatch custom event to notify ResourceOrders page
      window.dispatchEvent(new CustomEvent('orderAssigned', {
        detail: {
          orderId: order.quotation_id,
          resourceManager: lockedRM.name,
          type: 'locked-assignment',
          assignedAt: new Date().toISOString()
        }
      }));
      
      // Add the order to assigned orders set
      setAssignedOrders(prev => new Set([...prev, order.quotation_id]));
      
      // Store the resource manager info for this order
      const assignedRM = resourceManagers.find(rm => rm.id === lockedResourceManager);
      setOrderResourceManagers(prev => new Map(prev.set(order.quotation_id, {
        id: lockedResourceManager,
        name: assignedRM.name,
        assignedAt: new Date().toISOString()
      })));
    } catch (error) {
      console.error("Error assigning order:", error);
      alert("Error assigning order");
    }
  };

  // Function to change resource manager for a specific order
  const changeResourceManager = (order) => {
    setOrderToPass(order);
    setShowResourceManagerModal(true);
  };
  const confirmPassOrder = () => {
    if (!selectedResourceManager || !orderToPass) {
      alert("Please select a Resource Manager");
      return;
    }

    try {
      // Get selected Resource Manager details
      const chosenRM = resourceManagers.find(rm => rm.id === selectedResourceManager);
      
      // Transform single order to match ResourceOrders expected format
      const orderData = {
        id: orderToPass.quotation_id,
        quotation_id: orderToPass.quotation_id,
        customer: orderToPass.customer_id,
        customerName: orderToPass.customer_id,
        status: orderToPass.status,
        date: orderToPass.quotation_date,
        quotation_date: orderToPass.quotation_date,
        net_total: orderToPass.net_total,
        no_items: orderToPass.no_items,
        assignedTo: selectedResourceManager,
        assignedResourceManager: {
          id: selectedResourceManager,
          name: chosenRM.name,
          assignedAt: new Date().toISOString()
        },
        assignedAt: new Date().toISOString(),
        items: orderToPass.quotationItems?.map(item => ({
          name: item.description,
          description: item.description,
          qty: item.item_qty,
          item_qty: item.item_qty,
          unit_price: item.unit_price,
          total_amount: item.total_amount,
          item_code: item.item_code,
          variant_details: item.variant_details
        })) || []
      };

      // Get existing assigned orders or create empty array
      const existingOrders = JSON.parse(localStorage.getItem("assignedOrders") || "[]");
      
      // Remove any existing order with the same quotation_id to prevent duplicates
      const filteredOrders = existingOrders.filter(o => o.quotation_id !== orderData.quotation_id);
      const updatedOrders = [...filteredOrders, orderData];
      
      localStorage.setItem("assignedOrders", JSON.stringify(updatedOrders));
      
      alert(`Successfully passed Order ${orderToPass.quotation_id} to ${chosenRM.name}!`);
      
      // Dispatch custom event to notify ResourceOrders page
      window.dispatchEvent(new CustomEvent('orderAssigned', {
        detail: {
          orderId: orderToPass.quotation_id,
          resourceManager: chosenRM.name,
          assignedAt: new Date().toISOString()
        }
      }));
      
      // Add the order to assigned orders set
      setAssignedOrders(prev => new Set([...prev, orderToPass.quotation_id]));
      
      // Store the resource manager info for this order
      setOrderResourceManagers(prev => new Map(prev.set(orderToPass.quotation_id, {
        id: selectedResourceManager,
        name: chosenRM.name,
        assignedAt: new Date().toISOString()
      })));
      
      // Lock the selected resource manager for future assignments
      setLockedResourceManager(selectedResourceManager);
      
      // Reset states
      setShowResourceManagerModal(false);
      setSelectedResourceManager("");
      setOrderToPass(null);
      setRmSearchQuery("");
    } catch (error) {
      console.error("Error passing order to Resource Manager:", error);
      alert("Error passing order to Resource Manager");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'Rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Completed': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const LoadingSpinner = () => (
    <div className="h-full w-full flex flex-col items-center justify-center gap-6 py-12">
      <div className="relative">
        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
          <RefreshCw size={32} color="white" className="animate-spin" />
        </div>
        <div className="absolute inset-0 w-20 h-20 border-4 border-blue-200 rounded-full animate-ping opacity-75"></div>
      </div>
      <div className="flex items-center gap-3 text-gray-600">
        <span className="text-xl font-medium">Loading orders data</span>
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-0"></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-150"></div>
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce delay-300"></div>
        </div>
      </div>
    </div>
  );

  // Hardcoded summary statistics
  const summaryStats = {
    totalOrders: 5,
    totalRevenue: 717590,
    totalItems: 26,
    averageOrderValue: 143518,
    pendingOrders: 1,
    approvedOrders: 1,
    inProgressOrders: 1,
    completedOrders: 1,
    rejectedOrders: 1,
    totalCustomers: 5,
    totalVariants: 13,
    monthlyGrowth: 15.8,
    dailyOrders: 1.2,
    topProduct: "Trollius Matte Lipstick"
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
      {isOpen ? (
        <div className="h-full overflow-y-auto bg-gradient-to-br from-gray-50 to-white p-6">
          <OrderDetails item={selectedItem} changeOpen={() => handleRefresh()} />
        </div>
      ) : (
        <div className="h-full flex flex-col">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-400 text-white p-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0 bg-white/10"></div>
            </div>
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <BookOpenCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">Order Summary</h2>
                <p className="text-white/80">Track and manage all orders</p>
              </div>
              <div className="ml-auto">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="flex-1 p-6 flex flex-col gap-6">
              {/* Summary Statistics Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Orders */}
                <div className="bg-white rounded-2xl p-6 border-2 border-blue-500 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Orders</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{summaryStats.totalOrders}</p>
                      <div className="flex items-center mt-2">
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-600 font-medium">+{summaryStats.monthlyGrowth}%</span>
                        <span className="text-sm text-gray-500 ml-1">vs last month</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                      <BookOpenCheck className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                {/* Total Revenue */}
                <div className="bg-white rounded-2xl p-6 border-2 border-blue-500 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">Rs. {summaryStats.totalRevenue.toLocaleString()}</p>
                      <div className="flex items-center mt-2">
                        <DollarSign className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-600 font-medium">Avg: Rs. {summaryStats.averageOrderValue.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                {/* Total Items */}
                <div className="bg-white rounded-2xl p-6 border-2 border-blue-500 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Items Ordered</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{summaryStats.totalItems}</p>
                      <div className="flex items-center mt-2">
                        <Package className="w-4 h-4 text-blue-500 mr-1" />
                        <span className="text-sm text-blue-600 font-medium">{summaryStats.totalVariants} Variants</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                {/* Active Customers */}
                <div className="bg-white rounded-2xl p-6 border-2 border-blue-500 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Customers</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{summaryStats.totalCustomers}</p>
                      <div className="flex items-center mt-2">
                        <Clock className="w-4 h-4 text-blue-500 mr-1" />
                        <span className="text-sm text-blue-600 font-medium">{summaryStats.dailyOrders}/day avg</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Status Overview */}
              <div className="bg-white rounded-2xl border-2 border-blue-400 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Order Status Overview</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Activity className="w-4 h-4" />
                    Real-time data
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">Pending</p>
                        <p className="text-2xl font-bold text-yellow-900">{summaryStats.pendingOrders}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-800">Approved</p>
                        <p className="text-2xl font-bold text-green-900">{summaryStats.approvedOrders}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">In Progress</p>
                        <p className="text-2xl font-bold text-blue-900">{summaryStats.inProgressOrders}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="text-sm font-medium text-purple-800">Completed</p>
                        <p className="text-2xl font-bold text-purple-900">{summaryStats.completedOrders}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <div>
                        <p className="text-sm font-medium text-red-800">Rejected</p>
                        <p className="text-2xl font-bold text-red-900">{summaryStats.rejectedOrders}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters Section */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  {/* Status Filter */}
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      Filter by Status
                    </label>
                    <div className="relative">
                      <select
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none bg-white shadow-sm"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Search Input */}
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      Search Orders
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                        placeholder="Search by Order ID, Customer ID, or Sales Rep..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Orders Table */}
              <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-blue-500" />
                      Orders List ({filteredQuotations.length} results)
                    </h3>
                    <div className="text-sm text-gray-600">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Only approved orders can be assigned
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <CheckCircle className="w-3 h-3 text-purple-600" />
                          Completed orders cannot be reassigned
                        </div>
                        {(() => {
                          const stats = getCompletionStats();
                          if (stats.totalAssigned > 0) {
                            return (
                              <div className="flex items-center gap-2 text-xs mt-1 text-blue-600">
                                <Activity className="w-3 h-3" />
                                {stats.completedOrders}/{stats.totalAssigned} assigned orders completed ({stats.completionRate}%)
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Order Date
                          </div>
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <Hash className="w-4 h-4" />
                            Order ID
                          </div>
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Customer ID
                          </div>
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Sales Rep ID
                          </div>
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            Total Amount
                          </div>
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            No of Products
                          </div>
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Assigned RM
                          </div>
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredQuotations.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-200">
                          <td className="px-4 py-4 text-sm text-gray-900">
                            {new Date(item.quotation_date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-4 text-sm font-medium text-gray-900">
                            {item.quotation_id}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500">
                            {item.customer_id}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500">
                            {item.sales_rep_id}
                          </td>
                          <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                            Rs. {item.net_total.toLocaleString()}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500 text-center">
                            {item.no_items}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-600">
                            {assignedOrders.has(item.quotation_id) ? (
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <span className="font-medium text-gray-900">
                                    {orderResourceManagers.get(item.quotation_id)?.name || 'Assigned'}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500">
                                  {orderResourceManagers.get(item.quotation_id)?.id || 'N/A'} • {orderResourceManagers.get(item.quotation_id)?.assignedAt ? 
                                    new Date(orderResourceManagers.get(item.quotation_id).assignedAt).toLocaleDateString('en-US', { 
                                      month: 'short', 
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    }) : 'Recently'
                                  }
                                </div>
                                {isOrderCompletedByRM(item.quotation_id) && (
                                  <div className="flex items-center gap-1 text-xs">
                                    <CheckCircle className="w-3 h-3 text-green-600" />
                                    <span className="text-green-600 font-medium">Completed</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-gray-400">
                                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                <span className="text-sm">Not assigned</span>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleOrderView(item)}
                                className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                              >
                                <Eye className="w-4 h-4" />
                                View
                              </button>
                              {item.status === "Approved" ? (
                                assignedOrders.has(item.quotation_id) ? (
                                  // Check if order is completed by Resource Manager
                                  isOrderCompletedByRM(item.quotation_id) ? (
                                    <button
                                      disabled
                                      className="inline-flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 text-sm font-medium rounded-lg cursor-default border border-green-200"
                                      title="Order completed by Resource Manager"
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                      Completed
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => changeResourceManager(item)}
                                      className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                                    >
                                      <User className="w-4 h-4" />
                                      Change RM
                                    </button>
                                  )
                                ) : (
                                  <button
                                    onClick={() => initiatePassOrder(item)}
                                    className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                                  >
                                    <Package className="w-4 h-4" />
                                    Assign
                                  </button>
                                )
                              ) : (
                                <button
                                  disabled
                                  className="inline-flex items-center gap-2 px-3 py-2 bg-gray-300 text-gray-500 text-sm font-medium rounded-lg cursor-not-allowed"
                                  title={`Only approved orders can be assigned. Current status: ${item.status}`}
                                >
                                  <Package className="w-4 h-4" />
                                  Assign
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredQuotations.length === 0 && (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpenCheck className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-gray-500 font-medium mb-2">No orders found</h3>
                    <p className="text-sm text-gray-400">Try adjusting your search criteria or filters</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Resource Manager Selection Modal */}
      {showResourceManagerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Select Resource Manager</h3>
                <p className="text-sm text-gray-600">Choose who will handle this order</p>
              </div>
            </div>

            {orderToPass && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700">Order: {orderToPass.quotation_id}</p>
                <p className="text-sm text-gray-600">Customer: {orderToPass.customer_id}</p>
                <p className="text-sm text-gray-600">Total: Rs. {orderToPass.net_total.toLocaleString()}</p>
              </div>
            )}

            {/* Search Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Resource Managers
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, ID, or area..."
                  value={rmSearchQuery}
                  onChange={(e) => setRmSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {rmSearchQuery && (
                  <button
                    onClick={() => setRmSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Resource Managers List with Scroll */}
            <div className="flex-1 overflow-hidden">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Resource Managers ({filteredResourceManagers.length})
              </label>
              
              {filteredResourceManagers.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                  {filteredResourceManagers.map((manager) => (
                    <label key={manager.id} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-blue-300 transition-all duration-200">
                      <input
                        type="radio"
                        name="resourceManager"
                        value={manager.id}
                        checked={selectedResourceManager === manager.id}
                        onChange={(e) => setSelectedResourceManager(e.target.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">{manager.name}</p>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                            {manager.id}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{manager.area}</p>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-600 font-medium">No resource managers found</p>
                  <p className="text-sm text-gray-500">Try adjusting your search criteria</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowResourceManagerModal(false);
                  setSelectedResourceManager("");
                  setOrderToPass(null);
                  setRmSearchQuery("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmPassOrder}
                disabled={!selectedResourceManager}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-lg font-medium transition-all duration-200 disabled:cursor-not-allowed"
              >
                Assign Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderSummary;