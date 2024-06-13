const pool = require('../config/config')

const authorizationAdmin = async (req, res, next) => {
  try {
    const { role } = req.userAccount; 

    const validate= await pool.query('SELECT * FROM user_test WHERE role = $1', [role]);
    const user = validate.rows[0];
    
    if (!user) {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (user.role !== "CS SIM") {
      return res.status(403).json({ error: "Forbidden" });
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authorizationAdmin;
