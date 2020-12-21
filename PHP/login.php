<?php
require "session.php";

if ($session === null) {
    if (isset($_POST["user"]) && isset($_POST["password"])) {
        $username = $_POST["user"];
        $password = $_POST["password"];

        $getPasswd = $conn -> prepare("
select PasswordHash, pk_userId from User
where Username = :user");
        $getPasswd -> bindParam(":user", $username);
        $getPasswd -> execute();
        if ($getPasswd -> rowCount() > 0) {
            $getPasswd = $getPasswd -> fetch(PDO::FETCH_ASSOC);
            $passwdHash = $getPasswd["PasswordHash"];
            $userID = $getPasswd["pk_userId"];

            if ($passwdHash === $password) {
                $sessionID = hash("sha3-512", openssl_random_pseudo_bytes(2056));
                $createSession = $conn -> prepare("
insert into Session (pk_sessionId, fk_userId)
values (:sessionID, :user)");
                $createSession -> bindParam(":sessionID", $sessionID);
                $createSession -> bindParam(":user", $userID);
                $createSession -> execute();
                setcookie("sessionID", $sessionID, time() + 3600, "/");

                landingPage("login");

            } else {
                landingPage("invalid_user");

            }
        } else {

            landingPage("invalid_user");

        }
    } else {

        landingPage("invalid_user");

    }
} else {

    landingPage("already_logged_in");

}