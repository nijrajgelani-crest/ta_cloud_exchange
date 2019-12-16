if (db.getUser('cteadmin') == null) {
    db.createUser({user: "cteadmin", pwd: "cteadmin", roles: [{role: "readWrite", db: "cte"}]});
}