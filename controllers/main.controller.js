const path = require("path");
const config = require("config");

const Mailer = require("../services/mailer");

// models
const models = require("../models");

const states = require("./data/states");
const defaultAcs = require("./data/acs");
const steps = require("./data/steps");

const passport = require("passport");
const stripe = require("stripe")(config.get("stripe.secret-key"));


class MainController {
    constructor(app) {
        this._app = app;
        this._acModel = models.ac;
        this._orderModel = models.order;
        this._promoModel = models.promo;
        this._mailer = new Mailer();

        this._initRoutes();
    }

    _initRoutes() {
        this._app.get("/order", (request, response) => {
            this._acModel.findAll()
                .then((acs) => {
                    acs.forEach((ac) => {
                        if (ac.size.indexOf("Install") !== -1) {
                            ac.customClass = "install-margin";
                        }

                        if (ac.size.indexOf("Remove") !== -1) {
                            ac.customClass = "remove-margin";
                        }
                    });

                    response.render("index", {
                        steps,
                        items: acs,
                        states,
                        publicKey: config.get("stripe.public-key")
                    });
                })
                .catch((error) => {
                    response.render("index", {
                        steps,
                        items: defaultAcs,
                        states
                    });
                });
        });

        this._app.get("/order-admin-mode", passport.authenticate("basic", { session: false }), (request, response) => {
            this._acModel.findAll()
                .then((acs) => {
                    acs.forEach((ac) => {
                        if (ac.size.indexOf("Install") !== -1) {
                            ac.customClass = "install-margin";
                        }

                        if (ac.size.indexOf("Remove") !== -1) {
                            ac.customClass = "remove-margin";
                        }
                    });

                    response.render("index", {
                        steps,
                        items: acs,
                        states,
                        publicKey: ""
                    });
                })
                .catch((error) => {
                    response.render("index", {
                        steps,
                        items: defaultAcs,
                        states
                    });
                });
        });

        this._app.get("/admin", passport.authenticate("basic", { session: false }), (request, response) => {
            response.sendFile(path.resolve("./views/admin.html"));
        });

        this._app.post("/checkout-admin", (request, response) => {
            const data = JSON.parse(request.body.details);

            const order = this._orderModel.build({
                firstName: data.appointment.name.first,
                lastName: data.appointment.name.last,
                email: data.appointment.contact.email,
                phone: data.appointment.contact.phone,
                address: data.appointment.place.address,
                city: data.appointment.place.city,
                state: data.appointment.place.state,
                commentary: data.appointment.commentary,
                promo: data.appointment.promo,
                zip: data.appointment.place.zip,
                deliveryDate: data.delivery.date,
                deliveryTime: data.delivery.time,
                pickupDate: data.pickup.date,
                pickupTime: data.pickup.time,
                totalPrice: data.price.total.toFixed(2),
                priceWithDiscount: data.price.withDiscount.toFixed(2),
                items: JSON.stringify(data.items)
            });

            order.save()
                .then((savedOrder) => {
                    this._promoModel.findOne({
                        where: {
                            name: data.appointment.promo
                        }
                    }).then((promo) => {
                        const discount = promo ? (1 - promo.discount / 100) : 1;

                        this._mailer.send(savedOrder, data.items, discount);

                        response.json({
                            status: "success"
                        });
                    }).catch(() => {
                        this._mailer.send(savedOrder, data.items, 1);

                        response.json({
                            status: "success"
                        });
                    });
                })
                .catch(() => {
                    response.json({
                        status: "error"
                    });
                });
        });

        this._app.post("/checkout", (request, response) => {
            const data = JSON.parse(request.body.details);

            stripe.customers.create({ email: data.appointment.contact.email, source: data.token.id})
                .then((customer) => {
                    return stripe.charges.create({
                        description: "Checkout",
                        currency: "usd",
                        customer: customer.id,
                        amount: +data.price.withDiscount.toFixed(0)
                    });
                })
                .then((charge) => {
                    const order = this._orderModel.build({
                        firstName: data.appointment.name.first,
                        lastName: data.appointment.name.last,
                        email: data.appointment.contact.email,
                        phone: data.appointment.contact.phone,
                        address: data.appointment.place.address,
                        city: data.appointment.place.city,
                        state: data.appointment.place.state,
                        commentary: data.appointment.commentary,
                        promo: data.appointment.promo,
                        zip: data.appointment.place.zip,
                        deliveryDate: data.delivery.date,
                        deliveryTime: data.delivery.time,
                        pickupDate: data.pickup.date,
                        pickupTime: data.pickup.time,
                        totalPrice: data.price.total.toFixed(2),
                        priceWithDiscount: data.price.withDiscount.toFixed(2),
                        items: JSON.stringify(data.items)
                    });

                    order.save()
                        .then((savedOrder) => {
                            this._promoModel.findOne({
                                where: {
                                    name: data.appointment.promo
                                }
                            }).then((promo) => {
                                const discount = promo ? (1 - promo.discount / 100) : 1;

                                this._mailer.send(savedOrder, data.items, discount);

                                response.json({
                                    status: "success"
                                });
                            }).catch(() => {
                                this._mailer.send(savedOrder, data.items, 1);

                                response.json({
                                    status: "success"
                                });
                            });
                        })
                        .catch(() => {
                            response.json({
                                status: "error"
                            });
                        });
                })
                .catch((error) => {
                    response.json({
                        status: "error"
                    });
                });
        });
    }
}


module.exports = MainController;