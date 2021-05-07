<?php
error_reporting(E_ALL);
$db = new PDO("mysql:host=localhost;dbname=klimostat", "root", "passwd");

$live_dataset = $db -> prepare("SELECT * from live_data");
$live_dataset -> execute();

while($zeile = $live_dataset -> fetch(PDO::FETCH_ASSOC)) {
    echo $co2 = $zeile['co2'];
    echo $humidity = $zeile['humidity'];
    echo $temperature = $zeile['temperature'];
    echo $timestamp = $zeile['pk_measurement_time'];
    $insert_to_historical = $db -> prepare("INSERT INTO historical_data (`fk_station_id`, `pk_measurement_time`, `co2`, `humidity`, `temperature`) VALUES (2 , :time1, :co2, :humidity, :temperature)");
    $insert_to_historical -> bindParam(":co2", $co2);
    $insert_to_historical -> bindParam(":humidity", $humidity);
    $insert_to_historical -> bindParam(":temperature", $temperature);
    $insert_to_historical -> bindParam(":time1", $timestamp);
    $insert_to_historical -> execute();
}

$historie = $db -> prepare("SELECT * from historical_data");
$historie -> execute();
while($zeile = $historie -> fetch(PDO::FETCH_ASSOC)) {
    echo '<br>' . $zeile['co2'];
    echo '<br>' . $zeile['humidity'];
    echo '<br>' . $zeile['temperature'];
}
?>
