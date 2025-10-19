const supplierModel = require('../models/supplierModel');

exports.getAllSuppliers = async (req, res) => {
	try {
		const limit = Number(req.query.limit ?? 10);
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

exports.createSupplier = async (req, res) => {
	try {
		const { name, contact_no, email, address } = req.body || {};
		if (!name || String(name).trim() === '') {
			return res.status(400).json({ success: false, message: 'Supplier name is required' });
		}

		const created = await supplierModel.createSupplier({
			name: String(name).trim(),
			contact_no: contact_no ?? null,
			email: email ?? null,
			address: address ?? null
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
};
