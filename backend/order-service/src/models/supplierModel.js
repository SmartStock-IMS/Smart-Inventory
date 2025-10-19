const BaseModel = require('./baseModel');

class Supplier extends BaseModel {
	constructor() {
		super('supplier');
	}

	async getSuppliers(limit = 10, offset = 0, isActive = null) {
		return await this.callFunction('fn_get_suppliers', [limit, offset, isActive]);
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
}

module.exports = new Supplier();
