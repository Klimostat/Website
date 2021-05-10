<?php
/**
 * Prüft die Session und liefert bei erfolgreicher Verifizierung alle Messwerte
 * eines Sensors aus der Datenbank von einem Zeitpunkt an im JSON-Format [{"time":"", "value":""}, ...].
 * POST-Attribute:
 * 1. from: ein timestamp in SQL-Schreibweise. Ist dieser nicht gegeben, so wird der Zeitpunkt vor 10 Minuten genommen
 * 2. sensorId: die id des Sensors in der Datenbank
 */




require "session.php";
verifySession();

$data = $conn -> prepare("
select m.pk_measurement_time time, m.co2, m.humidity, m.temperature, m.fk_station_id station from live_data m
where m.fk_station_id in (:station_ids)
order by pk_measurement_time
limit 1;
");

$data -> bindParam(":station_ids", $_POST["station_ids"]);
$data -> execute();

$outString = "[";
$outvar = ["hallo" => "hey"];
if ($data -> rowCount() > 0) {
    while ($tupel = $data -> fetch(PDO::FETCH_ASSOC)) {
        $outString .= "{\"station\":\"{$tupel['station']}\",\"time\":\"{$tupel['time']}\",\"humidity\":{$tupel['humidity']},\"temperature\":{$tupel['temperature']},\"co2\":{$tupel['co2']}},";
    }
    $outString = substr($outString, 0, strlen($outString) - 1);
}



echo $outString . "]";
