const { authJwt } = require("../middlewares");
const controller = require("../controllers/tilemap.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });
  console.log("app.gettilemap");
  app.get(
    
    "/api/tilemap/create", controller.createMap
    );
};
