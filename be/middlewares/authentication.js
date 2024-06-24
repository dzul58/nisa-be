const { verifyToken } = require("../helpers/jwt");
const poolNisa = require("../config/configNisa");

const authentication = async (req, res, next) => {
  try {
    const { authorization } = req.headers;

    console.log( authorization, "authorization");

    if (!authorization) {
      throw new Error('Authorization header is missing');
    }

    const accessToken = authorization.split(" ")[1];

    if (!accessToken) {
      throw new Error('Token is missing');
    }

    const jwtPayload = verifyToken(accessToken);
    const result = await poolNisa.query('SELECT * FROM mst_user WHERE muse_email = $1', [jwtPayload.email]);
    const user = result.rows[0];

    if (!user) {
      throw new Error('User not found');
    }

    req.userAccount = {
      email: user.muse_email,
      name: user.muse_name,
      username: user.muse_code
    };

    // console.log(req.userAccount, "ini isinya");
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    res.status(401).json({ error: 'Unauthorized' });
  }
};

module.exports = authentication;
