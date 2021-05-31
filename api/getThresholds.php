<?php
require "../PHP/session.php";
header("Content-Type: text/json");

$data = $_POST["data"];
$data_json = json_decode($data, true);

$stmt = $conn->prepare("SELECT `token` FROM `station` WHERE `pk_station_id` = ?");
$stmt->execute([$data_json["id"]]);
$token = $stmt->fetch(PDO::FETCH_ASSOC)["token"];

if (password_verify($data_json["token"], $token)) {
    $thresholds = $conn->prepare("SELECT `threshold_co2` AS `co2`, `threshold_humidity` AS `humidity`, `threshold_temperature` AS `temperature` FROM `station` WHERE `pk_station_id` = ?");
    $thresholds->execute([$data_json["id"]]);
    echo json_encode($thresholds->fetch(PDO::FETCH_ASSOC));
}
