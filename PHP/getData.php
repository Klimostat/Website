<?php
require "session.php";
verifySession();

$from = $_POST["from"];
$to = $_POST["to"];
$sensorId = $_POST["sensorId"];

$data = $conn -> prepare("
select m.messzeitpunkt zeit, m.messdaten daten from messung m
where m.messzeitpunkt > :from
and m.messzeitpunkt <= :to
and m.fk_sensorId = :sensorId
");
$data -> bindParam(":from", $from);
$data -> bindParam(":to", $to);
$data -> bindParam(":sensorId", $sensorId);
$data -> execute();

$outString = "[";

if ($data -> rowCount() > 0) {
    while ($tupel = $data -> fetch(PDO::FETCH_ASSOC)) {
        $outString .= "{\"time\":\"{$tupel['zeit']}\",\"value\":{$tupel['daten']}},";
    }
    $outString = substr($outString, 0, strlen($outString) - 1);
}



echo $outString . "]";
