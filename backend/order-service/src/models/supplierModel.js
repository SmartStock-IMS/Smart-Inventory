const BaseModel = require('./baseModel');

class Supplier extends BaseModel {
	constructor() {
		super('supplier');
	}

	async getSuppliers(limit = 10, offset = 0, isActive = null) {
		return await this.callFunction('fn_get_suppliers', [limit, offset, isActive]);
	}

	async getSupplierById(id) {
		try {
			// Use direct SQL query since fn_get_supplier_by_id doesn't exist
			const query = 'SELECT * FROM supplier WHERE supplier_id = $1';
			const result = await this.query(query, [id]);
			return result && result.length > 0 ? result[0] : null;
		} catch (error) {
			console.error('getSupplierById error:', error, 'ID:', id);
			throw new Error('Failed to fetch supplier');
		}
	}

	async createSupplier({ name, contact_no = null, email = null, address = null }) {
		const result = await this.callProcedure('sp_create_supplier', [
			name,
			contact_no,
			email,
			address,
			null // INOUT p_result placeholder
		]);
		const row = result && result[0] ? result[0] : null;
		return row?.p_result || row || null;
	}

	async updateSupplier(id, { name, contact_no = null, email = null, address = null }) {
		try {
			// Use direct SQL query since sp_update_supplier might not exist or work with UUIDs
			const query = `
				UPDATE supplier 
				SET name = $2, contact_no = $3, email = $4, address = $5, updated_at = CURRENT_TIMESTAMP
				WHERE supplier_id = $1
				RETURNING *
			`;
			const result = await this.query(query, [id, name, contact_no, email, address]);
			return result && result.length > 0 ? result[0] : null;
		} catch (error) {
			console.error('updateSupplier error:', error, 'ID:', id);
			throw new Error('Failed to update supplier');
		}
	}

	async deleteSupplier(id) {
		try {
			// Use direct SQL query since sp_delete_supplier might not exist or work with UUIDs
			const query = 'DELETE FROM supplier WHERE supplier_id = $1 RETURNING *';
			const result = await this.query(query, [id]);
			return result && result.length > 0 ? result[0] : null;
		} catch (error) {
			console.error('deleteSupplier error:', error, 'ID:', id);
			throw new Error('Failed to delete supplier');
		}
	}

	async createSupplierOrder({ supplier_id, items, total_amount }) {
		try {
			// First create the main order
			const orderResult = await this.callProcedure('sp_create_supplier_order', [
				supplier_id,
				total_amount,
				null // INOUT order_id placeholder
			]);

			const orderRow = orderResult && orderResult[0] ? orderResult[0] : null;
			const orderId = orderRow?.order_id || orderRow?.supplier_order_id;

			if (!orderId) {
				throw new Error('Failed to create supplier order');
			}

			// Then create order items
			for (const item of items) {
				await this.callProcedure('sp_create_supplier_order_item', [
					orderId,
					item.product_id,
					item.quantity,
					item.unit_price,
					item.total_amount
				]);
			}

			// Return the complete order with items
			return await this.getSupplierOrderById(orderId);
		} catch (error) {
			console.error('createSupplierOrder error:', error);
			throw new Error('Failed to create supplier order');
		}
	}

	async getSupplierOrders(limit = 50, offset = 0, supplier_id = null) {
		try {
			return await this.callFunction('fn_get_supplier_orders', [limit, offset, supplier_id]);
		} catch (error) {
			console.error('getSupplierOrders error:', error);
			throw new Error('Failed to fetch supplier orders');
		}
	}

	async getSupplierOrderById(id) {
		try {
			const result = await this.callFunction('fn_get_supplier_order_by_id', [id]);
			return result && result.length > 0 ? result[0] : null;
		} catch (error) {
			console.error('getSupplierOrderById error:', error);
			throw new Error('Failed to fetch supplier order');
		}
	}
}

module.exports = new Supplier();
