<?php
require "session.php";

if ($session !== null) {

    setcookie("sessionID", 0, time() - 1, "/");
    $clearSession = $conn -> prepare("
delete from Session
where pk_sessionId = :session");
    $clearSession -> bindParam(":session", $session["sessionID"]);
    $clearSession -> execute();
    $user = null;

    landingPage($action = "logout");

} else {

    landingPage("not_logged_in");

}
