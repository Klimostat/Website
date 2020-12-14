<?php
error_reporting(0);
$conn = new PDO("mysql:host=localhost;dbname=Klimostat", "root", "passwd");
$user = null;

function verifySession() {
    global $conn, $user;
    if (isset($_COOKIE["sessionID"])) {
        $sessionID = $_COOKIE["sessionID"];
        $user = $conn -> prepare("
select U.*, S.lastupdatetime from Session S
join User U on S.fk_userId = U.pk_userId
where pk_sessionId = :sessionID");
        $user -> bindParam(":sessionID", $sessionID);
        $user -> execute();
        $user = $user -> fetch(PDO::FETCH_ASSOC);
    }
}

function login($username, $password) {
    global $conn;
    $getPasswd = $conn -> prepare("
select PasswordHash, pk_userId from User
where Username = :user");
    $getPasswd -> bindParam(":user", $username);
    $getPasswd -> execute();
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
    } else {

    }
}

function logout() {
    global $conn, $user;
    setcookie("sessionID", 0, time() - 1, "/");
    $clearSession = $conn -> prepare("
delete from Session
where fk_userId = :user");
    $clearSession -> bindParam(":user", $user["pk_userId"]);
    $clearSession -> execute();
}