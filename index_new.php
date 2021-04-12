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
//verifySession();

$scriptname = "chartslive.js";

if (isset($_GET["hist"])) {
    $scriptname = "chartshist.js";
} else {
    $_GET["hist"] = 1;
}
?>

<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta content="width=device-width, initial-scale=1" name="viewport">
        <title>Klimostat Home</title>
        <link href="https://fonts.gstatic.com" rel="preconnect">
        <link href="style_new.css" rel="stylesheet">
        <link href="https://fonts.gstatic.com" rel="preconnect">
        <link href="https://fonts.googleapis.com/css2?family=Karla:ital,wght@1,700&display=swap" rel="stylesheet">
        <link crossorigin="anonymous"
              href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/css/bootstrap.min.css"
              integrity="sha384-giJF6kkoqNQ00vy+HMDP7azOuL0xtbfIcaT9wjKHr8RbDVddVHyTfAAsrekwKmP1" rel="stylesheet">
        <link rel="preconnect" href="https://fonts.gstatic.com">
        <link href="https://fonts.googleapis.com/css2?family=Open+Sans&display=swap" rel="stylesheet">
    </head>
    <body>





        <!-- Main -->
        <main id = "main" class="d-flex align-items-start">

            <!-- Navbar -->
            <nav id = "navbar" class="nav flex-column nav-pills">
                <a class="navbar-link" href="#">
                    <img src="res/Logo.png" alt="" width="40px" height="40px" class="d-inline-block align-center"> Klimostat
                </a>
                <div class="navbar-item"> Messstationen </div>
            </nav>

            <!-- Content -->
            <div id = "content" class="container-fluid charts">
                <div class="row">
                    <div class="chart-container col-lg-5 offset-lg-1 bg-light px-3 my-2 me-2 shadow rounded">
                        <canvas id="chart-temperatur"></canvas>
                    </div>
                    <div class="chart-container col-lg-5 bg-light m-lg-2 shadow rounded">
                        <canvas id="chart-humidity"></canvas>
                    </div>
                </div>

                <div class="row">
                    <div class="chart-container col-lg-5 offset-lg-1 bg-light my-2 me-2 shadow rounded">
                        <canvas id="chart-co2"></canvas>
                    </div>
                    <div class="chart-container col-lg-5 bg-light m-lg-2 shadow rounded">
                        <canvas id="chart-flood"></canvas>
                    </div>
                </div>
            </div>
        </main>

        <!-- Footer -->
        <footer id = "footer">
            Hallo
        </footer>





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
        <div class="alert" id="alert">
            <span class="closebtn" onclick="this.parentElement.style.display='none';">&times;</span>
            <strong>Achtung!</strong> Ein Grenzwert wurde überschritten!
        </div>


        <script crossorigin="anonymous"
                integrity="sha384-ygbV9kiqUc6oa4msXn9868pTtWMgiQaeYH7/t7LECLbyPA2x65Kgf80OJFdroafW"
                src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/js/bootstrap.bundle.min.js">
        </script>
        <script crossorigin="anonymous"
                integrity="sha512-hZf9Qhp3rlDJBvAKvmiG+goaaKRZA6LKUO35oK6EsM0/kjPK32Yw7URqrq3Q+Nvbbt8Usss+IekL7CRn83dYmw=="
                src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.9.4/Chart.js">
        </script>
        <script>
            let intervalSelectIndex = <?=$_GET["hist"]?>;
        </script>
        <script src="charts/charts.js"></script>
        <script src="charts/<?=$scriptname?>"></script>
    </body>
</html>