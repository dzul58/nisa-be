const { verifyToken } = require("../helpers/jwt");
const pool = require('../config/config');
const poolNisa = require("../config/configNisa");

const authentication = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    // console.log(authorization, "authorization");
    const accessToken = authorization.split(" ")[1];
    console.log(accessToken, "accessToken");
    const jwtPayload = verifyToken(accessToken);
    console.log(jwtPayload, "jwtPayload");
      const result = await poolNisa.query('SELECT * FROM mst_user WHERE muse_email = $1', [jwtPayload.email]);
    const user = result.rows[0];

    // console.log(user, "user");

    if (!user) {
      throw { name: "NotFound" };
    }

    req.userAccount = {
      email: user.muse_email,
      // name: user.muse_name,
    };
    // console.log(req.userAccount, "ini akuuun user");
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authentication;