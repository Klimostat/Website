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





require "session.php";
verifySession();

$from = $_POST["from"];
$to = $_POST["to"];
$sensorId = $_POST["sensorId"];
$interval = $_POST["interval"];

$timeStrLen = 19;
$timeAppend = "";

switch ($interval) {
    case "min":
        $timeStrLen = 16;
        $timeAppend = ":00";
        break;
    case "10min":
        $timeStrLen = 15;
        $timeAppend = "0:00";
        break;
    case "hr":
        $timeStrLen = 13;
        $timeAppend = ":00:00";
        break;
    case "day":
        $timeStrLen = 10;
        $timeAppend = "";
        break;
}

$data = $conn -> prepare("
select timestamp(concat(left(m.messzeitpunkt, :timeStrLen), :timeAppend)) zeit, max(m.messdaten) max, min(m.messdaten) min from messung m
where m.messzeitpunkt > :from
and m.messzeitpunkt <= :to
and m.fk_sensorId = :sensorId
group by zeit;
");

$data -> bindParam(":from", $from);
$data -> bindParam(":to", $to);
$data -> bindParam(":sensorId", $sensorId);
$data -> bindParam(":timeStrLen", $timeStrLen);
$data -> bindParam(":timeAppend", $timeAppend);
$data -> execute();

$outString = "[";

if ($data -> rowCount() > 0) {
    while ($tupel = $data -> fetch(PDO::FETCH_ASSOC)) {
        $outString .= "{\"time\":\"{$tupel['zeit']}\",\"min\":{$tupel['min']},\"max\":{$tupel['max']}},";
    }
    $outString = substr($outString, 0, strlen($outString) - 1);
}



echo $outString . "]";
