<?php
/**
 * Prüft die Session und liefert bei erfolgreicher Verifizierung alle Informationen
 * eines Sensors aus der Datenbank im JSON-Format [{"id":"", "function":"", "unit"}, ...].
 */




require "session.php";
verifySession();

$data = $conn -> prepare("
select s.pk_SensorId id, s.funktionalitaet function, s.messeinheit unit from sensor s
");
$data -> execute();

$outString = "[";

if ($data -> rowCount() > 0) {
    while ($tupel = $data -> fetch(PDO::FETCH_ASSOC)) {
        $outString .= "{\"id\":\"{$tupel['id']}\",\"function\":\"{$tupel['function']}\",\"unit\":\"{$tupel['unit']}\"},";
    }
    $outString = substr($outString, 0, strlen($outString) - 1);
}



echo $outString . "]";
