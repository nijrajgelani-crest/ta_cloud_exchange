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
    "_cls": "PeriodicTask",
    "name": "INTERNAL INDICATOR AGING TASK",
    "enabled": True,
    "args": [],
    "task": "cte.tasks.indicator_aging_task.age_indicators",
    "interval": {
        "every": 12,
        "period": "hours",
    },
})

db.users.insert({
    username: "admin",
    password: "$2y$12$hwULodJIcg6ncfRgjWkqnOcJFEcSEk3zMiIyjxQLgRZwXbROVilF.",
    scopes: ["read", "write"]
});

db.users.insert({
    username: "user",
    password: "$2y$12$hwULodJIcg6ncfRgjWkqnOcJFEcSEk3zMiIyjxQLgRZwXbROVilF.",
    scopes: ["read"]
});