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
        hpm_check_result,
        page = 1,
        limit = 25
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

      if (hpm_check_result) {
        filters.push(`hpm_check_result ILIKE $${filterValues.length + 1}`);
        filterValues.push(`%${hpm_check_result}%`);
      }

      const offset = (page - 1) * limit;

      const query = `
      SELECT * FROM homepass_moving_address_request 
      ${filters.length > 0 ? "WHERE " + filters.join(" AND ") : ""}
      ORDER BY 
        CASE 
          WHEN status IS NULL THEN 1
          WHEN status ILIKE 'Pending' THEN 2
          WHEN status ILIKE 'Done' THEN 3
          ELSE 4
        END,
        id DESC 
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
          status
        } = req.body;
      
        try {
          const currentTimestamp = moment().format('YYYY-MM-DD HH:mm:ss');
          
          // Set completion_date based on status
          const newCompletionDate = status === 'Done' ? currentTimestamp : null;
    
          // Fetch the current record to check existing values
          const currentRecord = await poolNisa.query(
            'SELECT hpm_pic, response_hpm_timestamp FROM homepass_moving_address_request WHERE id = $1',
            [id]
          );
    
          // Determine values for hpm_pic and response_hpm_timestamp
          const newHpmPic = currentRecord.rows[0].hpm_pic || name;
          const newResponseHpmTimestamp = currentRecord.rows[0].response_hpm_timestamp || currentTimestamp;
    
          const result = await poolNisa.query(
            `UPDATE homepass_moving_address_request SET
              full_name_pic = $1, submission_from = $2, request_source = $3, customer_cid = $4,
              current_address = $5, destination_address = $6, coordinate_point = $7, house_photo = $8,
              request_purpose = $9, email_address = $10, hpm_check_result = $11, homepass_id = $12,
              network = $13, home_id_status = $14, remarks = $15, notes_recommendations = $16,
              hpm_pic = $17, status = $18, completion_date = $19,
              response_hpm_status = $20, response_hpm_timestamp = $21
            WHERE id = $22
            RETURNING *`,
            [
              uploadResult.fullNamePic, uploadResult.submissionFrom, uploadResult.requestSource, uploadResult.customerCid, 
              current_address, destination_address, coordinate_point, uploadResult.housePhotoUrl, 
              request_purpose, email_address, hpm_check_result, uploadResult.homepassId, 
              network, home_id_status, remarks, notes_recommendations,
              newHpmPic, status, newCompletionDate,
              'Untaken',  // Default value for response_hpm_status
              newResponseHpmTimestamp,
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

      // static async updateHomepassRequest(req, res) {
      //   const { id } = req.params;
      //   const { name } = req.userAccount;
      //   const {
      //     uploadResult,
      //     current_address,
      //     destination_address,
      //     coordinate_point,
      //     request_purpose,
      //     email_address,
      //     hpm_check_result,
      //     network,
      //     home_id_status,
      //     remarks,
      //     notes_recommendations,
      //     status
      //   } = req.body;
      
      //   try {
      //     const currentTimestamp = moment().format('YYYY-MM-DD HH:mm:ss');
          
      //     // Ambil data record saat ini
      //     const currentRecord = await poolNisa.query(
      //       'SELECT hpm_pic, response_hpm_timestamp, completion_date, status FROM homepass_moving_address_request WHERE id = $1',
      //       [id]
      //     );
      
      //     if (currentRecord.rows.length === 0) {
      //       return res.status(404).json({ error: 'Record tidak ditemukan' });
      //     }
      
      //     const existingRecord = currentRecord.rows[0];
      
      //     // Tentukan nilai untuk hpm_pic, response_hpm_timestamp, dan completion_date
      //     const newHpmPic = existingRecord.hpm_pic || name;
      //     const newResponseHpmTimestamp = existingRecord.response_hpm_timestamp || currentTimestamp;
      //     const newCompletionDate = status === 'Done' ? (existingRecord.completion_date || currentTimestamp) : null;
      
      //     // Update tabel homepass_moving_address_request
      //     const result = await poolNisa.query(
      //       `UPDATE homepass_moving_address_request SET
      //         full_name_pic = $1, submission_from = $2, request_source = $3, customer_cid = $4,
      //         current_address = $5, destination_address = $6, coordinate_point = $7, house_photo = $8,
      //         request_purpose = $9, email_address = $10, hpm_check_result = $11, homepass_id = $12,
      //         network = $13, home_id_status = $14, remarks = $15, notes_recommendations = $16,
      //         hpm_pic = $17, status = $18, completion_date = $19,
      //         response_hpm_status = $20, response_hpm_timestamp = $21
      //       WHERE id = $22
      //       RETURNING *`,
      //       [
      //         uploadResult.fullNamePic, uploadResult.submissionFrom, uploadResult.requestSource, uploadResult.customerCid, 
      //         current_address, destination_address, coordinate_point, uploadResult.housePhotoUrl, 
      //         request_purpose, email_address, hpm_check_result, uploadResult.homepassId, 
      //         network, home_id_status, remarks, notes_recommendations,
      //         newHpmPic, status, newCompletionDate,
      //         'Untaken',  // Nilai default untuk response_hpm_status
      //         newResponseHpmTimestamp,
      //         id
      //       ]
      //     );
      
      //     // Hitung waktu penyelesaian
      //     let completionTime = '00:00:00';
      //     if (newCompletionDate && newResponseHpmTimestamp) {
      //       const duration = moment.duration(moment(newCompletionDate).diff(moment(newResponseHpmTimestamp)));
      //       completionTime = moment.utc(duration.asMilliseconds()).format('HH:mm:ss');
      //     }
      
      //     // Update tabel homepass_moving_address_hpm_kpi
      //     const updateKpiQuery = `
      //       WITH upsert AS (
      //         UPDATE homepass_moving_address_hpm_kpi
      //         SET 
      //           total_tickets = total_tickets + 
      //             CASE WHEN $4::timestamp IS NOT NULL AND total_tickets = 0 THEN 1 ELSE 0 END,
      //           completed_tickets = completed_tickets + 
      //             CASE 
      //               WHEN $5 = 'Done' AND $6::timestamp IS NOT NULL AND (completed_tickets = 0 OR $6::timestamp > create_verify_date) THEN 1
      //               WHEN $5 != 'Done' AND $7 = 'Done' THEN -1
      //               ELSE 0 
      //             END,
      //           total_completion_time = 
      //             CASE 
      //               WHEN $5 = 'Done' AND $6::timestamp IS NOT NULL THEN 
      //                 (total_completion_time::interval + $8::interval)::varchar
      //               WHEN $5 != 'Done' AND $7 = 'Done' THEN 
      //                 GREATEST((total_completion_time::interval - $8::interval)::interval, '00:00:00'::interval)::varchar
      //               ELSE total_completion_time
      //             END
      //         WHERE hpm_pic_name = $1 AND create_verify_date = $3::date
      //         RETURNING *
      //       )
      //       INSERT INTO homepass_moving_address_hpm_kpi (
      //         hpm_pic_name, day, create_verify_date, total_tickets, completed_tickets, total_completion_time
      //       )
      //       SELECT 
      //         $1, $2, $3::date, 
      //         CASE WHEN $4::timestamp IS NOT NULL THEN 1 ELSE 0 END,
      //         CASE WHEN $5 = 'Done' AND $6::timestamp IS NOT NULL THEN 1 ELSE 0 END,
      //         CASE WHEN $5 = 'Done' AND $6::timestamp IS NOT NULL THEN $8 ELSE '00:00:00' END
      //       WHERE NOT EXISTS (SELECT 1 FROM upsert)
      //     `;
      
      //     await poolNisa.query(updateKpiQuery, [
      //       newHpmPic,
      //       moment(newResponseHpmTimestamp).format('dddd'),
      //       moment(newResponseHpmTimestamp).format('YYYY-MM-DD'),
      //       newResponseHpmTimestamp,
      //       status,
      //       newCompletionDate,
      //       existingRecord.status,
      //       completionTime
      //     ]);
      
      //     // Hitung dan update average_completion_time
      //     const updateAverageQuery = `
      //       UPDATE homepass_moving_address_hpm_kpi
      //       SET average_completion_time = 
      //         CASE 
      //           WHEN completed_tickets > 0 THEN 
      //             (total_completion_time::interval / completed_tickets)::varchar
      //           ELSE '00:00:00'
      //         END
      //       WHERE hpm_pic_name = $1 AND create_verify_date = $2::date
      //     `;
      
      //     await poolNisa.query(updateAverageQuery, [
      //       newHpmPic,
      //       moment(newResponseHpmTimestamp).format('YYYY-MM-DD')
      //     ]);
      
      //     res.status(200).json(result.rows[0]);
      //   } catch (error) {
      //     console.error('Error in updateHomepassRequest:', error);
      //     res.status(500).json({ error: 'Internal Server Error', details: error.message });
      //   }
      // }

    //   static async updateHomepassRequest(req, res) {
    //     const { id } = req.params;
    //     const { name } = req.userAccount;
    //     const {
    //         uploadResult,
    //         current_address,
    //         destination_address,
    //         coordinate_point,
    //         request_purpose,
    //         email_address,
    //         hpm_check_result,
    //         network,
    //         home_id_status,
    //         remarks,
    //         notes_recommendations,
    //         status
    //     } = req.body;
    
    //     try {
    //         const currentTimestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    
    //         // Ambil data record saat ini
    //         const currentRecord = await poolNisa.query(
    //             'SELECT hpm_pic, response_hpm_timestamp, completion_date, status FROM homepass_moving_address_request WHERE id = $1',
    //             [id]
    //         );
    
    //         if (currentRecord.rows.length === 0) {
    //             return res.status(404).json({ error: 'Record tidak ditemukan' });
    //         }
    
    //         const existingRecord = currentRecord.rows[0];
    
    //         // Tentukan nilai untuk hpm_pic, response_hpm_timestamp, dan completion_date
    //         const newHpmPic = existingRecord.hpm_pic || name;
    //         const newResponseHpmTimestamp = existingRecord.response_hpm_timestamp || currentTimestamp;
    //         const newCompletionDate = status === 'Done' ? (existingRecord.completion_date || currentTimestamp) : null;
    
    //         // Update tabel homepass_moving_address_request
    //         const result = await poolNisa.query(
    //             `UPDATE homepass_moving_address_request SET
    //                 full_name_pic = $1, submission_from = $2, request_source = $3, customer_cid = $4,
    //                 current_address = $5, destination_address = $6, coordinate_point = $7, house_photo = $8,
    //                 request_purpose = $9, email_address = $10, hpm_check_result = $11, homepass_id = $12,
    //                 network = $13, home_id_status = $14, remarks = $15, notes_recommendations = $16,
    //                 hpm_pic = $17, status = $18, completion_date = $19,
    //                 response_hpm_status = $20, response_hpm_timestamp = $21
    //             WHERE id = $22
    //             RETURNING *`,
    //             [
    //                 uploadResult.fullNamePic, uploadResult.submissionFrom, uploadResult.requestSource, uploadResult.customerCid,
    //                 current_address, destination_address, coordinate_point, uploadResult.housePhotoUrl,
    //                 request_purpose, email_address, hpm_check_result, uploadResult.homepassId,
    //                 network, home_id_status, remarks, notes_recommendations,
    //                 newHpmPic, status, newCompletionDate,
    //                 'Untaken',  // Nilai default untuk response_hpm_status
    //                 newResponseHpmTimestamp,
    //                 id
    //             ]
    //         );
    
    //         // Hitung waktu penyelesaian
    //         let completionTime = '00:00:00';
    //         if (newCompletionDate && newResponseHpmTimestamp) {
    //             const duration = moment.duration(moment(newCompletionDate).diff(moment(newResponseHpmTimestamp)));
    //             completionTime = moment.utc(duration.asMilliseconds()).format('HH:mm:ss');
    //         }
    
    //         // Update tabel homepass_moving_address_hpm_kpi
    //         const updateKpiQuery = `
    //             WITH upsert AS (
    //                 UPDATE homepass_moving_address_hpm_kpi
    //                 SET 
    //                     total_tickets = total_tickets + 
    //                         CASE WHEN $4::timestamp IS NOT NULL AND total_tickets = 0 THEN 1 ELSE 0 END,
    //                     completed_tickets = completed_tickets + 
    //                         CASE 
    //                             WHEN $5 = 'Done' AND $6::timestamp IS NOT NULL AND (completed_tickets = 0 OR $6::timestamp > create_verify_date) THEN 1
    //                             WHEN $5 != 'Done' AND $7 = 'Done' THEN -1
    //                             ELSE 0 
    //                         END,
    //                     total_completion_time = 
    //                         CASE 
    //                             WHEN $5 = 'Done' AND $6::timestamp IS NOT NULL THEN 
    //                                 (total_completion_time::interval + $8::interval)::varchar
    //                             WHEN $5 != 'Done' AND $7 = 'Done' THEN 
    //                                 GREATEST((total_completion_time::interval - $8::interval)::interval, '00:00:00'::interval)::varchar
    //                             ELSE total_completion_time
    //                         END
    //                 WHERE hpm_pic_name = $1 AND create_verify_date = $3::date
    //                 RETURNING *
    //             )
    //             INSERT INTO homepass_moving_address_hpm_kpi (
    //                 hpm_pic_name, day, create_verify_date, total_tickets, completed_tickets, total_completion_time
    //             )
    //             SELECT 
    //                 $1, $2, $3::date, 
    //                 CASE WHEN $4::timestamp IS NOT NULL THEN 1 ELSE 0 END,
    //                 CASE WHEN $5 = 'Done' AND $6::timestamp IS NOT NULL THEN 1 ELSE 0 END,
    //                 CASE WHEN $5 = 'Done' AND $6::timestamp IS NOT NULL THEN $8 ELSE '00:00:00' END
    //             WHERE NOT EXISTS (SELECT 1 FROM upsert)
    //         `;
    
    //         await poolNisa.query(updateKpiQuery, [
    //             newHpmPic,
    //             moment(newResponseHpmTimestamp).format('dddd'),
    //             moment(newResponseHpmTimestamp).format('YYYY-MM-DD'),
    //             newResponseHpmTimestamp,
    //             status,
    //             newCompletionDate,
    //             existingRecord.status,
    //             completionTime
    //         ]);
    
    //         // Update total_tickets jika response_hpm_timestamp berubah menjadi tidak null
    //         if (!existingRecord.response_hpm_timestamp && newResponseHpmTimestamp) {
    //             await poolNisa.query(`
    //                 UPDATE homepass_moving_address_hpm_kpi
    //                 SET total_tickets = total_tickets + 1
    //                 WHERE hpm_pic_name = $1 AND create_verify_date = $2::date
    //             `, [
    //                 newHpmPic,
    //                 moment(newResponseHpmTimestamp).format('YYYY-MM-DD')
    //             ]);
    //         }
    
    //         // Update completed_tickets jika status berubah menjadi 'Done' atau bukan 'Done'
    //         if (existingRecord.status !== 'Done' && status === 'Done') {
    //             await poolNisa.query(`
    //                 UPDATE homepass_moving_address_hpm_kpi
    //                 SET completed_tickets = completed_tickets + 1
    //                 WHERE hpm_pic_name = $1 AND create_verify_date = $2::date
    //             `, [
    //                 newHpmPic,
    //                 moment(newResponseHpmTimestamp).format('YYYY-MM-DD')
    //             ]);
    //         } else if (existingRecord.status === 'Done' && status !== 'Done') {
    //             await poolNisa.query(`
    //                 UPDATE homepass_moving_address_hpm_kpi
    //                 SET completed_tickets = completed_tickets - 1
    //                 WHERE hpm_pic_name = $1 AND create_verify_date = $2::date
    //             `, [
    //                 newHpmPic,
    //                 moment(newResponseHpmTimestamp).format('YYYY-MM-DD')
    //             ]);
    //         }
    
    //         // Hitung dan update average_completion_time
    //         const updateAverageQuery = `
    //             UPDATE homepass_moving_address_hpm_kpi
    //             SET average_completion_time = 
    //                 CASE 
    //                     WHEN completed_tickets > 0 THEN 
    //                         (total_completion_time::interval / completed_tickets)::varchar
    //                     ELSE '00:00:00'
    //                 END
    //             WHERE hpm_pic_name = $1 AND create_verify_date = $2::date
    //         `;
    
    //         await poolNisa.query(updateAverageQuery, [
    //             newHpmPic,
    //             moment(newResponseHpmTimestamp).format('YYYY-MM-DD')
    //         ]);
    
    //         res.status(200).json(result.rows[0]);
    //     } catch (error) {
    //         console.error('Error in updateHomepassRequest:', error);
    //         res.status(500).json({ error: 'Internal Server Error', details: error.message });
    //     }
    // }
    
    // setelah saya jalankan terdapat beberapa kesalahan pada code dimana saat pertama kali update  response_hpm_timestamp diubah menjadi tidak null kenapa total_tickets memiliki value 2 harusnya 1. 
    // dan pada completed_tickets terkadang menjadi ditambah dan dikurang 2 bukan 1?
      
    //   static async updateHomepassRequest(req, res) {
    //     const { id } = req.params;
    //     const { name } = req.userAccount;
    //     const {
    //         uploadResult,
    //         current_address,
    //         destination_address,
    //         coordinate_point,
    //         request_purpose,
    //         email_address,
    //         hpm_check_result,
    //         network,
    //         home_id_status,
    //         remarks,
    //         notes_recommendations,
    //         status
    //     } = req.body;
    
    //     try {
    //         const currentTimestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    
    //         // Ambil data record saat ini
    //         const currentRecord = await poolNisa.query(
    //             'SELECT hpm_pic, response_hpm_timestamp, completion_date, status FROM homepass_moving_address_request WHERE id = $1',
    //             [id]
    //         );
    
    //         if (currentRecord.rows.length === 0) {
    //             return res.status(404).json({ error: 'Record tidak ditemukan' });
    //         }
    
    //         const existingRecord = currentRecord.rows[0];
    
    //         // Tentukan nilai untuk hpm_pic, response_hpm_timestamp, dan completion_date
    //         const newHpmPic = existingRecord.hpm_pic || name;
    //         const newResponseHpmTimestamp = existingRecord.response_hpm_timestamp || currentTimestamp;
    //         const newCompletionDate = status === 'Done' ? (existingRecord.completion_date || currentTimestamp) : null;
    
    //         // Update tabel homepass_moving_address_request
    //         const result = await poolNisa.query(
    //             `UPDATE homepass_moving_address_request SET
    //                 full_name_pic = $1, submission_from = $2, request_source = $3, customer_cid = $4,
    //                 current_address = $5, destination_address = $6, coordinate_point = $7, house_photo = $8,
    //                 request_purpose = $9, email_address = $10, hpm_check_result = $11, homepass_id = $12,
    //                 network = $13, home_id_status = $14, remarks = $15, notes_recommendations = $16,
    //                 hpm_pic = $17, status = $18, completion_date = $19,
    //                 response_hpm_status = $20, response_hpm_timestamp = $21
    //             WHERE id = $22
    //             RETURNING *`,
    //             [
    //                 uploadResult.fullNamePic, uploadResult.submissionFrom, uploadResult.requestSource, uploadResult.customerCid,
    //                 current_address, destination_address, coordinate_point, uploadResult.housePhotoUrl,
    //                 request_purpose, email_address, hpm_check_result, uploadResult.homepassId,
    //                 network, home_id_status, remarks, notes_recommendations,
    //                 newHpmPic, status, newCompletionDate,
    //                 'Untaken',  // Nilai default untuk response_hpm_status
    //                 newResponseHpmTimestamp,
    //                 id
    //             ]
    //         );
    
    //         // Hitung waktu penyelesaian
    //         let completionTime = '00:00:00';
    //         if (newCompletionDate && newResponseHpmTimestamp) {
    //             const duration = moment.duration(moment(newCompletionDate).diff(moment(newResponseHpmTimestamp)));
    //             completionTime = moment.utc(duration.asMilliseconds()).format('HH:mm:ss');
    //         }
    
    //         // Update tabel homepass_moving_address_hpm_kpi
    //         const updateKpiQuery = `
    //             WITH upsert AS (
    //                 UPDATE homepass_moving_address_hpm_kpi
    //                 SET 
    //                     total_tickets = total_tickets + 
    //                         CASE WHEN $4::timestamp IS NOT NULL AND total_tickets = 0 THEN 1 ELSE 0 END,
    //                     completed_tickets = completed_tickets + 
    //                         CASE 
    //                             WHEN $5 = 'Done' AND $6::timestamp IS NOT NULL AND (completed_tickets = 0 OR $6::timestamp > create_verify_date) THEN 1
    //                             WHEN $5 != 'Done' AND $7 = 'Done' THEN -1
    //                             ELSE 0 
    //                         END,
    //                     total_completion_time = 
    //                         CASE 
    //                             WHEN $5 = 'Done' AND $6::timestamp IS NOT NULL THEN 
    //                                 (total_completion_time::interval + $8::interval)::varchar
    //                             WHEN $5 != 'Done' AND $7 = 'Done' THEN 
    //                                 GREATEST((total_completion_time::interval - $8::interval)::interval, '00:00:00'::interval)::varchar
    //                             ELSE total_completion_time
    //                         END
    //                 WHERE hpm_pic_name = $1 AND create_verify_date = $3::date
    //                 RETURNING *
    //             )
    //             INSERT INTO homepass_moving_address_hpm_kpi (
    //                 hpm_pic_name, day, create_verify_date, total_tickets, completed_tickets, total_completion_time
    //             )
    //             SELECT 
    //                 $1, $2, $3::date, 
    //                 CASE WHEN $4::timestamp IS NOT NULL THEN 1 ELSE 0 END,
    //                 CASE WHEN $5 = 'Done' AND $6::timestamp IS NOT NULL THEN 1 ELSE 0 END,
    //                 CASE WHEN $5 = 'Done' AND $6::timestamp IS NOT NULL THEN $8 ELSE '00:00:00' END
    //             WHERE NOT EXISTS (SELECT 1 FROM upsert)
    //         `;
    
    //         await poolNisa.query(updateKpiQuery, [
    //             newHpmPic,
    //             moment(newResponseHpmTimestamp).format('dddd'),
    //             moment(newResponseHpmTimestamp).format('YYYY-MM-DD'),
    //             newResponseHpmTimestamp,
    //             status,
    //             newCompletionDate,
    //             existingRecord.status,
    //             completionTime
    //         ]);
    
    //         // Update total_tickets jika response_hpm_timestamp berubah menjadi tidak null
    //         if (!existingRecord.response_hpm_timestamp && newResponseHpmTimestamp) {
    //             await poolNisa.query(`
    //                 UPDATE homepass_moving_address_hpm_kpi
    //                 SET total_tickets = total_tickets + 1
    //                 WHERE hpm_pic_name = $1 AND create_verify_date = $2::date
    //             `, [
    //                 newHpmPic,
    //                 moment(newResponseHpmTimestamp).format('YYYY-MM-DD')
    //             ]);
    //         }
    
    //         // Update completed_tickets jika status berubah menjadi 'Done' atau bukan 'Done'
    //         if (existingRecord.status !== 'Done' && status === 'Done') {
    //             await poolNisa.query(`
    //                 UPDATE homepass_moving_address_hpm_kpi
    //                 SET completed_tickets = completed_tickets + 1
    //                 WHERE hpm_pic_name = $1 AND create_verify_date = $2::date
    //             `, [
    //                 newHpmPic,
    //                 moment(newResponseHpmTimestamp).format('YYYY-MM-DD')
    //             ]);
    //         } else if (existingRecord.status === 'Done' && status !== 'Done') {
    //             await poolNisa.query(`
    //                 UPDATE homepass_moving_address_hpm_kpi
    //                 SET completed_tickets = completed_tickets - 1
    //                 WHERE hpm_pic_name = $1 AND create_verify_date = $2::date
    //             `, [
    //                 newHpmPic,
    //                 moment(newResponseHpmTimestamp).format('YYYY-MM-DD')
    //             ]);
    //         }
    
    //         // Hitung dan update average_completion_time
    //         const updateAverageQuery = `
    //             UPDATE homepass_moving_address_hpm_kpi
    //             SET average_completion_time = 
    //                 CASE 
    //                     WHEN completed_tickets > 0 THEN 
    //                         (total_completion_time::interval / completed_tickets)::varchar
    //                     ELSE '00:00:00'
    //                 END
    //             WHERE hpm_pic_name = $1 AND create_verify_date = $2::date
    //         `;
    
    //         await poolNisa.query(updateAverageQuery, [
    //             newHpmPic,
    //             moment(newResponseHpmTimestamp).format('YYYY-MM-DD')
    //         ]);
    
    //         res.status(200).json(result.rows[0]);
    //     } catch (error) {
    //         console.error('Error in updateHomepassRequest:', error);
    //         res.status(500).json({ error: 'Internal Server Error', details: error.message });
    //     }
    // }
  

    


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
            photo1_survey_ops,
            photo2_survey_ops,
            photo3_survey_ops,
            video_survey_ops,
            notes_survey_ops
          } = req.body;
      
          const updateQuery = `
            UPDATE homepass_moving_address_request
            SET
              photo1_survey_ops = $1,
              photo2_survey_ops = $2,
              photo3_survey_ops = $3,
              video_survey_ops = $4,
              notes_survey_ops = $5,
              response_hpm_status = $6
            WHERE id = $7
            RETURNING *
          `;
      
          const values = [
            photo1_survey_ops,
            photo2_survey_ops,
            photo3_survey_ops,
            video_survey_ops,
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

      // static async searchAreas(req, res) {
      //   try {
      //     const { query } = req.query;
      //     const searchQuery = `
      //       SELECT DISTINCT msar_area_name AS area
      //       FROM msts_area 
      //       WHERE msar_area_name ILIKE $1
      //       ORDER BY msar_area_name
      //       LIMIT 10
      //     `;
      //     const result = await poolNisa.query(searchQuery, [`%${query}%`]);
          
      //     const areas = result.rows
      //       .map(row => row.area)
      //       .filter(area => area !== null && area !== '');
          
      //     res.status(200).json(areas);
      //   } catch (error) {
      //     console.error('Error searching areas:', error);
      //     res.status(500).json({ error: 'Internal Server Error' });
      //   }
      // }

      static async searchAreas(req, res) {
        try {
          const query = `
            SELECT DISTINCT msar_area_name AS area
            FROM msts_area 
            WHERE msar_area_name IS NOT NULL AND msar_area_name != ''
            ORDER BY msar_area_name
          `;
          
          const result = await poolNisa.query(query);
          
          const areas = result.rows.map(row => row.area);
          
          res.status(200).json(areas);
        } catch (error) {
          console.error('Error fetching areas:', error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      }

      static async GetAllUpdateHistory(req, res) {
        try {
          const { search } = req.query; // Mengambil parameter pencarian dari query string
          let query = `
            SELECT * 
            FROM homepass_moving_address_update_history
          `;
          let queryParams = [];
      
          // Jika ada parameter pencarian, tambahkan kondisi WHERE
          if (search) {
            query += ` WHERE performed_by ILIKE $1`;
            queryParams.push(`%${search}%`);
          }
      
          // Tambahkan pengurutan berdasarkan waktu terbaru
          query += ` ORDER BY performed_at DESC`;
      
          const result = await poolNisa.query(query, queryParams);
      
          res.status(200).json(result.rows);
        } catch (error) {
          console.error('Error in GetAllUpdateHistory:', error);
          res.status(500).json({ message: 'Internal server error' });
        }
      }
}

module.exports = HomepassController