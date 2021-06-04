<?php
error_reporting(E_ALL);
$db = new PDO("mysql:host=localhost;dbname=klimostat", "root", "passwd");

$fk_station_id = 0;
while ($fk_station_id <= 4){
    $fk_station_id++;

    $from = "2020-05-10 00:00:00";
    $to = "2022-05-11 00:00:00";
    $data = $db->prepare("
    select timestamp(concat(left(l.pk_measurement_time, 17), '00')) time1, max(l.co2) max_co2, min(l.co2) min_co2, max(l.humidity) max_humidity, min(l.humidity) min_humidity, max(l.temperature) max_temperature, min(l.temperature) min_temperature from live_data l
    where l.pk_measurement_time > :from
    and l.pk_measurement_time <= :to
    and l.fk_station_id = :fk_station_id
    group by time1;
    ");
    echo "lol";
    $data->bindParam(":fk_station_id", $fk_station_id);
    $data->bindParam(":from", $from);
    $data->bindParam(":to", $to);
    $data->execute();

    while ($zeile = $data->fetch(PDO::FETCH_ASSOC)) {
        echo $min_co2 = $zeile['min_co2'];
        echo $max_co2 = $zeile['max_co2'];
        echo $min_humidity = $zeile['min_humidity'];
        echo $max_humidity = $zeile['max_humidity'];
        echo $min_temperature = $zeile['min_temperature'];
        echo $max_temperature = $zeile['max_temperature'];
        echo $time = $zeile['time1'];
        $insert_to_historical = $db->prepare("INSERT INTO historical_data (`fk_station_id`, `pk_measurement_time`, `min_co2`, `max_co2`, `min_humidity`, `max_humidity`, `min_temperature`, `max_temperature`) VALUES (:fk_station_id, :time1, :min_co2, :max_co2, :min_humidity, :max_humidity, :min_temperature, :max_temperature)");
        $insert_to_historical->bindParam(":min_co2", $min_co2);
        $insert_to_historical->bindParam(":max_co2", $max_co2);
        $insert_to_historical->bindParam(":min_humidity", $min_humidity);
        $insert_to_historical->bindParam(":max_humidity", $max_humidity);
        $insert_to_historical->bindParam(":min_temperature", $min_temperature);
        $insert_to_historical->bindParam(":max_temperature", $max_temperature);
        $insert_to_historical->bindParam(":time1", $time);
        $insert_to_historical->bindParam(":fk_station_id", $fk_station_id);
        $insert_to_historical->execute();
    }
}
?>