-- (c) Klimostat

DROP DATABASE IF EXISTS `klimostat`;
CREATE DATABASE IF NOT EXISTS `klimostat`;
USE `klimostat`;


DROP TABLE IF EXISTS `sensor`;
CREATE TABLE IF NOT EXISTS `sensor` (
    `pk_sensorid` INTEGER PRIMARY KEY AUTO_INCREMENT,
    `sensortype` TEXT NOT NULL,
    `locationdescription` TEXT NOT NULL,
    `functionality` TEXT NOT NULL,
    `measuring_unit` TEXT NOT NULL,
    `threshold` FLOAT NOT NULL
);

DROP TABLE IF EXISTS `measurement`;
CREATE TABLE IF NOT EXISTS `measurement` (
    `pk_measurementid` INT PRIMARY KEY AUTO_INCREMENT,
    `measuring_time` TIMESTAMP NOT NULL DEFAULT UTC_TIMESTAMP(),
    `measuring_data` FLOAT NOT NULL,
    `fk_sensorid` INT NOT NULL,
    CONSTRAINT FOREIGN KEY `fk_measurement_sensor`(`fk_sensorId`) REFERENCES `sensor`(`pk_sensorid`)
       ON UPDATE CASCADE
       ON DELETE NO ACTION
);

DROP TABLE IF EXISTS `user`;
CREATE TABLE IF NOT EXISTS `user` (
    `pk_userid` INT PRIMARY KEY AUTO_INCREMENT,
    `username` VARCHAR(32) NOT NULL,
    `passwordhash` TEXT NOT NULL,
    CONSTRAINT UNIQUE_USERNAME UNIQUE (`username`)
);

DROP TABLE IF EXISTS `session`;
CREATE TABLE IF NOT EXISTS `session` (
    `pk_sessionid` VARCHAR(256) PRIMARY KEY,
    `fk_userid` INT NOT NULL,
    `lastupdatetime` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    CONSTRAINT `fk_session_user` FOREIGN KEY (`fk_userid`) REFERENCES `user` (`pk_userid`)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

DELETE FROM `user` WHERE 1;
-- user: admin
-- password: passwd
INSERT INTO `user` (`pk_userid`, `username`, `passwordhash`)
VALUES (0, 'admin', '$argon2id$v=19$m=65536,t=4,p=1$SjNLQldCS0FLTGx1YTV2Vg$nFQ9uLFlD7Bu8iyBw0sd8ai923Z2CpwPSc7s3ErjbVo');
