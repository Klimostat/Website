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
header("Content-Type: text/json");

$stations = json_decode($_POST["stations"]);
//print_r($stations);
$outObject = array();

for ($i = 0; $i < count($stations); $i++) {
    if ($stations[$i]->since != null) {
        $data = $conn -> prepare("
select m.pk_measurement_time time, m.co2, m.humidity, m.temperature from live_data m
where m.pk_measurement_time > :from
and m.fk_station_id = :station_id
");
        $data -> bindParam(":from", $stations[$i]->since);
    } else {
        $data = $conn -> prepare("
select m.pk_measurement_time time, m.co2, m.humidity, m.temperature from live_data m
where m.pk_measurement_time > subtime(utc_timestamp, '00:05:10')
and m.fk_station_id = :station_id
");
    }

    $data -> bindParam(":station_id", $stations[$i]->id);
    $data -> execute();


    if ($data -> rowCount() > 0) {
        $outValuesPerStation = array();
        while ($tupel = $data -> fetch(PDO::FETCH_ASSOC)) {
            array_push($outValuesPerStation, ["time" => $tupel['time'], "humidity" => $tupel['humidity'], "temperature" => $tupel['temperature'], "co2" => $tupel['co2']]);
        }
        array_push($outObject, ["id" => $stations[$i]->id, "data" => $outValuesPerStation]);
    }
}

echo json_encode($outObject);