-- (c) Klimostat
-- v2.0 Jakob Jakwerth 2020-12-21

drop database if exists Klimostat;
create database if not exists Klimostat;
use Klimostat;

drop table if exists Raspberry;
create table if not exists RaspberryPi (
    pk_RaspberryPiId int primary key,
    Standortbeschreibung text not null
);

drop table if exists Sensor;
create table if not exists Sensor (
    pk_SensorId integer primary key,
    Bezeichnung text not null,
    Standortbeschreibung text not null,
    Funktionalitaet text not null,
    fk_RaspberryPiId int not null,
    constraint foreign key fk_Sensor_RaspberryPi (fk_RaspberryPiId) references RaspberryPi (pk_RaspberryPiId)
        on update cascade
        on delete no action
);

drop table if exists Messung;
create table if not exists Messung (
    pk_messungId int primary key,
    Messzeitpunkt timestamp not null,
    Messdaten float not null,
    Messeinheit enum('°C', 'ppm', '%') not null,
    fk_SensorId int not null,
    constraint foreign key fk_Messung_Sensor (fk_SensorId) references Sensor (pk_SensorId)
       on update cascade
       on delete no action
);

drop table if exists User;
create table if not exists User (
    pk_userId int primary key,
    Username varchar(32) not null,
    PasswordHash text not null,
    constraint unique_Username unique (Username)
);

drop table if exists Session;
create table if not exists Session (
    pk_sessionId varchar(256) not null primary key,
    fk_userId int not null,
    lastupdatetime timestamp not null default current_timestamp(),
    constraint fk_session_user foreign key (fk_userId) references User (pk_userId)
        on update cascade
        on delete cascade
);

delete from User;
-- user: root
-- password: passwd
insert into User (pk_userId, Username, PasswordHash)
values (0, 'root', '$argon2i$v=19$m=65536,t=4,p=1$Q0VaLnlJTmZ1bVV5Rzc2VA$9XUzJdSLxRz+J23xePMaUnD9mRBfNTC5T7n3KwOv77c');