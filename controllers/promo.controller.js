// models
const models = require("../models");


class PromoController {
    constructor(app) {
        this._app = app;
        this._model = models.promo;

        this._initRoutes();
    }

    _initRoutes() {
        this._app.get("/check-promo", (request, response) => {
            const query = request.query;

            this._model.findOne({ where: query })
                .then((promo) => {
                    response.json({
                        status: "success",
                        data: promo
                    });
                })
                .catch((error) => {
                    response.json({
                        status: "error"
                    });
                });
        });

        this._app.get("/promos", (request, response) => {
            const query = request.query;

            this._model.findAll({ where: query })
                .then((promos) => {
                    response.json({
                        status: "success",
                        data: promos
                    });
                })
                .catch((error) => {
                    response.json({
                        status: "error"
                    });
                });
        });

        this._app.post("/promos", (request, response) => {
            const promo = this._model.build(request.body);

            promo.save()
                .then((createdPromo) => {
                    response.json({
                        status: "success",
                        data: createdPromo
                    });
                })
                .catch((error) => {
                    response.json({
                        status: "error",
                        data: promo
                    })
                });
        });

        this._app.put("/promos", (request, response) => {
            const promo = request.body;

            this._model.findOne({ where: { id: promo.id } })
                .then((foundPromo) => foundPromo.update(promo))
                .then((updatedPromo) => {
                    response.json({
                        status: "success",
                        data: updatedPromo
                    })
                })
                .catch((error) => {
                    response.json({
                        status: "error",
                        data: promo
                    });
                });
        });

        this._app.delete("/promos", (request, response) => {
            const promo = request.body;

            this._model.findOne({ where: { id: promo.id } })
                .then((foundPromo) => foundPromo.destroy())
                .then((deletedPromo) => {
                    response.json({
                        status: "success",
                        data: deletedPromo
                    });
                })
                .catch((error) => {
                    response.json({
                        status: "error",
                        data: promo
                    });
                });
        });
    }
}


module.exports = PromoController;