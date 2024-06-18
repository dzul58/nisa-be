const { verifyToken } = require("../helpers/jwt");
const pool = require('../config/config')

const authentication = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    console.log(authorization, "authorization");
    const accessToken = authorization.split(" ")[1];
    // console.log(accessToken, "accessToken");
    const jwtPayload = verifyToken(accessToken);
    // console.log(jwtPayload, "jwtPayload");
      const result = await pool.query('SELECT * FROM user_test WHERE id = $1', [jwtPayload.id]);
    const user = result.rows[0];

    // console.log(user, "user");

    if (!user) {
      throw { name: "NotFound" };
    }

    req.userAccount = {
      id: user.id,
      name: user.email,
      name: user.name,
      role: user.role
    };
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authentication;