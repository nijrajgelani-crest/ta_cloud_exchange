db = db.getSiblingDB('cte');

if (db.getUser('cteadmin') == null) {
    db.createUser({
        user: "cteadmin",
        pwd: "cteadmin",
        roles: [{
            role: "readWrite",
            db: "cte"
        }]
    });
}

db.schedules.insert({
    _cls: "PeriodicTask",
    name: "INTERNAL INDICATOR AGING TASK",
    enabled: true,
    args: [],
    task: "cte.tasks.indicator_aging_task.age_indicators",
    interval: {
        every: 12,
        period: "hours",
    },
})

db.settings.insert({
    proxy: {
        scheme: "http",
        server: "",
        username: "",
        password: ""
    },
    logLevel: "info"
})

db.users.insert({
    username: "admin",
    password: "$2y$12$RBcV6xWFhHucm4a1YRmQXuEZHqz9NadpMuzIB6xEIXOhg.QzngiiO",
    scopes: ["read", "write", "me"],
    firstLogin: true
});

db.users.insert({
    username: "socadmin",
    password: "$2y$12$t1N0ap52uH3H8rZjplgVbebF48uerZQH/RbjEGKSOnwryz61y7KiK",
    scopes: ["read", "me"],
    firstLogin: true
});