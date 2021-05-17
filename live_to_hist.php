<?php
error_reporting(E_ALL);
$db = new PDO("mysql:host=localhost;dbname=klimostat", "root", "passwd");

echo "lol";

if(false) {
$live_dataset = $db -> prepare("SELECT * from live_data");
$live_dataset -> execute();

    while ($zeile = $live_dataset->fetch(PDO::FETCH_ASSOC)) {
        $insert_to_historical = $db->prepare("INSERT INTO historical_data (`fk_station_id`, `pk_measurement_time`, `co2`, `humidity`, `temperature`) VALUES (2 , :time1, :co2, :humidity, :temperature)");
        $insert_to_historical->bindParam(":co2", $co2);
        $insert_to_historical->bindParam(":humidity", $humidity);
        $insert_to_historical->bindParam(":temperature", $temperature);
        $insert_to_historical->bindParam(":time1", $timestamp);
        $insert_to_historical->execute();
    }
    $historie = $db->prepare("SELECT * from historical_data");
    $historie->execute();
    while ($zeile = $historie->fetch(PDO::FETCH_ASSOC)) {
        echo '<br>' . $zeile['co2'];
        echo '<br>' . $zeile['humidity'];
        echo '<br>' . $zeile['temperature'];
    }
}

switch ("min") {
    case "min":
        $timeStrLen = 16;
        $timeAppend = ":00";
        break;
}

$from = "2020-05-10 00:00:00";
$to = "2021-05-11 00:00:00";
$fk_station_id = "2";
$data = $db -> prepare("
select timestamp(concat(left(l.pk_measurement_time, 16), '00')) time, max(l.co2) max_co2, min(l.co2) min_co2, max(l.humidity) max_humidity, min(l.humidity) min_humidity, max(l.temperature) max_temperature, min(l.temperature) min_temperature from live_data l
where l.pk_measurement_time > :from
and l.pk_measurement_time <= :to
and l.fk_station_id = :fk_station_id
group by time;
");

$data -> bindParam(":fk_station_id", $fk_station_id);
$data -> bindParam(":from", $from);
$data -> bindParam(":to", $to);
$data -> execute();
while($zeile = $data -> fetch(PDO::FETCH_ASSOC)){
    echo $co2 = $zeile['min_co2'];
    echo $co2 = $zeile['max_co2'];
    echo $humidity = $zeile['min_humidity'];
    echo $humidity = $zeile['max_humidity'];
    echo $zeile['min_temperature'];
    echo $zeile['max_temperature'];
    echo $time = $zeile['time'];
    echo $zeile['fk_station_id'];
    $insert_to_historical = $db -> prepare("INSERT INTO historical_data (`fk_station_id`, `pk_measurement_time`, `min_co2`, `max_co2`, `min_humidity`, `max_humidity`, `min_temperature`, `max_temperature`) VALUES (:id , :time, :min_co2, :max_co2, :min_humidity, :max_humidity, :min_temperature, :max_temperature)");
    $insert_to_historical -> bindParam(":min_co2", $min_co2);
    $insert_to_historical -> bindParam(":max_co2", $max_co2);
    $insert_to_historical -> bindParam(":min_humidity", $min_humidity);
    $insert_to_historical -> bindParam(":max_humidity", $max_humidity);
    $insert_to_historical -> bindParam(":min_temperature", $min_temperature);
    $insert_to_historical -> bindParam(":max_temperature", $max_temperature);
    $insert_to_historical -> bindParam(":id", $fk_station_id);
    $insert_to_historical -> bindParam(":time", $time);
    $insert_to_historical -> execute();
}
?>
