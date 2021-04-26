<?php
require "../PHP/session.php";
header("Content-Type: text/json");

$data = $_POST["data"];
$data_json = json_decode($data, true);

$stmt = $conn->prepare("SELECT `token` FROM `station` WHERE `pk_station_id` = ?");
$stmt->execute([$data_json["id"]]);
$token = $stmt->fetch(PDO::FETCH_ASSOC)["token"];

if (password_verify($data_json["token"], $token)) {
    $thresholds = $conn->prepare("SELECT `co2`, `humidity`, `temperature` FROM `threshold` WHERE `pk_threshold_id` = 1");
    $thresholds->execute();
    echo json_encode($thresholds->fetch(PDO::FETCH_ASSOC));
}