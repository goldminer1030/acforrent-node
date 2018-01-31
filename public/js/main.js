(function() {
    var selectors = {
        item: {
            container: ".ac-item",
            size: ".item-size",
            quantity: ".input-number",

            buttons: {
                add: ".plus-button",
                remove: ".minus-button"
            }
        },

        appointment: {
            name: {
                first: "#firstName",
                last: "#lastName"
            },
            contact: {
                email: "#email",
                phone: "#phone"
            },
            place: {
                address: "#address",
                city: "#city",
                state: "#state",
                zip: "#zip"
            },
            commentary: "#commentary",
            promo: "#promo"
        },

        total: {
            container: ".total",
            items: ".total .list",
            price: ".total .price"
        },

        buttons: {
            next: ".next-button"
        },

        datepickers: {
            delivery: {
                date: ".delivery-date",
                time: ".delivery-time"
            },
            pickup: {
                date: ".pickup-date",
                time: ".pickup-time"
            }
        }
    };

    var steps = {
        list: ["items-list", "appointment-details", "billing-details", "success"],
        currentStepIndex: 0
    };

    var datepickers = {
        delivery: { date: "", time: "" },
        pickup: { date: "", time: "" }
    };

    var appointment = {
        name: {
            first: "",
            last:  ""
        },
        contact: {
            email: "",
            phone: ""
        },
        place: {
            address: "",
            city: "",
            state: "Alabama",
            zip: ""
        },
        commentary: "",
        promo: ""
    };


    function Item(id, size, price, period, quantity) {
        this.id = id;
        this.size = size;
        this.price = price;
        this.period = period;
        this.quantity = quantity;
    }

    Item.createFromElement = function($element) {
        var id = $element.data("id"),
            size = $element.find(selectors.item.size).text(),
            price = parseFloat($element.data("price")),
            period = parseInt($element.data("period")),
            quantity = parseInt($element.find(selectors.item.quantity).val())

        return new Item(id, size, price, period, quantity);
    };


    function Application() {
        this.items = [];
        this.steps = steps;
        this.datepickers = datepickers;
        this.appointment = appointment;

        this.price = {
            total: 0,
            withDiscount: 0
        };

        this.discount = 1;

        this.showPage();
        this.createItems();
        this.loadFromCookies();
        this.createDatePickers();
        this.buildItemsInfo();
        this.adjustDatePickers();

        this.initializePlugins();
        this.initializeHandlers();
    }

    Application.prototype.createItems = function() {
        var that = this;

        $(selectors.item.container).each(function() {
            that.items.push(Item.createFromElement($(this)));
        });
    };

    Application.prototype.loadFromCookies = function() {
        this.items = Cookies.getJSON("items") || this.items;
        this.datepickers = Cookies.getJSON("datepickers") || this.datepickers;
        this.appointment= Cookies.getJSON("appointment") || this.appointment;

        $(selectors.appointment.name.first).val(this.appointment.name.first);
        $(selectors.appointment.name.last).val(this.appointment.name.last);
        $(selectors.appointment.contact.email).val(this.appointment.contact.email);
        $(selectors.appointment.contact.phone).val(this.appointment.contact.phone);
        $(selectors.appointment.place.address).val(this.appointment.place.address);
        $(selectors.appointment.place.city).val(this.appointment.place.city);
        $(selectors.appointment.place.state).val(this.appointment.place.state);
        $(selectors.appointment.place.zip).val(this.appointment.place.zip);
        $(selectors.appointment.commentary).val(this.appointment.commentary);
        $(selectors.appointment.promo).val(this.appointment.promo);
    };

    Application.prototype.storeToCookies = function() {
        Cookies.set("items", this.items, { expires: 7 });
        Cookies.set("datepickers", this.datepickers, { expires: 7 });

        this.appointment = {
            name: {
                first: $(selectors.appointment.name.first).val(),
                last: $(selectors.appointment.name.last).val()
            },
            contact: {
                email: $(selectors.appointment.contact.email).val(),
                phone: $(selectors.appointment.contact.phone).val()
            },
            place: {
                address: $(selectors.appointment.place.address).val(),
                city: $(selectors.appointment.place.city).val(),
                state: $(selectors.appointment.place.state).val(),
                zip: $(selectors.appointment.place.zip).val(),
            },
            commentary: $(selectors.appointment.commentary).val(),
            promo: $(selectors.appointment.promo).val()
        };

        Cookies.set("appointment", this.appointment, { expires: 7 });
    };

    Application.prototype.clearCookies = function() {
        Cookies.remove("items");
        Cookies.remove("datepickers");
        Cookies.remove("appointment");
    };

    Application.prototype.createDatePickers = function() {
        var that = this;

        var tomorrowDate = getTomorrowDate(new Date()),
            minPickupDate = getMinPickupDate(tomorrowDate),
            maxPickupDate = getMaxPickupDate(tomorrowDate);

        var deliveryDate = $(selectors.datepickers.delivery.date).datetimepicker({
            format: "MM/DD/YYYY",
            defaultDate: tomorrowDate,
            minDate: tomorrowDate,
            allowInputToggle: true,
            daysOfWeekDisabled: [0]
        });

        var deliveryTime = $(selectors.datepickers.delivery.time).datetimepicker({
            format: "LT",
            stepping: 30,
            allowInputToggle: true,
            minDate: moment({h:8}),
            maxDate: moment({h:20})
        });

        var pickupDate = $(selectors.datepickers.pickup.date).datetimepicker({
            format: "MM/DD/YYYY",
            allowInputToggle: true,
            minDate: minPickupDate,
            maxDate: maxPickupDate,
            daysOfWeekDisabled: [0]
        });

        var pickupTime = $(selectors.datepickers.pickup.time).datetimepicker({
            format: "LT",
            stepping: 30,
            allowInputToggle: true,
            minDate: moment({h:8}),
            maxDate: moment({h:20})
        });

        deliveryDate.on("dp.change", function(e) {
            if (!e.date) return;

            that.datepickers.delivery.date = e.date.format("MM/DD/YYYY");

            var newMinDate = moment(e.date).add(1, "days");
            var newMaxDate = moment(e.date).add(12, "months");
            $(".pickup-date").data("DateTimePicker").options({
                minDate: newMinDate,
                maxDate: newMaxDate
            });

            that.updateState();
        });

        deliveryTime.on("dp.change", function(e) {
            if (!e.date) return;

            that.datepickers.delivery.time = e.date.format("LT");
            that.updateState();
        });

        pickupDate.on("dp.change", function(e) {
            if (!e.date) return;

            if (e.date.day() === 0) {
                $(".pickup-date").data("DateTimePicker").date(e.date.add(1, "days"));
                return;
            }

            that.datepickers.pickup.date = e.date.format("MM/DD/YYYY");
            that.updateState();
        });

        pickupTime.on("dp.change", function(e) {
            if (!e.date) return;

            that.datepickers.pickup.time = e.date.format("LT");
            that.updateState();
        });

        $(".pickup-date").data("DateTimePicker").date(moment(this.datepickers.pickup.date, "MM/DD/YYYY"));
        $(".pickup-time").data("DateTimePicker").date(moment(this.datepickers.pickup.time || "8:00 AM", "hh:mm"));

        $(selectors.datepickers.delivery.date).data("DateTimePicker").date(moment(this.datepickers.delivery.date, "MM/DD/YYYY"));
        $(selectors.datepickers.delivery.time).data("DateTimePicker").date(moment(this.datepickers.delivery.time || "8:00 AM", "LT"));


        function getTomorrowDate(today) {
            var result = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0, 0);
            result.setDate(result.getDate() + 1);

            if (result.getDay() === 0) {
                result.setDate(result.getDate() + 1);
            }

            return result;
        }

        function getMinPickupDate(startDate) {
            var result = new Date(startDate);
            return result.setDate(result.getDate() + 1);
        }

        function getMaxPickupDate(startDate) {
            var result = new Date(startDate);
            return result.setMonth(result.getMonth() + 12);
        }
    };

    Application.prototype.buildItemsInfo = function() {
        $(selectors.buttons.next).attr("disabled", true);

        var that = this;

        var $totalItemsList = $(selectors.total.items);
        $totalItemsList.empty();

        var deliveryDate = $(selectors.datepickers.delivery.date).data("DateTimePicker").date(),
            pickupDate = $(selectors.datepickers.pickup.date).data("DateTimePicker").date(),
            period = pickupDate.diff(deliveryDate, "months", true);

        var sum = 0;
        this.items.forEach(function(item) {
            if (item.quantity > 0) {
                $(selectors.buttons.next).attr("disabled", false);

                var price = 0;
                if (item.period) {
                    price = (item.price - (item.period - period) * 20) * item.quantity;
                } else {
                    price = item.price * item.quantity;
                }

                price *= that.discount;

                $totalItemsList.append($("<p />").text(item.quantity + " × " + item.size + " = $" + price.toFixed(2)));

                sum += price;
            }
        });

        this.price.total = sum;
        this.price.withDiscount = sum;

        $(selectors.item.container).each(function() {
            var item = that.getItemById($(this).data("id"));

            $(this).find(selectors.item.quantity).val(item.quantity || 0);
        });

        $(selectors.total.price).text("$" + sum.toFixed(2));

        $(".rent-period .description").text(deliveryDate.format("DD MMMM, YYYY") + " → " + pickupDate.format("DD MMMM, YYYY"));
        $(".rent-period .length").text(getHumanLength());


        function getHumanLength() {
            var result = "";

            var months = pickupDate.diff(deliveryDate, "months");
            deliveryDate.add(months, "months");

            if (months > 0) {
                result += months + (months === 1 ? " month" : " months");
            }

            var days = pickupDate.diff(deliveryDate, "days");

            if (days > 0) {
                if (months > 0) {
                    result += " & ";
                }

                result += days + (days === 1 ? " day" : " days");
            }

            return result;
        }
    };

    Application.prototype.adjustDatePickers = function() {
        var installItem = this.items.filter(function(item) {
            return item.size.indexOf("Install") !== -1;
        })[0];

        var removeItem = this.items.filter(function(item) {
            return item.size.indexOf("Remove") !== -1;
        })[0];

        if (installItem.quantity === 0 && removeItem.quantity === 0) {
            $(selectors.datepickers.pickup.date).data("DateTimePicker").enable();
            $(selectors.datepickers.pickup.time).data("DateTimePicker").enable();
            return;
        }

        var restItems = this.items.filter(function(item) {
            if (item.size.indexOf("Install") !== -1) return false;
            if (item.size.indexOf("Remove") !== -1) return false;

            return true;
        });

        var sum = 0;
        restItems.forEach(function(restItem) {
            sum += restItem.quantity;
        });

        if (sum === 0) {
            $(selectors.datepickers.pickup.date).data("DateTimePicker").disable();
            $(selectors.datepickers.pickup.time).data("DateTimePicker").disable();
        } else {
            $(selectors.datepickers.pickup.date).data("DateTimePicker").enable();
            $(selectors.datepickers.pickup.time).data("DateTimePicker").enable();
        }
    };

    Application.prototype.initializePlugins = function() {
        var isMobile = false; //initiate as false

        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
            || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw-(n|u)|c55\/|capi|ccwa|cdm-|cell|chtm|cldc|cmd-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc-s|devi|dica|dmob|do(c|p)o|ds(12|-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(-|_)|g1 u|g560|gene|gf-5|g-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd-(m|p|t)|hei-|hi(pt|ta)|hp( i|ip)|hs-c|ht(c(-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i-(20|go|ma)|i230|iac( |-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|-[a-w])|libw|lynx|m1-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|-([1-8]|c))|phil|pire|pl(ay|uc)|pn-2|po(ck|rt|se)|prox|psio|pt-g|qa-a|qc(07|12|21|32|60|-[2-7]|i-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h-|oo|p-)|sdk\/|se(c(-|0|1)|47|mc|nd|ri)|sgh-|shar|sie(-|m)|sk-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h-|v-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl-|tdg-|tel(i|m)|tim-|t-mo|to(pl|sh)|ts(70|m-|m3|m5)|tx-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas-|your|zeto|zte-/i.test(navigator.userAgent.substr(0,4))) isMobile = true;

        if (!isMobile) {
            $(selectors.total.container).sticky({ topSpacing:20 });
        }
    };

    Application.prototype.initializeHandlers = function() {
        var that = this;

        $(".bs-wizard-dot").click(function() {
            var $parent = $(this).parent();

            if ($parent.hasClass("step-1") && that.steps.currentStepIndex !== 0) {
                that.steps.currentStepIndex = 0;
                that.showPage();
                return;
            }

            if ($parent.hasClass("step-2") && that.steps.currentStepIndex !== 1) {
                that.steps.currentStepIndex = 1;
                that.showPage();
                return;
            }

            if ($parent.hasClass("step-3") && that.steps.currentStepIndex !== 2) {
                that.steps.currentStepIndex = 2;
                that.showPage();
                return;
            }
        });

        $(selectors.item.buttons.add).click(function() {
            var $item = $(this).parents(selectors.item.container),
                $value = $item.find(selectors.item.quantity);

            var item = that.getItemById($item.data("id"));
            item.quantity++;

            $value.val(item.quantity);

            that.updateState();
        });

        $(selectors.item.buttons.remove).click(function() {
            var $item = $(this).parents(selectors.item.container),
                $value = $item.find(selectors.item.quantity);

            var item = that.getItemById($item.data("id"));
            item.quantity--;

            if (item.quantity < 0) {
                item.quantity = 0;
            }

            $value.val(item.quantity);

            that.updateState();
        });

        $(selectors.item.quantity).change(function() {
            var $item = $(this).parents(selectors.item.container),
                $value = $item.find(selectors.item.quantity);

            var item = that.getItemById($item.data("id")),
                quantity = parseInt($value.val());

            if (quantity < 0) {
                quantity = 0;
            }

            item.quantity = quantity;
            $value.val(item.quantity);

            that.updateState();
        });

        $("#firstName, #lastName, #email, #phone, #address, #city, #zip, #promo, #commentary").on("input", function() {
            that.showAppointmentErrors();
            that.checkValidation();
            that.storeToCookies();
        });

        $("#firstName, #lastName, #email, #phone, #address, #city, #zip, #promo, #commentary").on("blur", function() {
            that.showAppointmentErrors();
            that.checkValidation();
        });

        $(selectors.appointment.place.state).change(function() {
            that.storeToCookies();
        });

        $(selectors.buttons.next).click(function() {
            that.steps.currentStepIndex++;

            that.showPage();
            that.storeToCookies();
        });

        $(".apply-promo-button").click(function() {
            $.get("/check-promo", { name: that.appointment.promo })
                .done(function(result) {
                    if (result.data) {
                        that.price.withDiscount = that.price.total * (1 - result.data.discount / 100);

                        $(".apply-promo-button").attr("disabled", true);

                        that.discount = (1 - result.data.discount / 100);

                        that.updateState();
                    }
                });

            return false;
        });

        $(".checkout-button").click(function() {
            var publicKey = $(".public-key").text();

            if (that.discount === 1) {
                that.appointment.promo = "";
            }

            if (!publicKey) {
                var data = {
                    appointment: that.appointment,
                    items: that.items,
                    price: {
                        total: that.price.total * 100,
                        withDiscount: that.price.withDiscount * 100,
                    },
                    delivery: {
                        date: new Date($(".delivery-date").data("DateTimePicker").date()),
                        time: new Date($(".delivery-time").data("DateTimePicker").date()),
                    },
                    pickup: {
                        date: new Date($(".pickup-date").data("DateTimePicker").date()),
                        time: new Date($(".pickup-time").data("DateTimePicker").date()),
                    }
                };

                $.ajax({ url: "/checkout-admin", method: "POST", data: { details: JSON.stringify(data) }, dataType: "json"})
                    .done(function() {
                        that.steps.currentStepIndex++;
                        that.showPage();

                        that.clearCookies();
                    });
            }

            if (publicKey) {
                StripeCheckout.open({
                    key: publicKey,
                    email: that.appointment.contact.email,
                    amount: that.price.withDiscount * 100,
                    name: "ACforRent",
                    description: "Checkout",
                    token: function(token, args) {
                        var data = {
                            token: token,
                            appointment: that.appointment,
                            items: that.items,
                            price: {
                                total: that.price.total * 100,
                                withDiscount: that.price.withDiscount * 100,
                            },
                            delivery: {
                                date: new Date($(".delivery-date").data("DateTimePicker").date()),
                                time: new Date($(".delivery-time").data("DateTimePicker").date()),
                            },
                            pickup: {
                                date: new Date($(".pickup-date").data("DateTimePicker").date()),
                                time: new Date($(".pickup-time").data("DateTimePicker").date()),
                            }
                        };

                        $.ajax({ url: "/checkout", method: "POST", data: { details: JSON.stringify(data) }, dataType: "json"})
                            .done(function() {
                                that.steps.currentStepIndex++;
                                that.showPage();

                                that.clearCookies();
                            });
                    }
                });
            }

            return false;
        });
    };

    Application.prototype.showPage = function() {
        $(".ac-for-rent .content .title .action").css("visibility", "visible");
        $(".ac-for-rent .content .title .description").css("visibility", "visible");
        $(".ac-for-rent .content .title .price-description").css("visibility", "visible");

        $(".ac-for-rent .total-container").show();

        $(".total-appointment-errors").empty();

        $(".bs-wizard-step.step-1, .bs-wizard-step.step-2, .bs-wizard-step.step-3").addClass("disabled");

        if (this.steps.currentStepIndex === 0) {
            $(".ac-for-rent .content .title .action").text("Choose AC’s to Rent");
            $(".ac-for-rent .content .title .description").text("All Options Include Delivery, Install & Pickup.");
            $(".ac-for-rent .content .title .price-description").text("The price depends on the rental term");

            $(".ac-for-rent .content-list").show();
            $(".ac-for-rent .content .appointment").hide();
            $(".ac-for-rent .content .billing").hide();

            $(".bs-wizard-step.step-1").removeClass("disabled").addClass("active");

            $(".ac-button.next-button").attr("disabled", true);
            this.items.forEach(function(item) {
                if (item.quantity > 0) {
                    $(selectors.buttons.next).attr("disabled", false);
                }
            });
        }

        if (this.steps.currentStepIndex === 1) {
            $(".ac-for-rent .content .title .description").css("visibility", "hidden")
            $(".ac-for-rent .content .title .price-description").css("visibility", "hidden");

            $(".ac-for-rent .content .title .action").text("Appointment details");

            $(".ac-for-rent .content-list").hide();
            $(".ac-for-rent .content .appointment").show();
            $(".ac-for-rent .content .billing").hide();

            $(".bs-wizard-step.step-1").removeClass("disabled").addClass("active");
            $(".bs-wizard-step.step-2").removeClass("disabled").addClass("active");

            $(".ac-for-rent .content .appointment #firstName").focus();

            this.checkValidation();
        }

        if (this.steps.currentStepIndex === 2) {
            var $title = $("<span />").text("Review Your Order").addClass("action");
            var $description = $("<span>By placing your order, you agree with ACforRent.com's <a href='/privacy-policy'>Privacy Policy</a></span>").addClass("review-description");

            $(".ac-for-rent .content .title").empty().append($title).append("<br />").append($description);

            $(".ac-for-rent .content .appointment").hide();
            $(".ac-for-rent .total-container").hide();
            $(".ac-for-rent .content .billing").show();

            $(".bs-wizard-step.step-1").removeClass("disabled").addClass("active");
            $(".bs-wizard-step.step-2").removeClass("disabled").addClass("active");
            $(".bs-wizard-step.step-3").removeClass("disabled").addClass("active");

            this.buildBillingForm();
        }

        if (this.steps.currentStepIndex === 3) {
            $(".content .title .action").text("Thank you for your order!");
            $(".content .title .review-description").text("You will receive an order confirmation email with details of your order.");
            $(".content .title .review-description").text("If you do not receive an email within 10 minutes, check the Spam Folder");
            
            $(".ac-for-rent .total-container").hide();

            $(".checkout-button").hide();
        }
    };

    Application.prototype.buildBillingForm = function() {
        var that = this;

        $(".billing .full-name").text( this.appointment.name.first + " " +  this.appointment.name.last);
        $(".email").text(this.appointment.contact.email);
        $(".phone").text(this.appointment.contact.phone);

        $(".address").text(this.appointment.place.address);
        $(".city").text(this.appointment.place.city);
        $(".state").text(this.appointment.place.state);
        $(".zip").text(this.appointment.place.zip);

        var deliveryDate = $(".delivery-date").data("DateTimePicker").date(),
            deliveryTime = $(".delivery-time").data("DateTimePicker").date(),
            pickupDate = $(".pickup-date").data("DateTimePicker").date(),
            pickupTime = $(".pickup-time").data("DateTimePicker").date();


        $(".del-date").text("Delivery Date: " + deliveryDate.format("DD MMMM, YYYY") + ", " + deliveryTime.format("LT"));
        $(".pick-date").text("Pick Up Date: " + pickupDate.format("DD MMMM, YYYY") + ", " + pickupTime.format("LT"));

        var $container = $(".billing .billing-items-summary");

        var sum = 0;
        this.items.forEach(function(item) {
            if (item.quantity > 0) {
                var deliveryDate = $(".delivery-date").data("DateTimePicker").date();
                var pickupDate = $(".pickup-date").data("DateTimePicker").date();

                var period = pickupDate.diff(deliveryDate, "months", true);

                var price = 0;
                if (item.period) {
                    price = (item.price - (item.period - period) * 20) * item.quantity;
                } else {
                    price = item.price * item.quantity;
                }

                price *= that.discount;

                var $item = $("<p />").text(item.quantity + " × " + item.size + " = $" + price.toFixed(2));

                $container.append($item);

                sum += price;
            }
        });

        $(".billing .billing-total .price").text("$" + this.price.withDiscount.toFixed(2));
    };

    Application.prototype.showAppointmentErrors = function() {
        var $container = $(".total-appointment-errors");

        $container.empty();

        $(".appointment-form input.form-control").each(function() {
            if ($(this).attr("id") === "commentary")
                return;

            var $parent = $(this).parents("div.form-group");

            if ($(this).attr("id") === "promo") {
                return;
            }

            if ($(this).attr("id") === "email" && !validateEmail($("#email").val().trim())) {
                $container.append(createErrorMessage($parent.find("label").text()));
                return;
            }

            if ($(this).val().trim() === "") {
                $container.append(createErrorMessage($parent.find("label").text()));
            }
         });

        var test = $container.find(".error-field").last().html();
        if (test) {
            test = test.substring(0, test.length - 2);

            $container.find(".error-field").last().html(test);

            $container.prepend("<span>Please fill </span>");
        }


        function createErrorMessage(field, last) {
            var $result = $("<span class='error-field'/>");

            var str = "«<a class='error-field-name'>" + field + "</a>», ";

            $result.append(str);

            return $result;
        }
    };

    Application.prototype.checkValidation = function() {
        $(".next-button").attr("disabled", false);

        if (!$("#firstName").val().trim()) {
            $(".next-button").attr("disabled", true);
        }

        if (!$("#lastName").val().trim()) {
            $(".next-button").attr("disabled", true);
        }

        if (!$("#email").val().trim() || !validateEmail($("#email").val().trim())) {
            $(".next-button").attr("disabled", true);
        }

        if (!$("#phone").val().trim()) {
            $(".next-button").attr("disabled", true);
        }

        if (!$("#address").val().trim()) {
            $(".next-button").attr("disabled", true);
        }

        if (!$("#city").val().trim()) {
            $(".next-button").attr("disabled", true);
        }

        if (!$("#zip").val().trim()) {
            $(".next-button").attr("disabled", true);
        }
    };

    Application.prototype.updateState = function() {
        this.buildItemsInfo();
        this.adjustDatePickers();
        this.storeToCookies();
    };

    Application.prototype.getItemById = function(id) {
        return this.items.filter(function(item) {
            return item.id === id;
        })[0];
    };

    function validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }


    $(function() {
        var application = new Application();
    });
})();