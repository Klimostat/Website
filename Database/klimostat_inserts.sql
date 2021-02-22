-- (c) Klimostat

drop database if exists klimostat;
create database if not exists klimostat;
use klimostat;


drop table if exists sensor;
create table if not exists sensor (
    pk_SensorId integer primary key auto_increment,
    sensortyp text not null,
    standortbeschreibung text not null,
    funktionalitaet text not null,
    messeinheit text not null,
    grenzwert float not null
);

drop table if exists messung;
create table if not exists messung (
    pk_messungId int primary key auto_increment,
    messzeitpunkt timestamp not null default utc_timestamp(),
    messdaten float not null,
    fk_sensorId int not null,
    constraint foreign key fk_messung_sensor (fk_sensorId) references sensor (pk_sensorId)
       on update cascade
       on delete no action
);

drop table if exists `user`;
create table if not exists `user` (
    pk_userId int primary key auto_increment,
    username varchar(32) not null,
    passwordHash text not null,
    constraint unique_username unique (username)
);

drop table if exists `session`;
create table if not exists `session` (
    pk_sessionId varchar(256) primary key,
    fk_userId int not null,
    lastupdatetime timestamp not null default utc_timestamp(),
    constraint fk_session_user foreign key (fk_userId) references user (pk_userId)
        on update cascade
        on delete cascade
);

delete from `user` where 1;
-- user: root
-- password: passwd

-- user: admin
-- password: siehe DC
insert into `user` (username, passwordHash)
values /*('root', '$argon2i$v=19$m=65536,t=4,p=1$Q0VaLnlJTmZ1bVV5Rzc2VA$9XUzJdSLxRz+J23xePMaUnD9mRBfNTC5T7n3KwOv77c'),*/
       ('admin', '$argon2i$v=19$m=65536,t=4,p=1$WEk3Umtkakd4TG45WE9HYw$1vUexeQW6NKRAPAIfY9nOvWt1Lkz73vmwtZKDqHPAk0');


insert into sensor (pk_SensorId, sensortyp, standortbeschreibung, funktionalitaet, messeinheit, grenzwert) values
(1, 'DHT11_temperature', 'florentins_zimmer', 'Temperaturmessung', '°C', 30),
(2, 'DHT11_humidity', 'florentins_zimmer', 'Luftfeuchtigkeitsmessung', '%', 80),
(3, 'MHZ14A_co2', 'florentins_zimmer', 'CO2-Konzentrationsmessung', 'ppm', 2500),
(4, 'Kabel', 'florentins_zimmer', 'Wassereinbruch', 'True/False', 1);