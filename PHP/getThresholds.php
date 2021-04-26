<?php
require "session.php";

$thresholds = $conn->prepare("SELECT `co2`, `humidity`, `temperature` FROM `threshold` WHERE `pk_threshold_id` = 1");
$thresholds->execute();
echo json_encode($thresholds->fetch(PDO::FETCH_ASSOC));