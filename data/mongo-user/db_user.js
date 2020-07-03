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
    logLevel: "info",
    databaseVersion: "2.0.0",
    platforms: {
        cte: true,
        itsm: true
    }
})

db.indicators.createIndex({ reputation: -1 })
db.indicators.createIndex({ externalHits: -1 })
db.indicators.createIndex({ lastSeen: -1 })

db.users.insert({
    username: "admin",
    password: "$2y$12$RBcV6xWFhHucm4a1YRmQXuEZHqz9NadpMuzIB6xEIXOhg.QzngiiO",
    scopes: ["admin", "read", "write", "me", "api"],
    tokens: [],
    firstLogin: true
});
