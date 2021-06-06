<?php
/**
 * Prüft die Session und liefert bei erfolgreicher Verifizierung alle Informationen
 * aller Sensoren aus der Datenbank im JSON-Format.
 */




require "session.php";
verifySession();
header("Content-Type: text/json", false);

$data = $conn -> prepare("
select s.pk_station_id, s.name, s.alert_message_humidity, s.alert_message_co2, s.location from station s
");
$data -> execute();

$outObject = [];

if ($data -> rowCount() > 0) {
    while ($tupel = $data -> fetch(PDO::FETCH_ASSOC)) {
        $stationObject = [];
        foreach ($tupel as $key => $value) {
            $stationObject[$key] = $value;
        }
        array_push($outObject, $stationObject);
    }
}

echo json_encode($outObject);
