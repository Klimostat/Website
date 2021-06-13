<?php
error_reporting(E_ALL);
include "session.php";

$stations = $conn->prepare("SELECT pk_station_id FROM station;");
$stations->execute();

$timestamp = $conn->prepare("SELECT utc_timestamp() AS ts;");
$timestamp->execute();

$two_days_ago = date("Y-m-d H:i:s", strtotime($timestamp->fetch(PDO::FETCH_ASSOC)["ts"] . " -2 day"));

echo "Connection to Database established\n\n";

while ($station = $stations->fetch(PDO::FETCH_ASSOC)) {
    $fk_station_id = $station["pk_station_id"];

    $data = $conn->prepare("
    SELECT timestamp(concat(left(l.pk_measurement_time, 17), '00')) time1,
           max(l.co2) max_co2,
           min(l.co2) min_co2,
           max(l.humidity) max_humidity,
           min(l.humidity) min_humidity,
           max(l.temperature) max_temperature,
           min(l.temperature) min_temperature
    FROM live_data l
    WHERE l.pk_measurement_time <= :to
    AND l.fk_station_id = :fk_station_id
    GROUP BY time1;
    ");


    $data->bindParam(":fk_station_id", $fk_station_id);
    $data->bindParam(":to", $two_days_ago);
    $data->execute();

    while ($line = $data->fetch(PDO::FETCH_ASSOC)) {
        echo ($min_co2 = $line["min_co2"]) . ", ";
        echo ($max_co2 = $line["max_co2"]) . ", ";
        echo ($min_humidity = $line["min_humidity"]) . ", ";
        echo ($max_humidity = $line["max_humidity"]) . ", ";
        echo ($min_temperature = $line["min_temperature"]) . ", ";
        echo ($max_temperature = $line["max_temperature"]) . ", ";
        echo ($time = $line["time1"]) . "\n";

        $insert_to_historical = $conn->prepare("
        INSERT INTO historical_data (`fk_station_id`, `pk_measurement_time`, `min_co2`, `max_co2`, `min_humidity`, `max_humidity`, `min_temperature`, `max_temperature`)
        VALUES (:fk_station_id, :time1, :min_co2, :max_co2, :min_humidity, :max_humidity, :min_temperature, :max_temperature)
        ");
        $insert_to_historical->bindParam(":min_co2", $min_co2);
        $insert_to_historical->bindParam(":max_co2", $max_co2);
        $insert_to_historical->bindParam(":min_humidity", $min_humidity);
        $insert_to_historical->bindParam(":max_humidity", $max_humidity);
        $insert_to_historical->bindParam(":min_temperature", $min_temperature);
        $insert_to_historical->bindParam(":max_temperature", $max_temperature);
        $insert_to_historical->bindParam(":time1", $time);
        $insert_to_historical->bindParam(":fk_station_id", $fk_station_id);
        try {
            $insert_to_historical->execute();
        } catch (PDOException $PDOException) {
            echo $PDOException;
        }
    }
}

$delete = $conn->prepare("DELETE FROM live_data WHERE pk_measurement_time < :since;");
$delete->bindParam(":since", $two_days_ago);
$delete->execute();
