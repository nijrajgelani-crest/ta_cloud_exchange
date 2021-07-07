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
    databaseVersion: "2.0.0",
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

db.cls_mapping_files.insert_many([
  {
    name: "azure_sentinel_map.json",
    json_data:
      '{\n    "sentinel_map_version": "2.0.0",\n    "taxonomy": {\n        "alerts": {\n            "anomaly": [],\n            "dlp": [],\n            "malware": [],\n            "policy": [],\n            "Compromised Credential": [],\n            "Legal Hold": [],\n            "Malsite": [],\n            "Quarantine": [],\n            "Remediation": [],\n            "Security Assessment": [],\n            "Watchlist": [],\n            "uba": []\n        },\n        "events": {\n            "application": [],\n            "audit": [],\n            "infrastructure": [],\n            "page": [],\n            "network": []\n        }\n    }\n}',
  },
  {
    name: "cscc_map.json",
    json_data:
      '{\n    "cscc_map_version": "2.0.0",\n    "taxonomy": {\n        "alerts": {\n            "anomaly": [],\n            "dlp": [],\n            "malware": [],\n            "policy": [],\n            "Compromised Credential": [],\n            "Legal Hold": [],\n            "Malsite": [],\n            "Quarantine": [],\n            "Remediation": [],\n            "Security Assessment": [],\n            "Watchlist": [],\n            "uba": []\n        },\n        "events": {\n            "application": [],\n            "audit": [],\n            "infrastructure": [],\n            "page": [],\n            "network": []\n        }\n    }\n}',
  },
  {
    name: "mcas_map.json",
    json_data:
      '{\n    "delimiter": "|",\n    "mcas_map_version": "1.0.0",\n    "cef_version": "0",\n    "validator": "valid_extensions.csv",\n    "taxonomy": {\n        "events": {\n            "page": {\n                "header": {\n                    "Device Vendor": {\n                        "default_value": "Netskope"\n                    },\n                    "Device Product": {\n                        "default_value": "$tenant_name"\n                    },\n                    "Device Version": {\n                        "default_value": "NULL"\n                    },\n                    "Device Event Class ID": {\n                        "mapping_field": "type"\n                    },\n                    "Name": {\n                        "default_value": "NULL"\n                    },\n                    "Severity": {\n                        "default_value": "Unknown"\n                    }\n                },\n                "extension": {\n                    "src": {\n                        "mapping_field": "srcip"\n                    },\n                    "dst": {\n                        "mapping_field": "dstip"\n                    },\n                    "requestClientApplication": {\n                        "mapping_field": "app"\n                    },\n                    "sourceServiceName": {\n                        "mapping_field": "site"\n                    },\n                    "suser": {\n                        "mapping_field": "user"\n                    },\n                    "rt": {\n                        "mapping_field": "timestamp"\n                    },\n                    "ccl": {\n                        "mapping_field": "ccl"\n                    },\n                    "cci": {\n                        "mapping_field": "cci"\n                    },\n                    "appcategory": {\n                        "mapping_field": "appcategory"\n                    },\n                    "in": {\n                        "mapping_field": "client_bytes"\n                    },\n                    "out": {\n                        "mapping_field": "server_bytes"\n                    },\n                    "pageStarttime": {\n                        "mapping_field": "page_starttime"\n                    },\n                    "pageEndtime": {\n                        "mapping_field": "page_endtime"\n                    },\n                    "device": {\n                        "mapping_field": "device"\n                    },\n                    "os": {\n                        "mapping_field": "os"\n                    },\n                    "browser": {\n                        "mapping_field": "browser"\n                    },\n                    "request": {\n                        "mapping_field": "url"\n                    },\n                    "pageId": {\n                        "mapping_field": "page_id"\n                    },\n                    "page": {\n                        "mapping_field": "page"\n                    },\n                    "act": {\n                        "mapping_field": "activity"\n                    }\n                }\n            },\n            "application": {\n                "header": {\n                    "Device Vendor": {\n                        "default_value": "Netskope"\n                    },\n                    "Device Product": {\n                        "default_value": "$tenant_name"\n                    },\n                    "Device Version": {\n                        "default_value": "NULL"\n                    },\n                    "Device Event Class ID": {\n                        "default_value": "application"\n                    },\n                    "Name": {\n                        "default_value": "NULL"\n                    },\n                    "Severity": {\n                        "default_value": "Unknown"\n                    }\n                },\n                "extension": {\n                    "src": {\n                        "mapping_field": "srcip"\n\t\t\t\t\t},\n                    "dst": {\n                        "mapping_field": "dstip"\n                    },\n                    "requestClientApplication": {\n                        "mapping_field": "app"\n                    },\n                    "sourceServiceName": {\n                        "mapping_field": "site"\n                    },\n                    "suser": {\n                        "mapping_field": "user"\n                    },\n                    "rt": {\n                        "mapping_field": "timestamp"\n                    },\n                    "ccl": {\n                        "mapping_field": "ccl"\n                    },\n                    "cci": {\n                        "mapping_field": "cci"\n                    },\n                    "appcategory": {\n                        "mapping_field": "appcategory"\n                    },\n                    "device": {\n                        "mapping_field": "device"\n                    },\n                    "os": {\n                        "mapping_field": "os"\n                    },\n                    "browser": {\n                        "mapping_field": "browser"\n                    },\n                    "request": {\n                        "mapping_field": "url"\n                    },\n                    "appSessionId": {\n                        "mapping_field": "app_session_id"\n                    },\n                    "act": {\n                        "mapping_field": "activity"\n                    },\n                    "applicationType": {\n                        "mapping_field": "type"\n                    }\n                }\n            }\n            \n        }\n    }\n}\n',
  },
]);