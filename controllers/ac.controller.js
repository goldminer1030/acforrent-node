// models
const models = require("../models");


class AcController {
    constructor(app) {
        this._app = app;
        this._model = models.ac;

        this._initRoutes();
    }

    _initRoutes() {
        this._app.get("/acs", (request, response) => {
            const query = request.query;

            this._model.findAll({ where: query })
                .then((acs) => {
                    response.json({
                        status: "success",
                        data: acs
                    });
                })
                .catch((error) => {
                    response.json({
                        status: "error"
                    });
                });
        });

        this._app.post("/acs", (request, response) => {
            const ac = this._model.build(request.body);

            ac.save()
                .then((createdAC) => {
                    response.json({
                        status: "success",
                        data: createdAC
                    });
                })
                .catch((error) => {
                    response.json({
                        status: "error",
                        data: ac
                    })
                });
        });

        this._app.put("/acs", (request, response) => {
            const ac = request.body;

            this._model.findOne({ where: { id: ac.id } })
                .then((foundAC) => foundAC.update(ac))
                .then((updatedAC) => {
                    response.json({
                        status: "success",
                        data: updatedAC
                    })
                })
                .catch((error) => {
                    response.json({
                        status: "error",
                        data: ac
                    });
                });
        });

        this._app.delete("/acs", (request, response) => {
            const ac = request.body;

            this._model.findOne({ where: { id: ac.id } })
                .then((foundAC) => foundAC.destroy())
                .then((deletedAC) => {
                    response.json({
                        status: "success",
                        data: deletedAC
                    });
                })
                .catch((error) => {
                    response.json({
                        status: "error",
                        data: ac
                    });
                });
        });
    }
}


module.exports = AcController;