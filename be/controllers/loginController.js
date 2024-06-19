const { compareTextWithHash } = require("../helpers/md5");
const { signToken } = require("../helpers/jwt");
const poolNisa = require('../config/configNisa');

class LoginController {
    static async login(req, res, next) {
        try {
          const { email, password } = req.body;
    
          if (!email) {
            return res.status(400).json({ error: "Email is required" });
          }
    
          if (!password) {
            return res.status(400).json({ error: "Password is required" });
          }
    
          const result = await poolNisa.query('SELECT * FROM mst_user WHERE muse_email = $1', [email]);
          const user = result.rows[0];
          console.log(user.muse_email, "ini user");
    
          if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
          }
    
          const isValidPassword = compareTextWithHash(password, user.muse_password);
    
          if (!isValidPassword) {
            return res.status(401).json({ error: "Invalid email or password" });
          }
 
          const payload = { email: user.muse_email, otherData: 'someValue' };
          const accessToken = signToken(payload);
    
          res.json({ access_token: accessToken });
        } catch (error) {
          next(error);
        }
      }
}

module.exports = LoginController;