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

if (isset($_POST["from"])) {
    $data = $conn -> prepare("
select m.messzeitpunkt zeit, m.messdaten daten from messung m
where m.messzeitpunkt > :from
and m.fk_sensorId = :sensorId
");
    $data -> bindParam(":from", $_POST["from"]);
} else {
    $data = $conn -> prepare("
select m.messzeitpunkt zeit, m.messdaten daten from messung m
where m.messzeitpunkt > subtime(utc_timestamp, '00:10:00')
and m.fk_sensorId = :sensorId
");
}

$data -> bindParam(":sensorId", $_POST["sensorId"]);
$data -> execute();

$outString = "[";

if ($data -> rowCount() > 0) {
    while ($tupel = $data -> fetch(PDO::FETCH_ASSOC)) {
        $outString .= "{\"time\":\"{$tupel['zeit']}\",\"value\":{$tupel['daten']}},";
    }
    $outString = substr($outString, 0, strlen($outString) - 1);
}



echo $outString . "]";
