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

$outObject = null;

$interval = $_POST["interval"];

switch ($interval) {
    case "hour":
        $data = $conn -> prepare("
select timestamp(concat(left(l.pk_measurement_time, 17), '00')) time, max(l.co2) max_co2, min(l.co2) min_co2, max(l.humidity) max_humidity, min(l.humidity) min_humidity, max(l.temperature) max_temperature, min(l.temperature) min_temperature from live_data l
where timestampdiff(MINUTE, l.pk_measurement_time, utc_timestamp) < 61
and l.fk_station_id = :station_id
group by time;
");
        $outObject = queryToObject($data);
        break;


    case "day":
        $data = $conn -> prepare("
select timestamp(concat(left(l.pk_measurement_time, 15), '0:00')) time, max(l.co2) max_co2, min(l.co2) min_co2, max(l.humidity) max_humidity, min(l.humidity) min_humidity, max(l.temperature) max_temperature, min(l.temperature) min_temperature from live_data l
where timestampdiff(MINUTE, l.pk_measurement_time, utc_timestamp) < (24 * 60 + 1)
and l.fk_station_id = :station_id
group by time;
");
        $outObject = queryToObject($data);
        break;


    case "-1day":
        $outObject = pastDayFetch(1);
        break;


    case "-2day":
        $outObject = pastDayFetch(2);
        break;


    case "-3day":
        $outObject = pastDayFetch(3);
        break;


    case "-4day":
        $outObject = pastDayFetch(4);
        break;


    case "-5day":
        $outObject = pastDayFetch(5);
        break;


    case "-6day":
        $outObject = pastDayFetch(6);
        break;
}

echo json_encode($outObject);







function queryToObject($prepare) {
    global $stations;

    $outObject = [];

    for ($i = 0; $i < count($stations); $i++) {

        $prepare -> bindValue(":station_id", $stations[$i] -> id);
        $prepare -> execute();

        if ($prepare -> rowCount() > 0) {
            $outValuesPerStation = [];
            while ($tupel = $prepare -> fetch(PDO::FETCH_ASSOC)) {
                array_push($outValuesPerStation, ["time" => $tupel['time'], "minHumidity" => $tupel['min_humidity'], "maxHumidity" => $tupel['max_humidity'], "minTemperature" => $tupel['min_temperature'], "maxTemperature" => $tupel['max_temperature'], "minCo2" => $tupel['min_co2'], "maxCo2" => $tupel['max_co2']]);
            }
            array_push($outObject, ["id" => $stations[$i] -> id, "data" => $outValuesPerStation]);
        }
    }
    return $outObject;
}

function pastDayFetch($daysAgo) {
    global $conn;

    $data = $conn -> prepare("
select timestamp(concat(left(h.pk_measurement_time, 15), '0:00')) time, max(h.max_co2) max_co2, min(h.min_co2) min_co2, max(h.max_humidity) max_humidity, min(h.min_humidity) min_humidity, max(h.max_temperature) max_temperature, min(h.min_temperature) min_temperature from historical_data h
where h.pk_measurement_time < timestamp(subdate(utc_date, :daysFrom))
and h.pk_measurement_time > timestamp(subdate(utc_date, :daysUntil))
and h.fk_station_id = :station_id
group by time;
");
    $data -> bindValue(":daysFrom", $daysAgo - 1);
    $data -> bindValue(":daysUntil", $daysAgo);

    $obj = queryToObject($data);


    if (count($obj) == 0) {
        $data = $conn -> prepare("
select timestamp(concat(left(l.pk_measurement_time, 15), '0:00')) time, max(l.co2) max_co2, min(l.co2) min_co2, max(l.humidity) max_humidity, min(l.humidity) min_humidity, max(l.temperature) max_temperature, min(l.temperature) min_temperature from live_data l
where l.pk_measurement_time < timestamp(subdate(utc_date, :daysFrom))
and l.pk_measurement_time > timestamp(subdate(utc_date, :daysUntil))
and l.fk_station_id = :station_id
group by time;
");
        $data -> bindValue(":daysFrom", $daysAgo - 1);
        $data -> bindValue(":daysUntil", $daysAgo);

        $obj = queryToObject($data);
    }



    return $obj;
}