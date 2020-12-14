<?php
require "session.php";
$loggedIn = verifySession();

switch ($_GET["action"]) {
    case "logout":
        $note = "An error occurred... You weren't logged out!";
        if (!$loggedIn) {
            $note = "You successfully logged out!";
        }
        break;
    case "not_logged_in":
        $note = "You aren't logged in. Log in to log out!";
        break;
    case "login":
        $note = "An error occurred... You weren't logged in!";
        if ($loggedIn) {
            $note = "You successfully logged in!";
        }
        break;
    case "invalid_user":
        $note = "Invalid username or password!";
        break;
    case "already_logged_in":
        $note = "You are already logged in. Log out to log in again!";
        break;
    default:
        $note = "Something other is the case";
}

if ($session !== null) {
    $userText = "Logged in as user <b>{$session['username']}</b>";
} else {
    $userText = "Not logged in";
}

?>

<!DOCTYPE html>
<html lang = "en">
    <head>
        <meta charset = "UTF-8">
        <title> Login </title>
    </head>
    <body>
        <p>
            <?=$note?>
        </p>
        <p>
            <?=$userText?>
        </p>
        <form action = "login.php" method = "post">
            <input type = "text" name = "user">
            <input type = "text" name = "password">
            <input type = "submit" value = "login">
        </form>
        <form action = "logout.php">
            <input type = "submit" name = "logout" value = "logout">
        </form>
    </body>
</html>