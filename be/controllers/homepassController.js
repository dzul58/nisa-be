const poolNisa = require('../config/configNisa')
const moment = require('moment');

class HomepassController {
  static async getAllHomepassRequests(req, res) {
    try {
      const { role } = req.userAccount;
      const {
        timestamp,
        id,
        request_purpose,
        customer_cid,
        homepass_id,
        home_id_status,
        homepassId,
        network,
        homeIdStatus,
        full_name_pic,
        status,
        page = 1,
        limit = 12
      } = req.query;

      const filters = [];
      const filterValues = [];

      // Add condition for Branch roles
      if (role.includes('Branch')) {
        filters.push(`hpm_check_result = $${filterValues.length + 1}`);
        filterValues.push('Survey Ops.');
      }

      if (timestamp) {
        filters.push(`timestamp ILIKE $${filterValues.length + 1}`);
        filterValues.push(`%${timestamp}%`);
      }

      if (id) {
        filters.push(`id ILIKE $${filterValues.length + 1}`);
        filterValues.push(`%${id}%`);
      }

      if (request_purpose) {
        filters.push(`request_purpose ILIKE $${filterValues.length + 1}`);
        filterValues.push(`%${request_purpose}%`);
      }

      if (customer_cid) {
        filters.push(`customer_cid ILIKE $${filterValues.length + 1}`);
        filterValues.push(`%${customer_cid}%`);
      }

      if (homepass_id) {
        filters.push(`homepass_id ILIKE $${filterValues.length + 1}`);
        filterValues.push(`%${homepass_id}%`);
      }

      if (network) {
        filters.push(`network ILIKE $${filterValues.length + 1}`);
        filterValues.push(`%${network}%`);
      }

      if (home_id_status) {
        filters.push(`home_id_status ILIKE $${filterValues.length + 1}`);
        filterValues.push(`%${home_id_status}%`);
      }

      if (homepassId) {
        filters.push(`homepass_id ILIKE $${filterValues.length + 1}`);
        filterValues.push(`%${homepassId}%`);
      }

      if (homeIdStatus) {
        filters.push(`home_id_status ILIKE $${filterValues.length + 1}`);
        filterValues.push(`%${homeIdStatus}%`);
      }

      if (full_name_pic) {
        filters.push(`hpm_pic ILIKE $${filterValues.length + 1}`);
        filterValues.push(`%${full_name_pic}%`);
      }

      if (status) {
        filters.push(`status ILIKE $${filterValues.length + 1}`);
        filterValues.push(`%${status}%`);
      }

      const offset = (page - 1) * limit;

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
        const { name, email } = req.userAccount;
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
          imageUrlNewFat,
          response_hpm_location,
          response_hpm_source
        } = req.body;
      
        try {
          const currentDate = moment();
          const formattedDate = currentDate.format('YYYYMMDD');
          
          const latestIdResult = await poolNisa.query(
            `SELECT id FROM homepass_moving_address_request 
             WHERE id LIKE $1 
             ORDER BY id DESC LIMIT 1`,
            [`HMA${formattedDate}%`]
          );
      
          let newId;
          if (latestIdResult.rows.length > 0) {
            const latestId = latestIdResult.rows[0].id;
            const latestNumber = parseInt(latestId.slice(-2));
            newId = `HMA${formattedDate}${(latestNumber + 1).toString().padStart(2, '0')}`;
          } else {
            newId = `HMA${formattedDate}01`;
          }
      
          const timestamp = currentDate.format('YYYY-MM-DD HH:mm:ss');
      
          const result = await poolNisa.query(
            `INSERT INTO homepass_moving_address_request (
              id, timestamp, full_name_pic, submission_from, request_source, customer_cid, current_address,
              destination_address, coordinate_point, request_purpose, email_address,
              hpm_check_result, network, home_id_status, remarks, notes_recommendations,
              hpm_pic, status, completion_date, photo_front_of_house_url, photo_left_of_home_url, 
              photo_right_of_home_url, photo_old_fat_url, photo_new_fat_url,
              response_hpm_location, response_hpm_source, response_hpm_status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27)
            RETURNING *`,
            [
              newId,
              timestamp,
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
              imageUrlNewFat,
              response_hpm_location,
              response_hpm_source,
              'Untaken'  // Default value for response_hpm_status
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
          imageUrlNewFat,
          response_hpm_location,
          response_hpm_source
        } = req.body;
      
        try {
          const existingData = await poolNisa.query('SELECT * FROM homepass_moving_address_request WHERE id = $1', [id]);
          
          if (existingData.rows.length === 0) {
            return res.status(404).json({ error: 'Record not found' });
          }
      
          const existingRecord = existingData.rows[0];
      
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
              photo_new_fat_url = $22,
              response_hpm_location = $23,
              response_hpm_source = $24,
              response_hpm_status = $25
            WHERE id = $26
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
              response_hpm_location || existingRecord.response_hpm_location,
              response_hpm_source || existingRecord.response_hpm_source,
              'Untaken',  // Default value for response_hpm_status
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
        const { name } = req.userAccount;
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
          completion_date,
          response_hpm_location,
          response_hpm_source
        } = req.body;
      
        try {
          const currentTimestamp = new Date().toISOString();
      
          const result = await poolNisa.query(
            `UPDATE homepass_moving_address_request SET
              full_name_pic = $1, submission_from = $2, request_source = $3, customer_cid = $4,
              current_address = $5, destination_address = $6, coordinate_point = $7, house_photo = $8,
              request_purpose = $9, email_address = $10, hpm_check_result = $11, homepass_id = $12,
              network = $13, home_id_status = $14, remarks = $15, notes_recommendations = $16,
              hpm_pic = $17, status = $18, completion_date = $19,
              response_hpm_location = $20, response_hpm_source = $21,
              response_hpm_status = $22, response_hpm_timestamp = $23
            WHERE id = $24
            RETURNING *`,
            [
              uploadResult.fullNamePic, uploadResult.submissionFrom, uploadResult.requestSource, uploadResult.customerCid, 
              current_address, destination_address, coordinate_point, uploadResult.housePhotoUrl, 
              request_purpose, email_address, hpm_check_result, uploadResult.homepassId, 
              network, home_id_status, remarks, notes_recommendations,
              name, status, completion_date,
              response_hpm_location,
              response_hpm_source,
              'Untaken',  // Default value for response_hpm_status
              currentTimestamp,  // Current timestamp for response_hpm_timestamp
              id
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

      static async updateSurveyOpsData(req, res) {
        try {
          const { id } = req.params;
          const {
            freitag_survey_ops,
            photo1_survey_ops,
            photo2_survey_ops,
            photo3_survey_ops,
            photo4_survey_ops,
            notes_survey_ops
          } = req.body;
      
          const updateQuery = `
            UPDATE homepass_moving_address_request
            SET
              freitag_survey_ops = $1,
              photo1_survey_ops = $2,
              photo2_survey_ops = $3,
              photo3_survey_ops = $4,
              photo4_survey_ops = $5,
              notes_survey_ops = $6,
              response_hpm_status = $7
            WHERE id = $8
            RETURNING *
          `;
      
          const values = [
            freitag_survey_ops,
            photo1_survey_ops,
            photo2_survey_ops,
            photo3_survey_ops,
            photo4_survey_ops,
            notes_survey_ops,
            "Untaken",
            id
          ];
      
          const result = await poolNisa.query(updateQuery, values);
      
          if (result.rows.length === 0) {
            return res.status(404).json({ error: "Record not found" });
          }
      
          res.status(200).json({
            updatedRecord: result.rows[0]
          });
        } catch (error) {
          console.error('Error updating Survey Ops data:', error);
          res.status(500).json({ error: "Internal Server Error" });
        }
      }
}

module.exports = HomepassController