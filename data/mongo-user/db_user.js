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
    task: "cte.age_indicators",
    interval: {
        every: 12,
        period: "hours",
    },
})

db.schedules.insert({
    _cls: "PeriodicTask",
    name: "INTERNAL UNMUTE TASK",
    enabled: true,
    args: [],
    task: "itsm.unmute",
    interval: {
        every: 5,
        period: "minutes",
    },
})

db.schedules.insert({
    _cls: "PeriodicTask",
    name: "CRE INTERNAL UNMUTE TASK",
    enabled: true,
    args: [],
    task: "cre.unmute",
    interval: {
        every: 5,
        period: "minutes",
    },
})

db.schedules.insert({
    _cls: "PeriodicTask",
    name: "CRE AVERAGE NORMALIZED SCORE TASH",
    enabled: true,
    args: [],
    task: "cre.calculate_aggregate",
    interval: {
        every: 24,
        period: "hours",
    },
})

db.schedules.insert({
    _cls: "PeriodicTask",
    name: "INTERNAL ALERT CLEANUP TASK",
    enabled: true,
    args: [],
    task: "itsm.delete_alerts",
    interval: {
        every: 12,
        period: "hours",
    },
})

db.schedules.insert({
    _cls: "PeriodicTask",
    name: "INTERNAL LOG CLEANUP TASK",
    enabled: true,
    args: [],
    task: "cre.delete_logs",
    interval: {
        every: 12,
        period: "hours",
    },
})

db.schedules.insert({
    _cls: "PeriodicTask",
    name: "INTERNAL UPDATE TASK",
    enabled: true,
    args: [],
    task: "common.check_updates",
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
    databaseVersion: "3.0.0",
    alertCleanup: 7,
    platforms: {
        cte: false,
        itsm: false
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

db.cls_mapping_files.insertMany([{
    "name": "Azure Sentinel Mappings",
    "jsonData": "{\n    \"sentinel_map_version\": \"2.0.0\",\n    \"taxonomy\": {\n        \"alerts\": {\n            \"anomaly\": [],\n            \"dlp\": [],\n            \"malware\": [],\n            \"policy\": [],\n            \"Compromised Credential\": [],\n            \"Legal Hold\": [],\n            \"Malsite\": [],\n            \"Quarantine\": [],\n            \"Remediation\": [],\n            \"Security Assessment\": [],\n            \"Watchlist\": [],\n            \"uba\": []\n        },\n        \"events\": {\n            \"application\": [],\n            \"audit\": [],\n            \"infrastructure\": [],\n            \"page\": [],\n            \"network\": []\n        }\n    }\n}",
    "isDefault": true
}, {
    "name": "CSCC Default Mappings",
    "jsonData": "{\n    \"cscc_map_version\": \"2.0.0\",\n    \"taxonomy\": {\n        \"alerts\": {\n            \"anomaly\": [],\n            \"dlp\": [],\n            \"malware\": [],\n            \"policy\": [],\n            \"Compromised Credential\": [],\n            \"Legal Hold\": [],\n            \"Malsite\": [],\n            \"Quarantine\": [],\n            \"Remediation\": [],\n            \"Security Assessment\": [],\n            \"Watchlist\": [],\n            \"uba\": []\n        },\n        \"events\": {\n            \"application\": [],\n            \"audit\": [],\n            \"infrastructure\": [],\n            \"page\": [],\n            \"network\": []\n        }\n    }\n}",
    "isDefault": true
}]);

db.cls_business_rules.insert({ "name": "All", "filters": { "query": "alert_type IN (\"anomaly\", \"compromisedCrendential\", \"policy\", \"legalHold\", \"malsite\", \"malware\", \"dlp\", \"securityAssessment\", \"watchlist\", \"quarantine\", \"remediation\", \"uba\") && event_type IN (\"page\", \"audit\", \"application\", \"infrastructure\", \"network\")", "mongo": "{\"alert_type\":{\"$in\":[\"anomaly\",\"compromisedCrendential\",\"policy\",\"legalHold\",\"malsite\",\"malware\",\"dlp\",\"securityAssessment\",\"watchlist\",\"quarantine\",\"remediation\",\"uba\"]},\"event_type\":{\"$in\":[\"page\",\"audit\",\"application\",\"infrastructure\",\"network\"]}}" }, "muteRules": [], "muted": false, "unmuteAt": null, "siemMappings": {} })