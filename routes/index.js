/* GET home page. */


module.exports = function (_dir, _fs, express) {
  var router = express.Router();

  return router.get("/",(req, res, next) => {
    console.log("ok==========");
    res.render("index", { title: "Tech Descord" });
  });
};
