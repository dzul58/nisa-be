// kpiController.js
const poolNisa = require('../config/configNisa')

class KpiController {
  static async getAllCsKpi(req, res) {
    try {
      const { name, period, sortBy, sortOrder, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      let query = `
        SELECT cs_id, name, total_requests_created, period
        FROM homepass_moving_address_cs_kpi
        WHERE 1=1
      `;

      const queryParams = [];

      if (name) {
        query += ` AND name ILIKE $${queryParams.length + 1}`;
        queryParams.push(`%${name}%`);
      }

      if (period) {
        query += ` AND period = $${queryParams.length + 1}`;
        queryParams.push(period);
      }

      if (sortBy && ['name', 'total_requests_created', 'period'].includes(sortBy)) {
        query += ` ORDER BY ${sortBy} ${sortOrder === 'DESC' ? 'DESC' : 'ASC'}`;
      } else {
        query += ` ORDER BY period DESC, total_requests_created DESC`;
      }

      query += ` LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
      queryParams.push(limit, offset);

      const countQuery = `
        SELECT COUNT(*) FROM homepass_moving_address_cs_kpi
        WHERE 1=1
        ${name ? ` AND name ILIKE $1` : ''}
        ${period ? ` AND period = $${name ? '2' : '1'}` : ''}
      `;

      const client = await poolNisa.connect();
      const result = await client.query(query, queryParams);
      const countResult = await client.query(countQuery, name || period ? [name ? `%${name}%` : null, period].filter(Boolean) : []);
      client.release();

      const totalItems = parseInt(countResult.rows[0].count);
      const totalPages = Math.ceil(totalItems / limit);

      res.json({
        data: result.rows,
        totalItems,
        totalPages,
        currentPage: parseInt(page)
      });
    } catch (error) {
      console.error('Error in getAllCsKpi:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = KpiController;