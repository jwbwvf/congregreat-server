congregreat-server
===

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
Enter a Password:
```

JDBC:
```
jdbc:mysql://gr8admin:<password>@localhost:5306/congregreat
```
