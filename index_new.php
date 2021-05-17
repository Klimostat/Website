<?php
/**
 * Die Hauptseite.
 * Bei ungültiger Session wird man auf die Login-Seite /login.php weitergeleitet.
 *
 * GET-Attribute:
 *   1. hist: Wenn gesetzt werden historische Daten ausgegeben, wenn nicht, dann Live Daten. Folgende Werte ergeben folgende Zeiträume:
 *      "1": Last Hour
 *      "2": Last Day
 *      "3": Last Week
 *      "4": Last Month
 *      "5": Last 3 Months
 *      "6": Last 6 Months
 *      "7": Last Year
 *      "8": All Time
 */



require "PHP/session.php";
verifySession();

//$scriptname = "chartslive.js";
//
//if (isset($_GET["hist"])) {
//    $scriptname = "chartshist.js";
//} else {
//    $_GET["hist"] = 1;
//}

$stations = $conn -> prepare("
select s.pk_station_id id, s.name, s.location from station s
");
$stations -> execute();
$stationText = "";
while ($station = $stations -> fetch(PDO::FETCH_ASSOC)) {
    $stationText .= "
<div class = \"tooltip-base\">
    <a id = \"station-{$station["id"]}\"
    class = \"nav-link\" 
    href=\"javascript:setSelectedStation({$station["id"]})\">
    {$station["name"]}
    </a>
    <div class = \"card\">
        <div class = \"card-body\">Location: {$station["location"]}</div>
    </div>
</div>";
}
?>

<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta content="width=device-width, initial-scale=1" name="viewport">
        <title>Klimostat Home</title>
        <link href="https://fonts.gstatic.com" rel="preconnect">
        <link href="https://fonts.gstatic.com" rel="preconnect">
        <link href="https://fonts.googleapis.com/css2?family=Karla:ital,wght@1,700&display=swap" rel="stylesheet">
        <link crossorigin="anonymous"
              href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/css/bootstrap.min.css"
        integrity="sha384-giJF6kkoqNQ00vy+HMDP7azOuL0xtbfIcaT9wjKHr8RbDVddVHyTfAAsrekwKmP1" rel="stylesheet">
        <link rel="preconnect" href="https://fonts.gstatic.com">
        <link href="https://fonts.googleapis.com/css2?family=Open+Sans&display=swap" rel="stylesheet">
        <link href="style_new.css" rel="stylesheet">
    </head>
    <body class = "w-100 min-vh-100">

        <!-- Main -->
        <main id = "main">

            <!-- Navbar -->
            <nav id = "navbar">
                <nav class="nav nav-pills">
                    <div class="container-fluid">
                        <a class="navbar-brand" href="javascript:setSelectedStation(null)">
                            <img src="res/Logo.png" alt="" width="40px" height="40px" class="d-inline-block align-center">
                            Klimostat
                        </a>
                    </div>
                    <div class="container-fluid" id = "stations-box">
                        <div class="nav-item"> Stations </div>
                    </div>
                </nav>
                <div class="container-fluid">
                    <div class = "nav-item" id = "timing"></div>
                    <div class="nav-item">
                        <a class = "nav-link" href = "PHP/logout.php"> Logout </a>
                    </div>
                </div>
            </nav>

            <!-- Content -->
            <div id = "content" class = "">
                <div class="chart-container card">
                    <canvas id="chart-temperature"></canvas>
                </div>
                <div class="chart-container card">
                    <canvas id="chart-humidity"></canvas>
                </div>
                <div class="chart-container card">
                    <canvas id="chart-co2"></canvas>
                </div>
            </div>
        </main>

        <!-- Footer -->
        <?php include "footer.php"?>





        <!-- Alt -->
        <div style="display: none">
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    <li class="nav-item interval-select">
                        <select class="form-control bg-light text-dark" id="interval">
                            <option class="font">Live</option>
                            <option class="font">Last Hour</option>
                            <option class="font">Last Day</option>
                            <option class="font">Last Week</option>
                            <option class="font">Last Month</option>
                            <option class="font">Last 3 Months</option>
                            <option class="font">Last 6 Months</option>
                            <option class="font">Last Year</option>
                            <option class="font">All Time</option>
                        </select>
                    </li>
                </ul>
                <div id = "timing" class = "text-light"></div>
                <form class="d-flex" method = "post" action = "PHP/logout.php">
                    <button class="btn btn-outline-secondary logout bg-light text-dark" type="submit">Logout</button>
                </form>
            </div>
        </div>


        <script crossorigin="anonymous"
                integrity="sha384-ygbV9kiqUc6oa4msXn9868pTtWMgiQaeYH7/t7LECLbyPA2x65Kgf80OJFdroafW"
                src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/js/bootstrap.bundle.min.js">
        </script>
        <script src="https://cdn.jsdelivr.net/npm/chart.js@3.2.1/dist/chart.min.js" integrity="sha256-uVEHWRIr846/vAdLJeybWxjPNStREzOlqLMXjW/Saeo=" crossorigin="anonymous"></script>
        <script src="charts/chartslive.js"></script>
        <script src="charts/chartsdashboard.js"></script>
        <script src="charts/station.js"></script>
        <script src="charts/stations.js"></script>
    </body>
</html>