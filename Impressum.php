<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta content="width=device-width, initial-scale=1" name="viewport">
        <link crossorigin="anonymous"
              href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/css/bootstrap.min.css"
              integrity="sha384-giJF6kkoqNQ00vy+HMDP7azOuL0xtbfIcaT9wjKHr8RbDVddVHyTfAAsrekwKmP1" rel="stylesheet">
        <title>Impressum</title>
    </head>
    <style>
        li{
            margin: 40px;
        }
        div{
            margin-left: 125px;
            margin-top: 150px;
        }
        #footer {
            min-height: 10vh;
            background: #172815;
            color: #DBFF78;
        }

        #footer > * {
            text-align: center;
        }
    </style>
    <body class="font-sans-serif">
        <div>
            <h1 class="fs-1" >Impressum</h1>
                <ul class="list-unstyled">
                    <li class="fs-2" >Verantwortlich für Inhalte:</li>
                    <li class="fs-2" >Kontakt:</li>
                    <li class="fs-2" >Standort:</li>
                    <li class="fs-2" >Datenschutz:</li>
                    <li class="fs-2" >Zuständige Aufsichtsbehörde:</li>
                </ul>
        </div>

        <!-- Footer -->
        <?=include "footer.php"?>

    </body>
</html>
