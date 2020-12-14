<?php
require "session.php";

if (isset($_POST["logout"])) {
    logout();
} else {
    verifySession();
    if ($user["Username"] === null) {
        login($_POST["user"], $_POST["pass"]);
        verifySession();
    }
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
            Logged in with user <?=$user["Username"]?>
        </p>
        <form action = "login.php" method = "post">
            <input type = "text" name = "user">
            <input type = "text" name = "pass">
            <input type = "submit" value = "login">
            <input type = "submit" name = "logout" value = "logout">
        </form>
    </body>
</html>