const BaseModel = require('./baseModel');

// Updated at: 2025-09-22
class Variant extends BaseModel {
  constructor() {
    super('product_category');
  }

  async findAll(limit = 10, offset = 0) {
    try {
      return await this.callFunction('fn_get_categories');
    } catch (error) {
      throw error;
    }
  }

  async create(variantData) {
    try {
      const result = await this.callProcedure('sp_create_product_category', [
        null,
        null,
        null,
        variantData.category_name || null,
        variantData.description || null,
        variantData.pic_url || null
      ]);
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  async findById(id) {
    try {
      const result = await this.callFunction('fn_get_products_by_category', [id]);
      return result;
    } catch (error) {
      throw error;
    }
  }
/*
  async findByProductId(productId) {
    try {
      return await this.callFunction('fn_get_variants_by_product', [productId]);
    } catch (error) {
      throw error;
    }
  }

  async findById(id) {
    try {
      const result = await this.callFunction('fn_get_variant_by_id', [id]);
      return result[0] || null;
    } catch (error) {
      throw error;
    }
  }

  async create(variantData) {
    try {
      const result = await this.callProcedure('sp_create_variant', [
        variantData.product_id,
        variantData.variant_name,
        variantData.sku || null,
        variantData.color || null,
        variantData.size || null,
        variantData.material || null,
        variantData.cost_price || 0,
        variantData.selling_price || 0,
        variantData.weight || null,
        variantData.dimensions || null,
        variantData.image_url || null,
        variantData.status || 'active'
      ]);
      return result[0];
    } catch (error) {
      throw error;
    }
  }
  */

  // Category-specific methods
  async updateCategory(id, categoryData) {
    try {
      const result = await this.query(
        `UPDATE product_category 
         SET category_name = $1, description = $2, pic_url = $3 
         WHERE category_id = $4 
         RETURNING *`,
        [
          categoryData.category_name || null,
          categoryData.description || null,
          categoryData.pic_url || null,
          id
        ]
      );

      if (result.length === 0) {
        throw new Error(`Category with id ${id} not found or no changes made`);
      }

      return result[0];
    } catch (error) {
      throw error;
    }
  }

  async deleteCategory(id) {
    try {
      const result = await this.query(
        `DELETE FROM product_category 
         WHERE category_id = $1 
         RETURNING *`,
        [id]
      );
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  // Original variant methods
  async update(id, updateData) {
    try {
      const result = await this.callProcedure('sp_update_variant', [
        id,
        updateData.variant_name || null,
        updateData.color || null,
        updateData.size || null,
        updateData.material || null,
        updateData.cost_price || null,
        updateData.selling_price || null,
        updateData.weight || null,
        updateData.dimensions || null,
        updateData.image_url || null,
        updateData.status || null
      ]);
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  async softDelete(id) {
    try {
      await this.callProcedure('sp_soft_delete_variant', [id]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  async getVariantsWithInventory(productId) {
    try {
      return await this.callFunction('fn_get_variants_with_inventory', [productId]);
    } catch (error) {
      throw error;
    }
  }

  async deleteCategory(id) {
    try {
      // Use the query method from BaseModel to execute raw SQL
      const result = await this.query(
        `DELETE FROM product_category 
         WHERE category_id = $1
         RETURNING *`,
        [id]
      );
      return result[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Variant;
