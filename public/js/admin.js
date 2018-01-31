(function() {
    var DEFAULT_PROMO_DISCOUNT = 10;
    var DEFAULT_AC_TIME_PERIOD = 5;

    var application = new Vue({
        el: "#application",

        data: {
            acs: [],
            promos: [],
            orders: [],
            selectedMenu: "acs",
            selectedOrder: null,

            promo: {
                submitted: false,
                name: "",
                discount: DEFAULT_PROMO_DISCOUNT,

                validations: {
                    name: "",
                    discount: ""
                },

                pendings: {
                    create: false,
                    delete: -1
                }
            },

            ac: {
                submitted: false,
                size: "",
                description: "",
                image: "",
                price: 0,
                priceString: "",
                time: DEFAULT_AC_TIME_PERIOD,

                validations: {
                    size: "",
                    price: "",
                    time: ""
                },

                pendings: {
                    create: false,
                    delete: -1
                }
            },

            order: {
                pendings: {
                    create: false,
                    delete: -1
                }
            }
        },

        mounted: function() {
            var that = this;

            $.get("/acs", function(response) {
                that.acs = response.data;
            });

            $.get("/promos", function(response) {
                that.promos = response.data;
            });

            $.get("/orders", function(response) {
                that.orders = response.data;

                that.orders.forEach(function(order) {
                    order.items = JSON.parse(order.items).filter(function(item) {
                        return item.quantity > 0;
                    });
                });
            });
        },

        filters: {
            price: function(value) {
                return "$" + (value / 100).toFixed(2)
            },

            date: function(value) {
                return new Date(value).toLocaleDateString();
            },

            time: function(value) {
                return new Date(value).toLocaleTimeString();
            },

            priceString: function(value) {
                return "$" + value.price + " / " + value.time;
            }
        },

        methods: {
            setSelectedMenu: function(name) {
                this.selectedMenu = name;
            },

            createPromo: function() {
                var that = this;

                this.promo.submitted = true;

                if (!this.promoValid) return;

                this.promo.pendings.create = true;
                $.post("/promos", { name: this.promo.name, discount: this.promo.discount })
                    .done(function(response) {
                        that.promos.push(response.data);

                        that.promo.name = "";
                        that.promo.discount = DEFAULT_PROMO_DISCOUNT;
                    })
                    .always(function() {
                        that.promo.pendings.create = false;
                        that.promo.submitted = false;
                    });
            },

            removePromo: function(promo) {
                var that = this;

                this.promo.pendings.delete = promo.id;

                $.ajax({ url: "/promos", method: "DELETE", data: promo })
                    .done(function(response) {
                        that.promos = that.promos.filter(function(p) {
                            return p.id !== response.data.id;
                        });

                        that.promo.pendings.delete = -1;
                    })
                    .fail(() => {

                    });
            },

            createAC() {
                var that = this;

                this.ac.submitted = true;

                if (!this.acValid) return;

                this.ac.pendings.create = true;
                $.post("/acs", this.buildAcItem())
                    .done(function(response) {
                        that.acs.push(response.data);

                        that.ac.size = "";
                        that.ac.description = "";
                        that.ac.image = "";
                        that.ac.price = 0;
                        that.ac.time = DEFAULT_AC_TIME_PERIOD;
                        that.ac.priceString = "";
                    })
                    .always(function() {
                        that.ac.pendings.create = false;
                        that.ac.submitted = false;
                    })
            },

            removeAC: function(ac) {
                var that = this;

                this.ac.pendings.delete = ac.id;

                $.ajax({ url: "/acs", method: "DELETE", data: ac })
                    .done(function(response) {
                        that.acs = that.acs.filter(function(a) {
                            return a.id !== response.data.id;
                        });

                        that.ac.pendings.delete = -1;
                    });
            },

            removeOrder: function(order) {
                var result = confirm("Are you sure you want to delete order?");

                if (!result)
                    return;

                var that = this;

                this.order.pendings.delete = order.id;

                $.ajax({ url: "/orders", method: "DELETE", data: order })
                    .done(function(response) {
                        that.orders = that.orders.filter(function(o) {
                            return o.id !== response.data.id;
                        });

                        that.order.pendings.delete = -1;
                    });
            },

            buildAcItem() {
                return {
                    size: this.ac.size,
                    description: this.ac.description,
                    image: this.ac.image,
                    price: this.ac.price,
                    time: this.ac.time,
                    priceString: this.ac.priceString
                };
            }
        },

        computed: {
            promoValid: function() {
                var that = this;

                var result = true;

                if (!this.promo.submitted) {
                    return true;
                }

                this.promo.validations.name = "";
                if (!this.promo.name) {
                    this.promo.validations.name = "Required field";
                    result = false;
                }

                var promosWithSameName = this.promos.filter(function(p) {
                    return p.name === that.promo.name;
                });

                if (promosWithSameName.length > 0) {
                    this.promo.validations.name = "Promo code with the same name already exists";
                    result = false;
                }

                this.promo.validations.discount = "";
                var discount = parseInt(this.promo.discount) || DEFAULT_PROMO_DISCOUNT;
                if (discount < 0 || discount > 100) {
                    this.promo.validations.discount = "Discount should be a number and between 0 and 100";
                    result = false;
                }

                return result;
            },

            acValid: function() {
                var that = this;

                var result = true;

                if (!this.ac.submitted) {
                    return true;
                }

                this.ac.validations.size = "";
                if (!this.ac.size) {
                    this.ac.validations.size = "Required field";
                    result = false;
                }

                this.ac.validations.price = "";
                var price = parseInt(this.ac.price) || 0;
                if (price < 0) {
                    this.ac.validations.price = "Price should be less than 0";
                    result = false;
                }

                this.ac.validations.time = "";
                var time = parseInt(this.ac.time) || 0;
                if (time < 0 || time > 12) {
                    this.ac.validations.time = "Period should be a number and between 0 and 12 months";
                    result = false;
                }

                return result;
            }
        }
    })
})();