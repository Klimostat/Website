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
?>

<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta content="width=device-width, initial-scale=1" name="viewport">
        <link rel="icon" href="res/logo2.png">
        <title> Klimostat Home </title>
        <link href="https://fonts.gstatic.com" rel="preconnect">
        <link href="https://fonts.googleapis.com/css2?family=Karla:ital,wght@1,700&display=swap" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Open+Sans&display=swap" rel="stylesheet">

        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-+0n0xVW2eSR5OomGNYDnhzAbDsOXxcvSN1TPprVMTNDbiYZCxYbOOl7+AMvyTG2x" crossorigin="anonymous">

        <link href="style_index.css" rel="stylesheet">
    </head>
    <body class = "w-100 min-vh-100">

        <!-- Main -->
        <main id = "main">

            <!-- Navbar -->
                <nav id = "navbar" class="nav nav-pills">
                    <div class="container-fluid">
                        <a class="navbar-brand" href="javascript:selectedStations.clear()">
                            <img src="res/logo2.png" alt="" width="40px" height="40px" class="d-inline-block align-center">
                            Klimostat
                        </a>
                    </div>
                    <div class="container-fluid">
                        <a class="nav-item" href="javascript:selectedStations.clear()">
                            Dashboard
                        </a>
                    </div>
                    <div class="container-fluid" id = "stations-box">
                        <div class="nav-item">
                            Stations
                        </div>
                    </div>
                    <div class="container-fluid">
                        <div class = "nav-item">
                            <label for = "interval"> Interval: </label>
                            <select id = "interval" name = "interval" size = "1" onchange="intervals.setSelected()" class = "list-group-item"></select>
                        </div>
                        <div class = "nav-item" id = "timing">
                            Effective: <span id = "lastUpdated">not loaded yet</span>, <span id = "nextUpdateIn"> </span>.
                        </div>
                        <div class = "nav-item">
                            <a class="nav-link" href="javascript:klimostat.updateCharts()">Update</a>
                        </div>
                        <div class="nav-item">
                            <a class = "nav-link" href = "PHP/logout.php"> Logout </a>
                        </div>
                    </div>
                </nav>

            <!-- Content -->
            <div id = "content" class = "">
                <div class="chart-container card" style = "display: none">
                    <canvas id="chart-temperature"></canvas>
                </div>
                <div class="chart-container card" style = "display: none">
                    <canvas id="chart-humidity"></canvas>
                </div>
                <div class="chart-container card" style = "display: none">
                    <canvas id="chart-co2"></canvas>
                </div>
            </div>
        </main>

        <!-- Footer -->
        <?php include "footer.php"?>


<!--        <script crossorigin="anonymous" integrity="sha384-ygbV9kiqUc6oa4msXn9868pTtWMgiQaeYH7/t7LECLbyPA2x65Kgf80OJFdroafW" src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/js/bootstrap.bundle.min.js"></script>-->
<!--        <script src="https://cdn.jsdelivr.net/npm/chart.js@3.2.1/dist/chart.min.js" integrity="sha256-uVEHWRIr846/vAdLJeybWxjPNStREzOlqLMXjW/Saeo=" crossorigin="anonymous"></script>-->
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/js/bootstrap.bundle.min.js" integrity="sha384-gtEjrD/SeCtmISkJkNUaaKMoLD0//ElJ19smozuHV6z3Iehds+3Ulb9Bn9Plx0x4" crossorigin="anonymous"></script>
        <script src="https://cdn.jsdelivr.net/npm/chart.js@3.3.2/dist/chart.min.js" integrity="sha256-qoN08nWXsFH+S9CtIq99e5yzYHioRHtNB9t2qy1MSmc=" crossorigin="anonymous"></script>

        <script src="charts/klimostat.js"></script>
        <script src="charts/view.js"></script>
        <script src="charts/intervalView.js"></script>
        <script src="charts/dashboardView.js"></script>
        <script src="charts/selectedStations.js"></script>
        <script src="charts/station.js"></script>
        <script src="charts/navNode.js"></script>
        <script src="charts/sensorChart.js"></script>
        <script src="charts/interval.js"></script>
        <script src="charts/liveInterval.js"></script>
        <script src="charts/hourInterval.js"></script>
        <script src="charts/dayInterval.js"></script>
        <script src="charts/pastDayInterval.js"></script>
    </body>
</html>