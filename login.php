<?php
/**
 * Die Login-Seite.
 * Bei erfolgreicher Authentifizierung wird man auf die Hauptseite /index.php weitergeleitet.
 *
 * GET-Attribute:
 *   1. action: Zeigt eine Statusnachricht an, folgende Werte erzeugen Nachrichten:
 *      logout,
 *      not_logged_in,
 *      login,
 *      invalid_user,
 *      already_logged_in,
 *      session_expired,
 */


require "PHP/session.php";
verifyNoSession();

if (isset($_GET["action"]) && $_GET["action"] !== "") {
    switch ($_GET["action"]) {
        case "logout":
            $note = "An error occurred... You weren't logged out correctly!";
            if ($session === null) {
                $note = "You successfully logged out!";
            }
            break;
        case "not_logged_in":
            $note = "You aren't logged in. Log in to log out!";
            break;
        case "invalid_user":
            $note = "Invalid username or password!";
            break;
        case "session_expired":
            $note = "Your session expired";
            break;
        default:
            $note = "Something other is the case: {$_GET["action"]}";
    }
}
?>

<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="icon" href="res/logo2.png">
        <title>Klimostat Login</title>
        <link rel="preconnect" href="https://fonts.gstatic.com">
        <link rel="stylesheet" href="style_login.css">
        <link rel="preconnect" href="https://fonts.gstatic.com">
        <link href="https://fonts.googleapis.com/css2?family=Karla:ital,wght@1,700&display=swap" rel="stylesheet">

        <!--        <link crossorigin="anonymous" href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/css/bootstrap.min.css" integrity="sha384-giJF6kkoqNQ00vy+HMDP7azOuL0xtbfIcaT9wjKHr8RbDVddVHyTfAAsrekwKmP1" rel="stylesheet">-->
        <link href="cache/http_cdn.jsdelivr.net_npm_bootstrap@5.0.0-beta1_dist_css_bootstrap.css" rel="stylesheet">
    </head>
    <body>

        <!-- Main -->
        <main id = "main">
            <div id = "logincard" class="card text-center">
                <form class = "card-body" action="PHP/login.php" method="post">
                    <h1 class = "card-title">
                        <img src="res/logo2.png" alt="" width="40px" height="40px" class="d-inline-block align-center">
                        Klimostat
                    </h1>
                    <p id="infotext">  <?= $note ?> </p>
                    <input type="text" class="form-control" id="username" name="username" placeholder="Username" autofocus>
                    <input type="password" class="form-control" id="passwort" name="password" placeholder="· · · · · · · · · · · ·">
                    <input type="submit" class="btn btn-primary" id="loginbutton" value="Login">
                </form>
            </div>
        </main>

        <!-- Footer -->
        <?=include "footer.php"?>

        <!-- alt -->
        <div class="row position-absolute top-50 start-50 translate-middle " style="display: none">
            <div id="infobox" class="col-md-4 p-4 top-0 start-50">
                <img src="res/Logo.png" alt="Klimostat Logo" class="position-relative mx-auto d-block img-fluid">
                <p class="text-center position-relative align-center">
                    Mit Hilfe von Klimostat
                    können ganz einfach
                    die wichtigsten Umweldaten
                    abgerufen werden
                </p>
            </div>
            <div id="loginbox" class="col-md-8">
                <form action="PHP/login.php" class="text-center position-relative top-50 start-50 translate-middle" method="post">
                    <p id="infotext">  <?= $note ?> </p>
                    <input type="text" id="username" class="login border border-light border-1 rounded-1"
                           name="username" placeholder="Username" autofocus><br>
                    <input type="password" id="passwort" class="login border border-light border-1 rounded-1"
                           name="password" placeholder="· · · · · · · · · · · ·"><br><br>
                    <button type="submit" id="loginbutton"
                            class="btn btn-primary active border border-light border-1 rounded-1 mb-3"
                            data-bs-toggle="button" aria-pressed="true">Login
                    </button>
                </form>
            </div>
        </div>
    </body>
</html>
