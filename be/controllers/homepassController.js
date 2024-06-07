const pool = require('../config/config')
const jwt = require('jsonwebtoken');
const md5 = require('md5');
// const UploadController = require('./uploadController');

class HomepassController {
  static async getAllHomepassRequests(req, res) {
    try {
      const {
        fullNamePic,
        submissionFrom,
        requestSource,
        customerCid,
        homepassId,
        network,
        homeIdStatus,
        hpmPic,
        status,
        page = 1, // default page is 1
        limit = 10 // default limit is 10
      } = req.query;

      const filters = [];
      const filterValues = [];

      if (fullNamePic) {
        filters.push(`full_name_pic ILIKE $${filterValues.length + 1}`);
        filterValues.push(`%${fullNamePic}%`);
      }

      if (submissionFrom) {
        filters.push(`submission_from ILIKE $${filterValues.length + 1}`);
        filterValues.push(`%${submissionFrom}%`);
      }

      if (requestSource) {
        filters.push(`request_source ILIKE $${filterValues.length + 1}`);
        filterValues.push(`%${requestSource}%`);
      }

      if (customerCid) {
        filters.push(`customer_cid ILIKE $${filterValues.length + 1}`);
        filterValues.push(`%${customerCid}%`);
      }

      if (homepassId) {
        filters.push(`homepass_id ILIKE $${filterValues.length + 1}`);
        filterValues.push(`%${homepassId}%`);
      }

      if (network) {
        filters.push(`network ILIKE $${filterValues.length + 1}`);
        filterValues.push(`%${network}%`);
      }

      if (homeIdStatus) {
        filters.push(`home_id_status ILIKE $${filterValues.length + 1}`);
        filterValues.push(`%${homeIdStatus}%`);
      }

      if (hpmPic) {
        filters.push(`hpm_pic ILIKE $${filterValues.length + 1}`);
        filterValues.push(`%${hpmPic}%`);
      }

      if (status) {
        filters.push(`status ILIKE $${filterValues.length + 1}`);
        filterValues.push(`%${status}%`);
      }

      const offset = (page - 1) * limit; // Calculate offset based on page and limit

      // Assemble query with placeholders
      const query = `
        SELECT * FROM homepass_request 
        ${filters.length > 0 ? "WHERE " + filters.join(" AND ") : ""}
        ORDER BY id DESC 
        LIMIT $${filterValues.length + 1} 
        OFFSET $${filterValues.length + 2}
      `;

      const countQuery = `
        SELECT COUNT(*) FROM homepass_request 
        ${filters.length > 0 ? "WHERE " + filters.join(" AND ") : ""}
      `;

      // Execute the queries
      const [result, countResult] = await Promise.all([
        pool.query(query, [...filterValues, limit, offset]),
        pool.query(countQuery, filterValues)
      ]);

      const totalRecords = parseInt(countResult.rows[0].count, 10);
      const totalPages = Math.ceil(totalRecords / limit);

      res.status(200).json({ requests: result.rows, totalPages });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }


      static async getHomepassRequestById(req, res) {
        const { id } = req.params;
    
        try {
          const result = await pool.query('SELECT * FROM homepass_request WHERE id = $1', [id]);
          if (result.rows.length === 0) {
            res.status(404).json({ error: 'Record not found' });
          } else {
            res.status(200).json(result.rows[0]);
          }
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      }
    
      static async createHomepassRequest(req, res) {
        const {
          uploadResult,
          current_address,
          destination_address,
          coordinate_point,
          request_purpose,
          email_address,
          hpm_check_result,
          network,
          home_id_status,
          remarks,
          notes_recommendations,
          hpm_pic,
          status,
          completion_date
        } = req.body;
      
        try {
          // if (!uploadResult || !uploadResult.housePhotoUrl) {
          //   return res.status(400).json({ error: 'House photo is required' });
          // }
      
          const result = await pool.query(
            `INSERT INTO homepass_request (
              full_name_pic, submission_from, request_source, customer_cid, current_address,
              destination_address, coordinate_point, house_photo, request_purpose, email_address,
              hpm_check_result, homepass_id, network, home_id_status, remarks, notes_recommendations,
              hpm_pic, status, completion_date
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
            RETURNING *`,
            [
              uploadResult.fullNamePic, uploadResult.submissionFrom, uploadResult.requestSource, uploadResult.customerCid, current_address,
              destination_address, coordinate_point, uploadResult.housePhotoUrl, request_purpose, email_address,
              hpm_check_result, uploadResult.homepassId, network, home_id_status, remarks, notes_recommendations,
              hpm_pic, status, completion_date
            ]
          );
          res.status(201).json(result.rows[0]);
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      }


      static async updateHomepassRequest(req, res) {
        const { id } = req.params;
        const {
          uploadResult,
          current_address,
          destination_address,
          coordinate_point,
          request_purpose,
          email_address,
          hpm_check_result,
          network,
          home_id_status,
          remarks,
          notes_recommendations,
          hpm_pic,
          status,
          completion_date
        } = req.body;
    
        try {
          const result = await pool.query(
            `UPDATE homepass_request SET
              full_name_pic = $1, submission_from = $2, request_source = $3, customer_cid = $4,
              current_address = $5, destination_address = $6, coordinate_point = $7, house_photo = $8,
              request_purpose = $9, email_address = $10, hpm_check_result = $11, homepass_id = $12,
              network = $13, home_id_status = $14, remarks = $15, notes_recommendations = $16,
              hpm_pic = $17, status = $18, completion_date = $19
            WHERE id = $20
            RETURNING *`,
            [
              uploadResult.fullNamePic, uploadResult.submissionFrom, uploadResult.requestSource, uploadResult.customerCid, current_address,
              destination_address, coordinate_point, uploadResult.housePhotoUrl, request_purpose, email_address,
              hpm_check_result, uploadResult.homepassId, network, home_id_status, remarks, notes_recommendations,
              hpm_pic, status, completion_date, id
            ]
          );
          if (result.rows.length === 0) {
            res.status(404).json({ error: 'Record not found' });
          } else {
            res.status(200).json(result.rows[0]);
          }
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      }


      static async deleteHomepassRequest(req, res) {
        const { id } = req.params;
    
        try {
          const result = await pool.query('DELETE FROM homepass_request WHERE id = $1 RETURNING *', [id]);
          if (result.rows.length === 0) {
            res.status(404).json({ error: 'Record not found' });
          } else {
            res.status(200).json(result.rows[0]);
          }
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      }


      static async login(req, res) {
        const { username, password } = req.body;

        try {
            const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
            if (result.rows.length === 0) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const user = result.rows[0];
            const hashedPassword = md5(password);
            if (user.password !== hashedPassword) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const token = jwt.sign({ id: user.id }, 'your_jwt_secret', { expiresIn: '1h' });
            const hashedToken = md5(token);

            res.status(200).json({ auth: true, token: hashedToken });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    

      static verifyToken(req, res, next) {
        const token = req.headers['x-access-token'];
        if (!token) return res.status(403).json({ auth: false, message: 'No token provided.' });

        const decodedToken = md5(token);
        jwt.verify(decodedToken, 'your_jwt_secret', function(err, decoded) {
            if (err) return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });

            req.userId = decoded.id;
            next();
        });
    }

}

module.exports = HomepassController