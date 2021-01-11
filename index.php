<?php
require "PHP/session.php";
verifySession();
?>

<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta content="width=device-width, initial-scale=1" name="viewport">
        <title>Klimostat Home</title>
        <link href="https://fonts.gstatic.com" rel="preconnect">
        <link href="index_style.css" rel="stylesheet">
        <link href="https://fonts.gstatic.com" rel="preconnect">
        <link href="https://fonts.googleapis.com/css2?family=Karla:ital,wght@1,700&display=swap" rel="stylesheet">
        <link crossorigin="anonymous"
              href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/css/bootstrap.min.css"
              integrity="sha384-giJF6kkoqNQ00vy+HMDP7azOuL0xtbfIcaT9wjKHr8RbDVddVHyTfAAsrekwKmP1" rel="stylesheet">
        <link rel="preconnect" href="https://fonts.gstatic.com">
        <link href="https://fonts.googleapis.com/css2?family=Open+Sans&display=swap" rel="stylesheet">
    </head>

    <body>
        <nav class="cont2">
            <nav class="navbar navbar-expand-lg navbar-light cont">
                <div class="container-fluid">
                    <a class="navbar-brand" href="#">
                        <img src="res/Logo.png" alt="" width="40px" height="40px" class="d-inline-block align-center">
                        Klimostat
                    </a>

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
                        <button class="btn btn-outline-secondary logout bg-light text-dark" type="button" onclick="chart_update()">Update</button>
                        <form class="d-flex" method = "post" action = "PHP/logout.php">
                            <button class="btn btn-outline-secondary logout bg-light text-dark" type="submit">Logout</button>
                        </form>
                    </div>
                </div>
            </nav>

            <div class="container-fluid charts px-5 mt-5">
                <div class="row">
                    <div class="chart-container col-5 offset-md-1 bg-light px-3 my-2 me-2 shadow rounded">
                        <canvas id="chart-temperatur"></canvas>
                    </div>
                    <div class="chart-container col-5 bg-light m-2 shadow rounded">
                        <canvas id="chart-humidity"></canvas>
                    </div>
                </div>

                <div class="row">
                    <div class="chart-container col-5 offset-md-1 bg-light my-2 me-2 shadow rounded">
                        <canvas id="chart-co2"></canvas>
                    </div>
                    <div class="chart-container col-5 bg-light m-2 shadow rounded">
                        <canvas id="chart-flood"></canvas>
                    </div>
                </div>
            </div>
        </nav>
    </body>
    <script crossorigin="anonymous"
            integrity="sha384-ygbV9kiqUc6oa4msXn9868pTtWMgiQaeYH7/t7LECLbyPA2x65Kgf80OJFdroafW"
            src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/js/bootstrap.bundle.min.js">
    </script>
    <script crossorigin="anonymous"
            integrity="sha512-hZf9Qhp3rlDJBvAKvmiG+goaaKRZA6LKUO35oK6EsM0/kjPK32Yw7URqrq3Q+Nvbbt8Usss+IekL7CRn83dYmw=="
            src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.9.4/Chart.js">
    </script>
    <script src="charts/charts.js"></script>
    <script src="charts/update.js"></script>
</html>
