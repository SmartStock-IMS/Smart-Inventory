const BaseModel = require('./baseModel');


class Product extends BaseModel {
  constructor() {
    super('product');
  }

  async getMostPopularProducts(limit = 10) {
    try {
      return await this.callFunction('fn_get_most_popular_products', [limit]);
    } catch (error) {
      throw error;
    }
  }

  async findAll(limit = 10, offset = 0) {
    try {
      return await this.callFunction('fn_get_products', [
        limit,
        offset
      ]);
    } catch (error) {
      throw error;
    }
  }

  async findById(id) {
    try {
      const result = await this.callFunction('fn_get_product_by_id', [id]);
      return result[0] || null;
    } catch (error) {
      throw error;
    }
  }

  async create(productData) {
  try {
    const result = await this.callProcedure('sp_create_product', [
      null,
      null,
      null,
      productData.category_name,             
      productData.name,                      
      productData.cost_price || 0,          
      productData.selling_price || 0,        
      productData.min_stock_level || 0,      
      productData.max_stock_level || null,   
      productData.reorder_point || 0,        
      productData.shelf_life || null,        
      productData.initial_quantity || 0      
    ]);

    return result[0];
  } catch (error) {
    throw error;
  }
}


  async update(id, productData) {
    try {
      const result = await this.callProcedure('sp_update_product', [
        null,
        null,
        id,             
        productData.name,                      
        productData.cost_price || 0,          
        productData.selling_price || 0,        
        productData.min_stock_level || 0,      
        productData.max_stock_level || null,   
        productData.reorder_point || 0,        
        productData.shelf_life || null,
        productData.quantity || 0
      ]);
      return result[0];
    } catch (error) {
      throw error ;
    }
  }

  async delete(id) {
    try {
      await this.callProcedure('sp_delete_product', [null,null,id]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  /*async getProductsWithInventory(limit = 10, offset = 0) {
    try {
      return await this.callFunction('fn_get_products_with_inventory', [limit, offset]);
    } catch (error) {
      throw error;
    }
  }

  async getLowStockProducts(limit = 10) {
    try {
      return await this.callFunction('fn_get_low_stock_products', [limit]);
    } catch (error) {
      throw error;
    }
  }*/
}

module.exports = Product;
