<?php
/**
 * Prüft die Session und liefert bei erfolgreicher Verifizierung alle Messwerte
 * eines Sensors aus der Datenbank von einem Zeitpunkt an im JSON-Format [{"time":"", "value":""}, ...].
 * POST-Attribute:
 * 1. from: ein timestamp in SQL-Schreibweise. Ist dieser nicht gegeben, so wird der Zeitpunkt vor 10 Minuten genommen
 * 2. sensorId: die id des Sensors in der Datenbank
 */




require "session.php";
//verifySession();

if (isset($_POST["from"])) {
    $data = $conn -> prepare("
select m.pk_measurement_time time, m.co2, m.humidity, m.temperature from live_data m
where m.pk_measurement_time > :from
and m.fk_station_id = :station_id
");
    $data -> bindParam(":from", $_POST["from"]);
} else {
    $data = $conn -> prepare("
select m.pk_measurement_time time, m.co2, m.humidity, m.temperature from live_data m
where m.pk_measurement_time > subtime(utc_timestamp, '00:10:00')
and m.fk_station_id = :station_id
");
}

$data -> bindParam(":station_id", $_POST["station_id"]);
$data -> execute();

$outString = "[";

if ($data -> rowCount() > 0) {
    while ($tupel = $data -> fetch(PDO::FETCH_ASSOC)) {
        $outString .= "{\"time\":\"{$tupel['time']}\",\"humidity\":{$tupel['humidity']},\"temperature\":{$tupel['temperature']},\"co2\":{$tupel['co2']}},";
    }
    $outString = substr($outString, 0, strlen($outString) - 1);
}



echo $outString . "]";
