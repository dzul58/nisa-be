const { verifyToken } = require("../helpers/jwt");
const poolNisa = require("../config/configNisa");

const authentication = async (req, res, next) => {
  try {
    const { authorization } = req.headers;

    if (!authorization) {
      throw new Error('Authorization header is missing');
    }

    const accessToken = authorization.split(" ")[1];

    if (!accessToken) {
      throw new Error('Token is missing');
    }

    const jwtPayload = verifyToken(accessToken);
    const result = await poolNisa.query(
      `SELECT
        u.muse_name,
        u.muse_code,
        u.muse_email,
        CASE
          WHEN p.mupf_name IN ('Customer Service', 'HPM') THEN p.mupf_name
          ELSE 'View Only'
        END AS mupf_name
      FROM
        mst_user u
      JOIN
        mst_user_group g ON u.muse_code = g.mugr_muse_code
      JOIN
        mst_user_profile p ON g.mugr_mupf_code = p.mupf_code
      WHERE
        u.muse_email = $1`,
      [jwtPayload.email]
    );
    const user = result.rows[0];

    if (!user) {
      throw new Error('User not found');
    }

        // Manipulate mupf_name as requested
    // console.log(user.muse_name, "ini muse_name");
    const formatName = user.muse_code
      .split('.') // Split by dot
      .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
      .join(' '); // Join with space


    req.userAccount = {
      email: user.muse_email,
      name: formatName,
      username: user.muse_code,
      role: user.mupf_name
    };

    // console.log(req.userAccount, "ini isinya");

    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    res.status(401).json({ error: 'Unauthorized' });
  }
};

module.exports = authentication;
