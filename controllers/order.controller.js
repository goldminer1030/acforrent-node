// models
const models = require("../models");


class OrderController {
    constructor(app) {
        this._app = app;
        this._model = models.order;

        this._initRoutes();
    }

    _initRoutes() {
        this._app.get("/orders", (request, response) => {
            const query = request.query;

            this._model.findAll({ where: query })
                .then((orders) => {
                    response.json({
                        status: "success",
                        data: orders
                    });
                })
                .catch((error) => {
                    response.json({
                        status: "error"
                    });
                });
        });

        this._app.delete("/orders", (request, response) => {
            const order = request.body;

            this._model.findOne({ where: { id: order.id } })
                .then((foundOrder) => foundOrder.destroy())
                .then((deletedOrder) => {
                    response.json({
                        status: "success",
                        data: deletedOrder
                    });
                })
                .catch((error) => {
                    response.json({
                        status: "error",
                        data: order
                    });
                });
        });
    }
}


module.exports = OrderController;