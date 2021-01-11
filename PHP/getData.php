<?php
require "session.php";
verifySession();

$from = $_POST["from"];
$to = $_POST["to"];
$sensorId = $_POST["sensorId"];

$data = $conn -> prepare("
select m.messzeitpunkt zeit, m.messdaten daten from messung m
where m.messzeitpunkt >= :from
and m.messzeitpunkt <= :to
and m.fk_sensorId = :sensorId
");
$data -> bindParam(":from", $from);
$data -> bindParam(":to", $to);
$data -> bindParam(":sensorId", $sensorId);
$data -> execute();

$labels = "[";
$values = "[";

while ($tupel = $data -> fetch(PDO::FETCH_ASSOC)) {
    $labels .= "\"{$tupel['zeit']}\",";
    $values .= "\"{$tupel['daten']}\",";
}

$labels = substr($labels, 0, strlen($labels) - 1) . "]";
$values = substr($values, 0, strlen($values) - 1) . "]";

echo "{\"labels\": $labels, \"values\": $values}";