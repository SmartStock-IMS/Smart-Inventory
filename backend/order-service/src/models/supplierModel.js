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

	// Product-Supplier Assignment Methods
	async saveProductSupplierAssignments(assignments, userId = null) {
		try {
			console.log('=== Model saveProductSupplierAssignments ===');
			console.log('Received assignments:', assignments);
			console.log('User ID:', userId);

			// Test database connection
			console.log('Testing database connection...');
			const testResult = await this.query('SELECT 1 as test');
			console.log('Database connection test result:', testResult);

			// Use a default inventory manager ID if none provided
			const inventoryManagerId = userId || '123e4567-e89b-12d3-a456-426614174000';
			console.log('Using inventory manager ID:', inventoryManagerId);

			// Group assignments by supplier
			const assignmentsBySupplier = {};
			assignments.forEach(assignment => {
				if (!assignmentsBySupplier[assignment.supplier_id]) {
					assignmentsBySupplier[assignment.supplier_id] = [];
				}
				assignmentsBySupplier[assignment.supplier_id].push(assignment);
			});

			console.log('Assignments grouped by supplier:', assignmentsBySupplier);

			let totalOrdersCreated = 0;

			// Create a supplier order for each supplier with their assigned products
			for (const [supplierId, supplierAssignments] of Object.entries(assignmentsBySupplier)) {
				try {
					console.log(`Creating order for supplier: ${supplierId}`);
					
					// First, let's check if the supplier exists
					const supplierCheck = await this.query('SELECT supplier_id FROM supplier WHERE supplier_id = $1', [supplierId]);
					if (supplierCheck.length === 0) {
						console.error(`Supplier ${supplierId} does not exist`);
						continue;
					}
					console.log(`Supplier ${supplierId} exists`);
					
					// Create supplier order - include inventory_manager_id
					console.log('Executing INSERT into supplier_orders...');
					const orderResult = await this.query(`
						INSERT INTO supplier_orders (
							supplier_id, 
							inventory_manager_id,
							order_status, 
							order_type,
							order_date
						) VALUES ($1, $2, $3, $4, CURRENT_DATE) 
						RETURNING supplier_order_id
					`, [
						supplierId,
						inventoryManagerId,
						'pending',
						'purchase'
					]);

					if (!orderResult || orderResult.length === 0) {
						console.error('No order ID returned from insert');
						continue;
					}

					const orderId = orderResult[0].supplier_order_id;
					console.log(`Created supplier order: ${orderId}`);

					// Create order items for each assigned product
					for (const assignment of supplierAssignments) {
						try {
							console.log(`Creating order item for product: ${assignment.product_id}`);
							
							// Get restock amount if provided (from frontend)
							const restockAmount = assignment.restock_amount || 1; // Default to 1 if not provided
							const unitPrice = 10.00; // Default unit price - could be enhanced to get from product data
							
							await this.query(`
								INSERT INTO supplier_order_items (
									order_id,
									product_id,
									quantity,
									unit_price
								) VALUES ($1, $2, $3, $4)
							`, [
								orderId,
								assignment.product_id,
								restockAmount,
								unitPrice
							]);

							console.log(`Created order item for product ${assignment.product_id}`);
						} catch (itemError) {
							console.error('Error creating order item:', itemError.message);
							console.error('Assignment data:', assignment);
						}
					}

					totalOrdersCreated++;
				} catch (orderError) {
					console.error('Error creating supplier order:', orderError.message);
					console.error('Supplier ID:', supplierId);
				}
			}

			console.log(`Successfully created ${totalOrdersCreated} supplier orders`);

			// Also maintain the assignment table for quick lookups
			await this.maintainAssignmentTable(assignments);

			return { success: true, ordersCreated: totalOrdersCreated, assignmentsCount: assignments.length };
		} catch (error) {
			console.error('=== Model Error ===');
			console.error('Error message:', error.message);
			console.error('Error code:', error.code);
			console.error('Error detail:', error.detail);
			console.error('Full error object:', error);
			console.error('==================');
			throw new Error(`Failed to save product-supplier assignments: ${error.message}`);
		}
	}

	// Helper method to maintain assignment table for quick lookups
	async maintainAssignmentTable(assignments) {
		try {
			// Drop and recreate assignment table for quick supplier lookups
			await this.query('DROP TABLE IF EXISTS product_supplier_assignment');
			await this.query(`
				CREATE TABLE product_supplier_assignment (
					id SERIAL PRIMARY KEY,
					product_id UUID NOT NULL,
					supplier_id UUID NOT NULL REFERENCES supplier(supplier_id),
					assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
					UNIQUE(product_id, supplier_id)
				)
			`);

			// Insert current assignments for quick lookup
			for (const assignment of assignments) {
				await this.query(
					'INSERT INTO product_supplier_assignment (product_id, supplier_id) VALUES ($1, $2)',
					[assignment.product_id, assignment.supplier_id]
				);
			}
		} catch (error) {
			console.error('Error maintaining assignment table:', error.message);
			// Don't throw - this is just for quick lookups
		}
	}

	async getProductSupplierAssignments() {
		try {
			// Create table if not exists
			await this.query(`
				CREATE TABLE IF NOT EXISTS product_supplier_assignment (
					id SERIAL PRIMARY KEY,
					product_id UUID NOT NULL,
					supplier_id UUID NOT NULL REFERENCES supplier(supplier_id),
					assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
					UNIQUE(product_id, supplier_id)
				)
			`);

			const assignments = await this.query(`
				SELECT 
					psa.id,
					psa.product_id,
					psa.supplier_id,
					s.name as supplier_name,
					psa.assigned_at
				FROM product_supplier_assignment psa
				JOIN supplier s ON psa.supplier_id = s.supplier_id
				ORDER BY psa.assigned_at DESC
			`);

			console.log(`Retrieved ${assignments.length} product-supplier assignments`);
			return assignments;
		} catch (error) {
			console.error('getProductSupplierAssignments error:', error);
			throw new Error('Failed to fetch product-supplier assignments');
		}
	}

	// Restock Orders Methods
	async createRestockOrders(restockOrders) {
		try {
			console.log('createRestockOrders: Saving restock orders to database:', restockOrders);

			// Create table if not exists
			await this.query(`
				CREATE TABLE IF NOT EXISTS restock_order (
					id SERIAL PRIMARY KEY,
					product_id UUID NOT NULL,
					restock_amount INTEGER NOT NULL,
					status VARCHAR(50) DEFAULT 'pending',
					created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
					updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
				)
			`);

			const savedOrders = [];
			for (const order of restockOrders) {
				try {
					const result = await this.query(
						'INSERT INTO restock_order (product_id, restock_amount) VALUES ($1, $2) RETURNING *',
						[order.product_id, order.restock_amount]
					);
					if (result && result.length > 0) {
						savedOrders.push(result[0]);
					}
				} catch (error) {
					console.error('Error inserting restock order:', error, order);
				}
			}

			console.log(`Successfully saved ${savedOrders.length} restock orders`);
			return { 
				success: true, 
				message: 'Restock orders saved to database',
				count: savedOrders.length,
				orders: savedOrders
			};
		} catch (error) {
			console.error('createRestockOrders error:', error);
			throw new Error('Failed to create restock orders');
		}
	}

	async getRestockOrders(limit = 50, offset = 0) {
		try {
			// Create table if not exists
			await this.query(`
				CREATE TABLE IF NOT EXISTS restock_order (
					id SERIAL PRIMARY KEY,
					product_id UUID NOT NULL,
					restock_amount INTEGER NOT NULL,
					status VARCHAR(50) DEFAULT 'pending',
					created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
					updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
				)
			`);

			const orders = await this.query(`
				SELECT * FROM restock_order 
				ORDER BY created_at DESC 
				LIMIT $1 OFFSET $2
			`, [limit, offset]);

			console.log(`Retrieved ${orders.length} restock orders`);
			return orders;
		} catch (error) {
			console.error('getRestockOrders error:', error);
			throw new Error('Failed to fetch restock orders');
		}
	}
}

module.exports = new Supplier();
