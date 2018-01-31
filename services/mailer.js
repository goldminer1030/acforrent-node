const _ = require("lodash");
const config = require("config");
const moment = require("moment");
const nodemailer = require("nodemailer");
const requiretext = require("require-text");


class Mailer {
    constructor() {
        this._config = config.get("mailer");
        this._transporter = nodemailer.createTransport(this._config.server);
    }

    send(order, items, discount) {
        let options = this._config.options;
        options.html = requiretext("./template.html", require);

        options.html = options.html.replace(/{{first-name}}/g, order.firstName);
        options.html = options.html.replace(/{{last-name}}/g, order.lastName);
        options.html = options.html.replace(/{{order-number}}/g, order.id);
        options.html = options.html.replace(/{{phone}}/g, order.phone);
        options.html = options.html.replace(/{{address}}/g, order.address);
        options.html = options.html.replace(/{{city}}/g, order.city);
        options.html = options.html.replace(/{{state}}/g, order.state);
        options.html = options.html.replace(/{{zip}}/g, order.zip);
        options.html = options.html.replace(/{{price-with-discount}}/g, (+order.priceWithDiscount / 100).toFixed(2));
        options.html = options.html.replace(/{{commentary}}/g, order.commentary);

        const deliveryDate = moment(order.deliveryDate);
        const deliveryTime = moment(order.deliveryTime);
        const pickupDate = moment(order.pickupDate);
        const pickupTime = moment(order.pickupTime);
        const period = pickupDate.diff(deliveryDate, "months", true);

        let itemsString = "";
        items.forEach((item) => {
            let price = 0;
            if (item.period) {
                price = (item.price - (item.period - period) * 20) * item.quantity;
            } else {
                price = item.price * item.quantity;
            }

            price *= discount;

            if (item.quantity > 0) {
                itemsString += `${item.quantity} × ${item.size} = $${price.toFixed(2)} <br>`;
            }
        });

        options.html = options.html.replace(/{{items}}/g, itemsString);

        options.html = options.html.replace(/{{delivery-month}}/g, deliveryDate.format("MMMM"));
        options.html = options.html.replace(/{{delivery-day}}/g, deliveryDate.format("DD"));
        options.html = options.html.replace(/{{delivery-time}}/g, deliveryTime.format("LT"));

        options.html = options.html.replace(/{{pickup-month}}/g, pickupDate.format("MMMM"));
        options.html = options.html.replace(/{{pickup-day}}/g,   pickupDate.format("DD"));
        options.html = options.html.replace(/{{pickup-time}}/g,  pickupTime.format("LT"));

        this._transporter.sendMail(_.assign({}, this._config.options, { to: order.email }), (error, info) => {
            if (error) {
                console.log(error);
                return;
            }

            console.log("Message sent: ", info.messageId, info.response);
        });
    }

    discount() {
        return
    }
}


module.exports = Mailer;