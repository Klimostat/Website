<?php
include "session.php";

header("Content-Type: text/csv; charset=utf-8");
header("Content-Disposition: attachment; filename=data.csv");

$output = fopen("php://output", "w");

fputcsv($output, array("station_id", "time", "min_humidity", "max_humidity", "min_co2", "max_co2", "min_temperature", "max_temperature"));

$hist = $conn -> prepare("
select h.fk_station_id station_id, h.pk_measurement_time time, h.min_humidity, h.max_humidity, h.min_co2, h.max_co2, h.min_temperature, h.max_temperature from historical_data h
order by station_id, time
");
$hist -> execute();

while ($row = $hist -> fetch(PDO::FETCH_NUM)) {
    fputcsv($output, $row);
}