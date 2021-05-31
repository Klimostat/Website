<?php
include "session.php";

$conn -> query("
insert into live_data (co2, humidity, temperature, fk_station_id)
values (200 + 50 * rand(), 30 + 10 * rand(), 20 + 3 * rand(), 2),
    (200 + 50 * rand(), 30 + 10 * rand(), 20 + 3 * rand(), 3),
    (200 + 50 * rand(), 30 + 10 * rand(), 20 + 3 * rand(), 4),
    (200 + 50 * rand(), 30 + 10 * rand(), 20 + 3 * rand(), 5),
    (200 + 50 * rand(), 30 + 10 * rand(), 20 + 3 * rand(), 6),
    (200 + 50 * rand(), 30 + 10 * rand(), 20 + 3 * rand(), 7),
    (200 + 50 * rand(), 30 + 10 * rand(), 20 + 3 * rand(), 8),
    (200 + 50 * rand(), 30 + 10 * rand(), 20 + 3 * rand(), 9),
    (200 + 50 * rand(), 30 + 10 * rand(), 20 + 3 * rand(), 10),
    (200 + 50 * rand(), 30 + 10 * rand(), 20 + 3 * rand(), 11);
    ");