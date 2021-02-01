"""CTE to CE migration script.

Run this script after upgrading the Core and UI containers from CTE 1.0.0/2.0.x
to CE 3.0.0.

- When upgrading containers, make sure to not delete the `mongodb` container.
- Explicitly specify names of the `core` and `ui` containers to remove them as
  without using the names all 3 of the containers will be removed. 


> docker-compose rm core ui
> docker-compose pull core ui
> docker-compose up -d
> docker cp migrate.py core:/opt
> docker exec -ti core python /opt/migrate.py
"""
import asyncio

from netskope.common.utils import DBConnector, Collections
from netskope.common.models import TenantIn
from netskope.common.api.routers.tenants import create_tenant

loop = asyncio.get_event_loop()
connector = DBConnector()
# update aging task for CTE
connector.collection(Collections.SCHEDULES).update_one(
    {"name": "INTERNAL INDICATOR AGING TASK"},
    {"$set": {"task": "cte.age_indicators"}},
)

# add ITSM tasks
connector.collection(Collections.SCHEDULES).update_one(
    {"name": "INTERNAL UNMUTE TASK"},
    {
        "$set": {
            "_cls": "PeriodicTask",
            "name": "INTERNAL UNMUTE TASK",
            "enabled": True,
            "args": [],
            "task": "itsm.unmute",
            "interval": {"every": 5, "period": "minutes"},
        }
    },
    upsert=True,
)

connector.collection(Collections.SCHEDULES).update_one(
    {"name": "INTERNAL ALERT CLEANUP TASK"},
    {
        "$set": {
            "_cls": "PeriodicTask",
            "name": "INTERNAL ALERT CLEANUP TASK",
            "enabled": True,
            "args": [],
            "task": "itsm.delete_alerts",
            "interval": {"every": 12, "period": "hours"},
        }
    },
    upsert=True,
)

# Update task
connector.collection(Collections.SCHEDULES).update_one(
    {"name": "INTERNAL UPDATE TASK"},
    {
        "$set": {
            "_cls": "PeriodicTask",
            "name": "INTERNAL UPDATE TASK",
            "enabled": True,
            "args": [],
            "task": "common.check_updates",
            "interval": {"every": 12, "period": "hours"},
        }
    },
    upsert=True,
)

connector.collection(Collections.SETTINGS).update_one(
    {},
    {
        "$set": {
            "databaseVersion": "2.0.0",
            "alertCleanup": 7,
            "ssoEnable": False,
            "ssosaml": {},
            "enableUpdateChecking": True,
            "platforms": {"cte": True, "itsm": True},
        }
    },
)

connector.collection(Collections.SCHEDULES).update_many(
    {"task": "cte.tasks.plugin_lifecycle_task.execute_plugin"},
    {"$set": {"task": "cte.execute_plugin"}},
)


connector.collection(Collections.USERS).update_many(
    {}, {"$set": {"sso": False}},
)


connector.collection(Collections.CONFIGURATIONS).update_many(
    {"plugin": "CrowdStrike"}, {"$set": {"plugin": "crowdstrike"}}
)

for config in connector.collection(Collections.CONFIGURATIONS).find(
    {"$not": {"tenant": None}}
):
    name = config.get("name")
    connector.collection(Collections.SCHEDULES).delete_one(
        {"args": {"$in": [name]}}
    )


for config in connector.collection(Collections.ITSM_CONFIGURATIONS).find(
    {"$not": {"tenant": None}}
):
    name = config.get("name")
    connector.collection(Collections.SCHEDULES).delete_one(
        {"args": {"$in": [name]}}
    )


def update_plugin_field(collection):
    """Update plugin field values to match new format."""
    for configuration in connector.collection(collection).find({}):
        if configuration.get("name").startswith("netskope.plugins.Default"):
            continue
        connector.collection(collection).update_one(
            {"name": configuration.get("name")},
            {
                "$set": {
                    "plugin": f"netskope.plugins.Default.{configuration.get('plugin')}.main",
                    "tenant": None,
                }
            },
        )


update_plugin_field(Collections.CONFIGURATIONS)
update_plugin_field(Collections.ITSM_CONFIGURATIONS)

# create tenants for CTE Netskope configurations
for configuration in connector.collection(Collections.CONFIGURATIONS).find({}):
    if configuration.get("plugin") != "netskope.plugins.Default.netskope.main":
        continue
    if configuration.get("tenant") is not None:  # already new configuration
        continue
    params = configuration.get("parameters", {})
    tenant, token = params.get("tenant_name"), params.get("api_token")
    tenant_config = connector.collection(
        Collections.NETSKOPE_TENANTS
    ).find_one({"tenantName": tenant})
    if tenant_config is None:  # does not exist; create it
        tenant_config = TenantIn(name=tenant, tenantName=tenant, token=token)
        loop.run_until_complete(create_tenant(tenant_config))
        tenant_config = tenant_config.dict()
    connector.collection(Collections.CONFIGURATIONS).update_one(
        {"name": configuration.get("name")},
        {"$set": {"tenant": tenant_config.get("name")}},
    )

# create tenants for CTO Netskope configurations
for configuration in connector.collection(
    Collections.ITSM_CONFIGURATIONS
).find({}):
    if (
        configuration.get("plugin")
        != "netskope.plugins.Default.netskope_itsm.main"
    ):
        continue
    if configuration.get("tenant") is not None:  # already new configuration
        continue
    params = configuration.get("parameters", {}).get("auth", {})
    tenant, token = params.get("tenant_name"), params.get("token")
    tenant_config = connector.collection(
        Collections.NETSKOPE_TENANTS
    ).find_one({"tenantName": tenant})
    if tenant_config is None:  # does not exist; create it
        tenant_config = TenantIn(name=tenant, tenantName=tenant, token=token)
        loop.run_until_complete(create_tenant(tenant_config))
        tenant_config = tenant_config.dict()
    connector.collection(Collections.ITSM_CONFIGURATIONS).update_one(
        {"name": configuration.get("name")},
        {"$set": {"tenant": tenant_config.get("name")}},
    )


# update business rules with mappings
for rule in connector.collection(Collections.ITSM_BUSINESS_RULES).find({}):
    queues = rule.get("queues", {})
    for name, items in queues.items():
        for item in items:
            if "mappings" in item:  # already new mapping
                continue
            config = connector.collection(
                Collections.ITSM_CONFIGURATIONS
            ).find_one({"name": name})
            if config is None:
                continue
            item["mappings"] = config.get("mappings", [])
    connector.collection(Collections.ITSM_BUSINESS_RULES).update_one(
        {"name": rule.get("name")},
        {"$set": {"queues": rule.get("queues", {})}},
    )


print("Successfully migrated database to version 2.0.0")
