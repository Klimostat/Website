<?php
/**
 * Kontrolliert die Session, wird bei jeder Seite verwendet und bietet Funktionen, die auf den unterschiedlichsten Seiten benötigt werden.
 * IMPORTANT: Die folgenden drei Variablen sind zur Konfiguration notwendig:
 * $rootDomain ist die Root-Domain des Webservers, sie wird zur Weiterleitung verwendet, z.B. bei erfolgreichem Login
 * $conn ist die Datenbankverbindung, je nach Datenbank muss diese adaptiert werden
 * $MAX_SESSION_AGE ist das maximale Alter, das eine Session erreichen darf
*/
//$rootDomain = "https://kls.letusflow.xyz";
//$conn = new PDO("mysql:host=localhost;dbname=klimostat", "root", "");
$rootDomain = "/klimostat";
$conn = new PDO("mysql:host=localhost;dbname=klimostat", "root", "passwd");
$MAX_SESSION_AGE = 3600*24;




getSession();

/**
 * Überprüft, ob eine Session am laufen ist, ist keine am laufen leitet sie auf die login-Seite weiter.
 */
function verifySession() {
    global $session;
    if ($session === null) {

        loginPage();

    }
}

/**
 * Überprüft, dass keine Session am laufen ist, ist dennoch eine am laufen leitet sie auf die main-Seite weiter.
 */
function verifyNoSession() {
    global $session;
    if ($session !== null) {

        mainPage();

    }
}

/**
 * Liefert bei laufender Session die aktuelle Session, ansonsten null.
 * Bei abgelaufener Session leitet sie auf die Login-page weiter.
 * @return mixed|null die aktuelle Session, null oder false, siehe oben
 */
function getSession() {
    global $session, $conn, $MAX_SESSION_AGE;
    if (isset($_COOKIE["sessionID"])) {
        $sessionID = $_COOKIE["sessionID"];

        $sessClear = $conn -> prepare("
delete from session
where utc_timestamp() - lastupdatetime > :maxAge");
        $sessClear -> bindParam(":maxAge", $MAX_SESSION_AGE);
        $sessClear -> execute();

        $user = $conn -> prepare("
select u.username username, u.pk_userId userID, s.pk_sessionId sessionID from session s
join user u on s.fk_userId = u.pk_userId
where pk_sessionId = :sessionID");
        $user -> bindParam(":sessionID", $sessionID);
        $user -> execute();
        if ($user -> rowCount() > 0) {
            $session = $user -> fetch(PDO::FETCH_ASSOC);
            $updateTimer = $conn -> prepare("
update session
set lastupdatetime = utc_timestamp()
where pk_sessionId = :sessionID");
            $updateTimer -> bindParam(":sessionID", $sessionID);
            $updateTimer -> execute();
        } else {
            $session = null;
            logOutAndForward(true);
        }
    }
    return null;
}

/**
 * Lädt die Login-page mit einer Statusmeldung
 * @param $action string die Bezeichnung der Statusmeldung
 */
function loginPage($action = "") {
    global $rootDomain;
    if (isset($action) && $action !== "") {
        $action = "?action=$action";
    } else {
        $action = "";
    }
    header("Location: $rootDomain/login.php$action");
}

/**
 * Lädt die Main-page mit einer Statusmeldung
 * @param $action string|empty die Bezeichnung der Statusmeldung
 */
function mainPage($action = "") {
    global $rootDomain;
    if (isset($action) && $action !== "") {
        $action = "?action=$action";
    } else {
        $action = "";
    }
    header("Location: $rootDomain/$action");
}

/**
 * Meldet den Benutzer ab, löscht die Session in der Datenbank und leitet auf die login-Page weiter.
 * @param bool $sessionExpired gibt an, ob auf der login-Page die Session-Expired-Meldung angezeigt werden soll.
 */
function logOutAndForward($sessionExpired = false) {
    global $session, $conn;
    setcookie("sessionID", 0, time() - 1, "/");

    if ($session !== null) {

        $clearSession = $conn -> prepare("
delete from session
where pk_sessionId = :session");
        $clearSession -> bindParam(":session", $session["sessionID"]);
        $clearSession -> execute();
        $session = null;

        if ($sessionExpired) {

            loginPage("session_expired");

        }

        loginPage("logout");

    } else {

        loginPage("not_logged_in");

    }
}

/**
 * Meldet einen User an, indem es ihn mittels Benutzername und Passwort authentifiziert und
 * erstellt bei erfolgreicher Authentifizierung eine Session in der Datenbank.
 * Leitet automatisch auf die Login-Seite /login.php weiter und gibt eine entsprechende Statusmeldung aus.
 * POST-Attribute:
 * 1. username: der angegebene Benutzername
 * 2. password: das angegebene Passwort
 */
function logInAndForward() {
    global $session, $conn, $MAX_SESSION_AGE;
    if ($session === null) {
        if (isset($_POST["username"]) && isset($_POST["password"])) {
            $username = $_POST["username"];
            $password = $_POST["password"];

            $getPasswd = $conn -> prepare("
select passwordHash, pk_userId from user
where username = :user");
            $getPasswd -> bindParam(":user", $username);
            $getPasswd -> execute();
            if ($getPasswd -> rowCount() > 0) {
                $getPasswd = $getPasswd -> fetch(PDO::FETCH_ASSOC);
                $passwdHash = $getPasswd["passwordHash"];
                $userID = $getPasswd["pk_userId"];

                if (password_verify($password, $passwdHash)) {
                    $sessionID = hash("sha3-512", openssl_random_pseudo_bytes(2056));
                    $createSession = $conn -> prepare("
insert into session (pk_sessionId, fk_userId)
values (:sessionID, :user)");
                    $createSession -> bindParam(":sessionID", $sessionID);
                    $createSession -> bindParam(":user", $userID);
                    $createSession -> execute();
                    setcookie("sessionID", $sessionID, time() + $MAX_SESSION_AGE, "/");

                    mainPage();

                } else {

                    loginPage("invalid_user");

                }
            } else {

                loginPage("invalid_user");

            }
        } else {

            loginPage("invalid_user");

        }
    } else {

        mainPage();

    }
}
