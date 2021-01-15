<?php
require "session.php";
verifySession();

$from = $_POST["from"];
$to = $_POST["to"];
$sensorId = $_POST["sensorId"];
$timewise = $_POST["timewise"];

$timeStrLen = 19;
$timeAppend = "";

switch ($timewise) {
    case "min":
        $timeStrLen = 16;
        $timeAppend = ":00";
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
