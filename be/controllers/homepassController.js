const poolNisa = require('../config/configNisa')
// const moment = require('moment');

class HomepassController {
  static async getAllHomepassRequests(req, res) {
    try {
      const {
        request_purpose,
        submissionFrom,
        requestSource,
        customerCid,
        homepassId,
        network,
        homeIdStatus,
        hpmPic,
        status,
        page = 1, // default page is 1
        limit = 12 // default limit is 10
      } = req.query;

      const filters = [];
      const filterValues = [];

      if (request_purpose) {
        filters.push(`full_name_pic ILIKE $${filterValues.length + 1}`);
        filterValues.push(`%${request_purpose}%`);
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
        SELECT * FROM homepass_moving_address_request 
        ${filters.length > 0 ? "WHERE " + filters.join(" AND ") : ""}
        ORDER BY id DESC 
        LIMIT $${filterValues.length + 1} 
        OFFSET $${filterValues.length + 2}
      `;

      const countQuery = `
        SELECT COUNT(*) FROM homepass_moving_address_request 
        ${filters.length > 0 ? "WHERE " + filters.join(" AND ") : ""}
      `;

      // Execute the queries
      const [result, countResult] = await Promise.all([
        poolNisa.query(query, [...filterValues, limit, offset]),
        poolNisa.query(countQuery, filterValues)
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
          const result = await poolNisa.query('SELECT * FROM homepass_moving_address_request WHERE id = $1', [id]);
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
        const { name, email } = req.userAccount
        const {
          current_address,
          destination_address,
          coordinate_point,
          request_purpose,
          hpm_check_result,
          network,
          home_id_status,
          remarks,
          notes_recommendations,
          hpm_pic,
          status,
          completion_date,
          uploadResult,
          imageUrlFrontOfHouse,
          imageUrlLeftOfHouse,
          imageUrlRightOfHouse,
          imageUrlOldFat,
          imageUrlNewFat
        } = req.body;
      
        try {
          const result = await poolNisa.query(
            `INSERT INTO homepass_moving_address_request (
              full_name_pic, submission_from, request_source, customer_cid, current_address,
              destination_address, coordinate_point, request_purpose, email_address,
              hpm_check_result, network, home_id_status, remarks, notes_recommendations,
              hpm_pic, status, completion_date, photo_front_of_house_url, photo_left_of_home_url, 
              photo_right_of_home_url, photo_old_fat_url, photo_new_fat_url, id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22. $23)
            RETURNING *`,
            [
              name, 
              uploadResult.submissionFrom, 
              uploadResult.requestSource, 
              uploadResult.customerCid, 
              current_address,
              destination_address, 
              coordinate_point, 
              request_purpose, 
              email,
              hpm_check_result, 
              network, 
              home_id_status, 
              remarks, 
              notes_recommendations,
              hpm_pic,
              status, 
              completion_date, 
              imageUrlFrontOfHouse, 
              imageUrlLeftOfHouse, 
              imageUrlRightOfHouse, 
              imageUrlOldFat, 
              imageUrlNewFat
            ]
          );
          res.status(201).json(result.rows[0]);
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      }
      
      static async editHomepassRequest(req, res) {
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
          completion_date,
          imageUrlFrontOfHouse,
          imageUrlLeftOfHouse,
          imageUrlRightOfHouse,
          imageUrlOldFat,
          imageUrlNewFat
        } = req.body;
      
        try {
          // Pertama, ambil data yang ada
          const existingData = await poolNisa.query('SELECT * FROM homepass_moving_address_request WHERE id = $1', [id]);
          
          if (existingData.rows.length === 0) {
            return res.status(404).json({ error: 'Record not found' });
          }
      
          const existingRecord = existingData.rows[0];
      
          // Update query
          const result = await poolNisa.query(
            `UPDATE homepass_moving_address_request SET
              full_name_pic = $1, submission_from = $2, request_source = $3, customer_cid = $4,
              current_address = $5, destination_address = $6, coordinate_point = $7,
              request_purpose = $8, email_address = $9, hpm_check_result = $10,
              network = $11, home_id_status = $12, remarks = $13, notes_recommendations = $14,
              hpm_pic = $15, status = $16, completion_date = $17,
              photo_front_of_house_url = $18,
              photo_left_of_home_url = $19,
              photo_right_of_home_url = $20,
              photo_old_fat_url = $21,
              photo_new_fat_url = $22
            WHERE id = $23
            RETURNING *`,
            [
              uploadResult.fullNamePic, uploadResult.submissionFrom, uploadResult.requestSource, uploadResult.customerCid,
              current_address, destination_address, coordinate_point, request_purpose, email_address,
              hpm_check_result, network, home_id_status, remarks, notes_recommendations,
              hpm_pic, status, completion_date,
              imageUrlFrontOfHouse || existingRecord.photo_front_of_house_url,
              imageUrlLeftOfHouse || existingRecord.photo_left_of_home_url,
              imageUrlRightOfHouse || existingRecord.photo_right_of_home_url,
              imageUrlOldFat || existingRecord.photo_old_fat_url,
              imageUrlNewFat || existingRecord.photo_new_fat_url,
              id
            ]
          );
      
          res.status(200).json(result.rows[0]);
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      }


      static async updateHomepassRequest(req, res) {
        const { id } = req.params;
        const {name} = req.userAccount
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
          status,
          completion_date
        } = req.body;
    
        try {
          const result = await poolNisa.query(
            `UPDATE homepass_moving_address_request SET
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
              name, status, completion_date, id
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
          const result = await poolNisa.query('DELETE FROM homepass_moving_address_request WHERE id = $1 RETURNING *', [id]);
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
}

module.exports = HomepassController