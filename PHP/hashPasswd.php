<!DOCTYPE html>
<html lang = "en">
    <head>
        <meta charset = "UTF-8">
        <title> $Title$ </title>
    </head>
    <body>
        <?php
        error_reporting(0);
        echo password_hash($_GET["passwd"],  PASSWORD_ARGON2I)
        ?>
    </body>
</html>