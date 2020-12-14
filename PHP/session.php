<?php
error_reporting(0);
$conn = new PDO("mysql:host=localhost;dbname=Klimostat", "root", "passwd");
$session = verifySession();
$MAX_SESSION_AGE = 60;




function verifySession() {
    global $conn;
    if (isset($_COOKIE["sessionID"])) {
        $sessionID = $_COOKIE["sessionID"];

        //TODO: Clear sessions

        $user = $conn -> prepare("
select U.Username username , U.pk_userId userID, S.pk_sessionId sessionID from Session S
join User U on S.fk_userId = U.pk_userId
where pk_sessionId = :sessionID");
        $user -> bindParam(":sessionID", $sessionID);
        $user -> execute();
        if ($user -> rowCount() > 0) {
            $user = $user -> fetch(PDO::FETCH_ASSOC);
            return $user;
        }
    }
    return null;
}