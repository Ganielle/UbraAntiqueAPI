const routers = app => {
    console.log("Routers are all available");

    app.use("/auth", require("./auth"))
    app.use("/users", require("./users"))
    app.use("/uploads", require('./upload'))
    app.use("/jobs", require("./jobs"))
    app.use("/staffusers", require("./staffusers"))
    app.use("/forums", require("./forums"))
    app.use("/dashboard", require("./dashboard"))
    app.use("/chat", require("./chat"))
}

module.exports = routers