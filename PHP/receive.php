<?php
require "session.php";

$data = $_POST["data"];
$data_json = json_decode($data, true);

$stmt = $conn->prepare("SELECT `token` FROM `station` WHERE `pk_station_id` = ?");
$stmt->execute([$data_json["id"]]);
$token = $stmt->fetch(PDO::FETCH_ASSOC)["token"];

$insert = $conn->prepare("INSERT INTO `live_data` (`co2`,`humidity`, `temperature`, `fk_station_id`) VALUES (:co2, :humidity, :temperature, :station_id)");
$insert->bindParam(':co2', $data_json["co2"]);
$insert->bindParam(':humidity', $data_json["humidity"]);
$insert->bindParam(':temperature', $data_json["temperature"]);
$insert->bindParam(':station_id', $data_json["id"]);

if (password_verify($data_json["token"], $token)) {
    $insert->execute();
    $thresholds = $conn->prepare("SELECT `co2`, `humidity`, `temperature` FROM `threshold` WHERE `pk_threshold_id` = ?");
    $thresholds->execute(array(1));
    echo json_encode($thresholds->fetch(PDO::FETCH_ASSOC));
}