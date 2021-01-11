<?php
$rootDomain = "/klimostat";
$conn = new PDO("mysql:host=localhost;dbname=klimostat", "root", "passwd");
$MAX_SESSION_AGE = 3600*24;