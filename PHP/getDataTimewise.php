<?php
/**
 * Liefert alle Messwerte eines Sensors aus der Datenbank von einem Zeitpunkt bis zu einem anderen Zeitpunkt an.
 * Die Datensätze werden in Intervallen zu min/max-Werten im JSON-Format [{"time":"", "min":"", "max":""},...] zusammengefasst.
 * POST-Attribute:
 * 1. from: ein timestamp in SQL-Schreibweise
 * 2. to: ein timestamp in SQL-Schreibweise
 * 3. sensorId: die id des Sensors in der Datenbank
 * 4. interval: das Interval, in dem Datensätze zusammengefasst werden sollen, mögliche Optionen sind "min", "10min", "hr" und "day"
 */




//sleep(3);
require "session.php";
verifySession();
header("Content-Type: text/json", false);

$stations = json_decode($_POST["stations"]);
$outObject = [];

$interval = $_POST["interval"];

$data = $data = $conn -> prepare("
select timestamp(concat(left(l.pk_measurement_time, 17), '00')) time, max(l.co2) max_co2, min(l.co2) min_co2, max(l.humidity) max_humidity, min(l.humidity) min_humidity, max(l.temperature) max_temperature, min(l.temperature) min_temperature from live_data l
where l.pk_measurement_time > subtime(utc_timestamp, '01:00:10')
and l.fk_station_id = :station_id
group by time;
");

switch ($interval) {
    case "hour":
        $data = $conn -> prepare("
select timestamp(concat(left(l.pk_measurement_time, 17), '00')) time, max(l.co2) max_co2, min(l.co2) min_co2, max(l.humidity) max_humidity, min(l.humidity) min_humidity, max(l.temperature) max_temperature, min(l.temperature) min_temperature from live_data l
where l.pk_measurement_time > subtime(utc_timestamp, '01:00:10')
and l.fk_station_id = :station_id
group by time;
");
        break;
    case "day":
        $timeStrLen = 15;
        $timeAppend = "0:00";
        break;
    case "hr":
        $timeStrLen = 13;
        $timeAppend = ":00:00";
        break;
}

for ($i = 0; $i < count($stations); $i++) {

    $data -> bindParam(":station_id", $stations[$i] -> id);
    $data -> execute();

    if ($data -> rowCount() > 0) {
        $outValuesPerStation = [];
        while ($tupel = $data -> fetch(PDO::FETCH_ASSOC)) {
            array_push($outValuesPerStation, ["time" => $tupel['time'], "minHumidity" => $tupel['min_humidity'], "maxHumidity" => $tupel['max_humidity'], "minTemperature" => $tupel['min_temperature'], "maxTemperature" => $tupel['max_temperature'], "minCo2" => $tupel['min_co2'], "maxCo2" => $tupel['max_co2']]);
        }
        array_push($outObject, ["id" => $stations[$i] -> id, "data" => $outValuesPerStation]);
    }
}

echo json_encode($outObject);