-- (c) Klimostat

-- User
INSERT INTO `user` (`username`, `password_hash`)
VALUES ('admin2', '$argon2id$v=19$m=65536,t=4,p=1$SjNLQldCS0FLTGx1YTV2Vg$nFQ9uLFlD7Bu8iyBw0sd8ai923Z2CpwPSc7s3ErjbVo');

-- Station
INSERT INTO `station` (`name`, `location`, `token`, `threshold_co2`, `threshold_humidity`)
VALUE
    ('test_station', 'mobil', '$argon2id$v=19$m=65536,t=4,p=1$UUExSURscC5talRKNWk2Sg$WUB1PUiQOz5r6mHGK/zHC32eGaH3zO/j8SyQNBVjKtM', 2000, 30),
    ('Virt2', 'In der Datenbank', 'token2', 2000, 30),
    ('Virt3', 'In der Datenbank', 'token3', 2000, 30),
    ('Virt4', 'In der Datenbank', 'token4', 2000, 30),
    ('Virt5', 'In der Datenbank', 'token5', 2000, 30),
    ('Virt6', 'In der Datenbank', 'token6', 2000, 30),
    ('Virt7', 'In der Datenbank', 'token7', 2000, 30),
    ('Virt8', 'In der Datenbank', 'token8', 2000, 30),
    ('Virt9', 'In der Datenbank', 'token9', 2000, 30),
    ('Virt10', 'In der Datenbank', 'token10', 2000, 30),
    ('Virt11', 'In der Datenbank', 'token11', 2000, 30);
