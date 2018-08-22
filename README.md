congregreat-server
===

[![Build Status](https://travis-ci.com/drewsmith/congregreat-server.svg?token=w9qCFsdDt69XgriyzpJj&branch=master)](https://travis-ci.com/drewsmith/congregreat-server)

The backend for congregreat

## Stack

* nodejs `>= 9.8.0`
* express `~4.15.5`
* sequelize `^4.35.2`
  ```
  npm install -g sequelize sequelize-cli mysql2
  ```
  These should also be global installs to run cli migrations.

## Local MySQL database

```
docker run --name congregreat-db \
  -p 5306:3306 \
  -e MYSQL_ROOT_PASSWORD=r00tadm1n \
  -e MYSQL_PASSWORD=c0ngr3gr8 \
  -e MYSQL_USER=gr8admin \
  -e MYSQL_DATABASE=congregreat \
  -v mysql-data:/var/lib/mysql \
  -d mysql
```

connect via cli

```
docker exec -it congregreat-db mysql -u gr8admin -p
Enter Password:
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 24
Server version: 5.7.21 MySQL Community Server (GPL)

Copyright (c) 2000, 2018, Oracle and/or its affiliates. All rights reserved.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql>
```

JDBC:
```
jdbc:mysql://gr8admin:<password>@localhost:5306/congregreat
```

## Environment Variables
JWT_PASSPHRASE Passphrase used to Sign and Verify jsonwebtokens.
JWT_PRIVATE Path to the private pem file used to Sign and Verify jsonwebtokens.
JWT_PUBLIC Path to the public pem file used to Sign and Verify jsonwebtokens.
