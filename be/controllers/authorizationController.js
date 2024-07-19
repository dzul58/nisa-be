const poolNisa = require('../config/configNisa');

class AuthorizationController{
    static async authorizationCs(req, res, next) {
        try {
          const email = req.userAccount.email;
      
          const query = `
            SELECT
              u.muse_name,
              u.muse_code,
              u.muse_email,
              p.mupf_name
            FROM
              mst_user u
            JOIN
              mst_user_group g ON u.muse_code = g.mugr_muse_code
            JOIN
              mst_user_profile p ON g.mugr_mupf_code = p.mupf_code
            WHERE
              p.mupf_name = 'Customer Service' AND
              u.muse_email = $1
          `;
      
          const result = await poolNisa.query(query, [email]);
      
          if (result.rows.length === 0) {
            return res.status(403).json({ message: 'Access forbidden' });
          }
      
          const userData = result.rows[0];
      
          res.status(200).json({
            name: userData.muse_name,
            username: userData.muse_code,
            email: userData.muse_email,
            role: userData.mupf_name
          });
      
        } catch (error) {
          console.error('Error in authorizationAccess:', error);
          res.status(500).json({ message: 'Internal server error' });
        }
      }

      static async authorizationHpm(req, res, next) {
        try {
          const email = req.userAccount.email;
      
          const query = `
            SELECT
              u.muse_name,
              u.muse_code,
              u.muse_email,
              p.mupf_name
            FROM
              mst_user u
            JOIN
              mst_user_group g ON u.muse_code = g.mugr_muse_code
            JOIN
              mst_user_profile p ON g.mugr_mupf_code = p.mupf_code
            WHERE
              p.mupf_name = 'HPM' AND
              u.muse_email = $1
          `;
      
          const result = await poolNisa.query(query, [email]);
      
          if (result.rows.length === 0) {
            return res.status(403).json({ message: 'Access forbidden' });
          }
      
          const userData = result.rows[0];

          res.status(200).json({
            name: userData.muse_name,
            username: userData.muse_code,
            email: userData.muse_email,
            role: userData.mupf_name
          });
      
        } catch (error) {
          console.error('Error in authorizationAccess:', error);
          res.status(500).json({ message: 'Internal server error' });
        }
      }

      static async updateTakenAccess(req, res, next) {
        try {
          const { id } = req.params;
    
          const query = `
            UPDATE homepass_moving_address_request
            SET response_hpm_status = 'Taken'
            WHERE id = $1
            RETURNING *
          `;
    
          const result = await poolNisa.query(query, [id]);
    
          if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Homepass request not found' });
          }
    
          const updatedRequest = result.rows[0];
          res.status(200).json({ 
            message: 'Response HPM status updated to Taken'
          });
        } catch (error) {
          console.error('Error in updateAccess:', error);
          res.status(500).json({ message: 'Internal server error' });
        }
      }


      static async updateUntakenAccess(req, res, next) {
        try {
          const { id } = req.params;
    
          const query = `
            UPDATE homepass_moving_address_request
            SET response_hpm_status = 'Untaken'
            WHERE id = $1
            RETURNING *
          `;
    
          const result = await poolNisa.query(query, [id]);
    
          if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Homepass request not found' });
          }
    
          const updatedRequest = result.rows[0];
          res.status(200).json({ 
            message: 'Response HPM status updated to Untaken'
          });
        } catch (error) {
          console.error('Error in updateAccess:', error);
          res.status(500).json({ message: 'Internal server error' });
        }
      }
}

module.exports = AuthorizationController