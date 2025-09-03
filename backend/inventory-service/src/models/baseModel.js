const pool = require('../config/database');

class BaseModel {
  constructor(tableName) {
    this.tableName = tableName;
    this.pool = pool;
  }

  async callProcedure(procedureName, params = []) {
    try {
      const placeholders = params.map((_, i) => `$${i + 1}`).join(', ');
      const query = `CALL ${procedureName}(${placeholders})`;
      const result = await this.pool.query(query, params);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  async callFunction(functionName, params = []) {
    try {
      const placeholders = params.map((_, i) => `$${i + 1}`).join(', ');
      const query = `SELECT * FROM ${functionName}(${placeholders})`;
      const result = await this.pool.query(query, params);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  async callScalarFunction(functionName, params = []) {
    try {
      const placeholders = params.map((_, i) => `$${i + 1}`).join(', ');
      const query = `SELECT ${functionName}(${placeholders}) as result`;
      const result = await this.pool.query(query, params);
      return result.rows[0]?.result;
    } catch (error) {
      throw error;
    }
  }

  async query(sql, params = []) {
    try {
      const result = await this.pool.query(sql, params);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = BaseModel;
