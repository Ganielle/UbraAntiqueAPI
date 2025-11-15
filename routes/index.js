const routers = app => {
    console.log("Routers are all available");

    app.use("/auth", require("./auth"))
    app.use("/users", require("./users"))
    app.use("/uploads", require('./upload'))
    app.use("/jobs", require("./jobs"))
    app.use("/staffusers", require("./staffusers"))
}

module.exports = routers