<?php
/**
 * Prüft die Session und liefert bei erfolgreicher Verifizierung alle Informationen
 * aller Sensoren aus der Datenbank im JSON-Format.
 */




require "session.php";
//verifySession();

$data = $conn -> prepare("
select s.* from station s
");
$data -> execute();

$outString = "[";

if ($data -> rowCount() > 0) {
    while ($tupel = $data -> fetch(PDO::FETCH_ASSOC)) {
        $outString .= "{";
        foreach ($tupel as $key => $value) {
            $outString .= "\"$key\":\"$value\",";
        }
        $outString = substr($outString, 0, strlen($outString) - 1) . "},";
    }
    $outString = substr($outString, 0, strlen($outString) - 1);
}



echo $outString . "]";
