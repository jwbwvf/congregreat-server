congregreat-server
===

The backend for congregreat

## Stack

* nodejs
* express
* sequelize

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
