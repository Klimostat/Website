<?php
error_reporting(0);
$conn = new PDO("mysql:host=localhost;dbname=Klimostat", "root", "passwd");
$session = verifySession();
$MAX_SESSION_AGE = 3600*24;




/**
 * Überprüft, ob eine Session am laufen ist
 * @return mixed|null je nach dem, ob eine Session läuft oder nicht, einen AssocArray mit Sessionvariablen oder null
 */
function verifySession() {
    global $conn, $MAX_SESSION_AGE;
    if (isset($_COOKIE["sessionID"])) {
        $sessionID = $_COOKIE["sessionID"];

        $sessClear = $conn -> prepare("
delete from Session
where current_timestamp() - lastupdatetime > :maxAge");
        $sessClear -> bindParam(":maxAge", $MAX_SESSION_AGE);
        $sessClear -> execute();

        $user = $conn -> prepare("
select U.Username username , U.pk_userId userID, S.pk_sessionId sessionID from Session S
join User U on S.fk_userId = U.pk_userId
where pk_sessionId = :sessionID");
        $user -> bindParam(":sessionID", $sessionID);
        $user -> execute();
        if ($user -> rowCount() > 0) {
            $user = $user -> fetch(PDO::FETCH_ASSOC);
            return $user;
        } else if ($_GET["action"] !== "session_expired"){

            landingPage("session_expired");

        }
    }
    return null;
}

/**
 * Lädt die Landing-page mit einer Statusmeldung
 * @param $action string die Bezeichnung der Statusmeldung
 */
function landingPage($action) {
    header("Location: .?action=$action");
}