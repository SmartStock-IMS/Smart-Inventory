const supplierModel = require('../models/supplierModel');

exports.getAllSuppliers = async (req, res) => {
	try {
		const limit = Number(req.query.limit ?? 1000); // Increased default limit for frontend
		const offset = Number(req.query.offset ?? 0);
		const isActive =
			req.query.is_active === undefined
				? null
				: req.query.is_active === 'true'
					? true
					: req.query.is_active === 'false'
						? false
						: null;

		const data = await supplierModel.getSuppliers(limit, offset, isActive);
		return res.status(200).json({
			success: true,
			data,
			pagination: { limit, offset, count: data.length }
		});
	} catch (error) {
		console.error('getAllSuppliers error:', error);
		return res.status(500).json({ success: false, message: 'Failed to fetch suppliers' });
	}
};

exports.getSupplierById = async (req, res) => {
	try {
		const { id } = req.params;
		console.log('getSupplierById called with ID:', id, 'Type:', typeof id);
		
		if (!id) {
			return res.status(400).json({ success: false, message: 'Supplier ID is required' });
		}

		// Validate UUID format (since database uses UUID)
		const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
		if (!uuidRegex.test(id)) {
			return res.status(400).json({ 
				success: false, 
				message: `Invalid supplier ID format. Expected UUID but received: ${id}` 
			});
		}

		const supplier = await supplierModel.getSupplierById(id);
		if (!supplier) {
			return res.status(404).json({ success: false, message: 'Supplier not found' });
		}

		return res.status(200).json({
			success: true,
			data: supplier
		});
	} catch (error) {
		console.error('getSupplierById error:', error);
		return res.status(500).json({ success: false, message: 'Failed to fetch supplier' });
	}
};

exports.createSupplier = async (req, res) => {
	try {
		// Handle JSON data like sales rep system, not multipart FormData
		const { name, contact_no, email, address } = req.body || {};
		
		// Validation
		if (!name || String(name).trim() === '') {
			return res.status(400).json({ success: false, message: 'Supplier name is required' });
		}

		// Email validation if provided
		if (email && email.trim() !== '') {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(email.trim())) {
				return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
			}
		}

		// Phone validation if provided
		if (contact_no && contact_no.trim() !== '') {
			const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
			if (!phoneRegex.test(contact_no.trim())) {
				return res.status(400).json({ success: false, message: 'Please enter a valid phone number' });
			}
		}

		const created = await supplierModel.createSupplier({
			name: String(name).trim(),
			contact_no: contact_no?.trim() || null,
			email: email?.trim() || null,
			address: address?.trim() || null
		});

		return res.status(201).json({
			success: true,
			message: 'Supplier created successfully',
			data: created
		});
	} catch (error) {
		console.error('createSupplier error:', error);
		return res.status(400).json({ success: false, message: error.message || 'Failed to create supplier' });
	}
};exports.updateSupplier = async (req, res) => {
	try {
		const { id } = req.params;
		const body = req.body || {};
		const { name, contact_no, email, address } = body;

		console.log('updateSupplier called with ID:', id, 'Type:', typeof id);

		if (!id) {
			return res.status(400).json({ success: false, message: 'Supplier ID is required' });
		}

		// Validate UUID format
		const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
		if (!uuidRegex.test(id)) {
			return res.status(400).json({ 
				success: false, 
				message: `Invalid supplier ID format. Expected UUID but received: ${id}` 
			});
		}

		if (!name || String(name).trim() === '') {
			return res.status(400).json({ success: false, message: 'Supplier name is required' });
		}

		// Email validation if provided
		if (email && email.trim() !== '') {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(email.trim())) {
				return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
			}
		}

		// Phone validation if provided
		if (contact_no && contact_no.trim() !== '') {
			const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
			if (!phoneRegex.test(contact_no.trim())) {
				return res.status(400).json({ success: false, message: 'Please enter a valid phone number' });
			}
		}

		const updated = await supplierModel.updateSupplier(id, {
			name: String(name).trim(),
			contact_no: contact_no?.trim() || null,
			email: email?.trim() || null,
			address: address?.trim() || null
		});

		return res.status(200).json({
			success: true,
			message: 'Supplier updated successfully',
			data: updated
		});
	} catch (error) {
		console.error('updateSupplier error:', error);
		return res.status(400).json({ success: false, message: error.message || 'Failed to update supplier' });
	}
};exports.deleteSupplier = async (req, res) => {
	try {
		const { id } = req.params;
		console.log('deleteSupplier called with ID:', id, 'Type:', typeof id);
		
		if (!id) {
			return res.status(400).json({ success: false, message: 'Supplier ID is required' });
		}

		// Validate UUID format
		const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
		if (!uuidRegex.test(id)) {
			return res.status(400).json({ 
				success: false, 
				message: `Invalid supplier ID format. Expected UUID but received: ${id}` 
			});
		}

		const result = await supplierModel.deleteSupplier(id);
		if (!result) {
			return res.status(404).json({ success: false, message: 'Supplier not found' });
		}

		return res.status(200).json({
			success: true,
			message: 'Supplier deleted successfully'
		});
	} catch (error) {
		console.error('deleteSupplier error:', error);
		return res.status(400).json({ success: false, message: error.message || 'Failed to delete supplier' });
	}
};

exports.createSupplierOrder = async (req, res) => {
	try {
		const { supplier_id, items, total_amount } = req.body || {};

		// Validation
		if (!supplier_id || isNaN(Number(supplier_id))) {
			return res.status(400).json({ success: false, message: 'Valid supplier ID is required' });
		}

		if (!items || !Array.isArray(items) || items.length === 0) {
			return res.status(400).json({ success: false, message: 'Order items are required' });
		}

		if (!total_amount || isNaN(Number(total_amount)) || Number(total_amount) <= 0) {
			return res.status(400).json({ success: false, message: 'Valid total amount is required' });
		}

		// Validate each item
		for (const item of items) {
			if (!item.product_id || isNaN(Number(item.product_id))) {
				return res.status(400).json({ success: false, message: 'Valid product ID is required for all items' });
			}
			if (!item.quantity || isNaN(Number(item.quantity)) || Number(item.quantity) <= 0) {
				return res.status(400).json({ success: false, message: 'Valid quantity is required for all items' });
			}
			if (!item.unit_price || isNaN(Number(item.unit_price)) || Number(item.unit_price) <= 0) {
				return res.status(400).json({ success: false, message: 'Valid unit price is required for all items' });
			}
		}

		const order = await supplierModel.createSupplierOrder({
			supplier_id: Number(supplier_id),
			items: items.map(item => ({
				product_id: Number(item.product_id),
				quantity: Number(item.quantity),
				unit_price: Number(item.unit_price),
				total_amount: Number(item.total_amount)
			})),
			total_amount: Number(total_amount)
		});

		return res.status(201).json({
			success: true,
			message: 'Supplier order created successfully',
			data: order
		});
	} catch (error) {
		console.error('createSupplierOrder error:', error);
		return res.status(400).json({ success: false, message: error.message || 'Failed to create supplier order' });
	}
};

exports.getSupplierOrders = async (req, res) => {
	try {
		const limit = Number(req.query.limit ?? 50);
		const offset = Number(req.query.offset ?? 0);
		const supplier_id = req.query.supplier_id ? Number(req.query.supplier_id) : null;

		const orders = await supplierModel.getSupplierOrders(limit, offset, supplier_id);

		return res.status(200).json({
			success: true,
			data: orders,
			pagination: { limit, offset, count: orders.length }
		});
	} catch (error) {
		console.error('getSupplierOrders error:', error);
		return res.status(500).json({ success: false, message: 'Failed to fetch supplier orders' });
	}
};

exports.getSupplierOrderById = async (req, res) => {
	try {
		const { id } = req.params;
		if (!id || isNaN(Number(id))) {
			return res.status(400).json({ success: false, message: 'Valid order ID is required' });
		}

		const order = await supplierModel.getSupplierOrderById(Number(id));
		if (!order) {
			return res.status(404).json({ success: false, message: 'Supplier order not found' });
		}

		return res.status(200).json({
			success: true,
			data: order
		});
	} catch (error) {
		console.error('getSupplierOrderById error:', error);
		return res.status(500).json({ success: false, message: 'Failed to fetch supplier order' });
	}
};

// Product-Supplier Assignment Management
exports.saveProductSupplierAssignments = async (req, res) => {
	try {
		console.log('=== saveProductSupplierAssignments called ===');
		console.log('Request body:', JSON.stringify(req.body, null, 2));
		console.log('Request headers:', req.headers);
		
		const { assignments } = req.body || {};
		
		console.log('Extracted assignments:', assignments);

		if (!assignments || !Array.isArray(assignments)) {
			console.log('Invalid assignments data');
			return res.status(400).json({ 
				success: false, 
				message: 'Assignments array is required' 
			});
		}

		console.log('Assignments array length:', assignments.length);

		// Simplified validation - just check if data exists
		for (let i = 0; i < assignments.length; i++) {
			const assignment = assignments[i];
			console.log(`Assignment ${i}:`, assignment);
			
			if (!assignment.product_id || !assignment.supplier_id) {
				console.log(`Assignment ${i} missing required fields`);
				return res.status(400).json({ 
					success: false, 
					message: `Assignment ${i} must have product_id and supplier_id` 
				});
			}
		}

		console.log('All assignments validated, calling model...');
		
		// Get user ID from headers (set by API Gateway)
		const userId = req.headers['x-user-id'];
		console.log('User ID from headers:', userId);
		
		const result = await supplierModel.saveProductSupplierAssignments(assignments, userId);
		console.log('Model returned:', result);

		return res.status(200).json({
			success: true,
			message: 'Product-supplier assignments saved successfully',
			data: result
		});
	} catch (error) {
		console.error('=== Controller Error ===');
		console.error('Error message:', error.message);
		console.error('Error stack:', error.stack);
		console.error('========================');
		return res.status(500).json({ 
			success: false, 
			message: `Failed to save assignments: ${error.message}` 
		});
	}
};

exports.getProductSupplierAssignments = async (req, res) => {
	try {
		const assignments = await supplierModel.getProductSupplierAssignments();

		return res.status(200).json({
			success: true,
			data: assignments
		});
	} catch (error) {
		console.error('getProductSupplierAssignments error:', error);
		return res.status(500).json({ 
			success: false, 
			message: 'Failed to fetch product-supplier assignments' 
		});
	}
};

// Restock Orders Management
exports.createRestockOrders = async (req, res) => {
	try {
		const { restock_orders } = req.body || {};

		if (!restock_orders || !Array.isArray(restock_orders)) {
			return res.status(400).json({ 
				success: false, 
				message: 'Restock orders array is required' 
			});
		}

		// Validate each restock order
		for (const order of restock_orders) {
			if (!order.product_id || !order.restock_amount) {
				return res.status(400).json({ 
					success: false, 
					message: 'Each restock order must have product_id and restock_amount' 
				});
			}

			if (isNaN(Number(order.restock_amount)) || Number(order.restock_amount) <= 0) {
				return res.status(400).json({ 
					success: false, 
					message: 'Restock amount must be a positive number' 
				});
			}
		}

		const result = await supplierModel.createRestockOrders(restock_orders);

		return res.status(201).json({
			success: true,
			message: 'Restock orders created successfully',
			data: result
		});
	} catch (error) {
		console.error('createRestockOrders error:', error);
		return res.status(500).json({ 
			success: false, 
			message: 'Failed to create restock orders' 
		});
	}
};

exports.getRestockOrders = async (req, res) => {
	try {
		const limit = Number(req.query.limit ?? 50);
		const offset = Number(req.query.offset ?? 0);

		const orders = await supplierModel.getRestockOrders(limit, offset);

		return res.status(200).json({
			success: true,
			data: orders,
			pagination: { limit, offset, count: orders.length }
		});
	} catch (error) {
		console.error('getRestockOrders error:', error);
		return res.status(500).json({ 
			success: false, 
			message: 'Failed to fetch restock orders' 
		});
	}
};
