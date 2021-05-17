<?php
require "../PHP/session.php";

$data = $_POST["data"];
$data_json = json_decode($data, true);

$stmt = $conn->prepare("SELECT `token` FROM `station` WHERE `pk_station_id` = ?");
$stmt->execute([$data_json["id"]]);
$token = $stmt->fetch(PDO::FETCH_ASSOC)["token"];

if (password_verify($data_json["token"], $token)) {
    $thresholds = $conn->prepare("UPDATE `station` SET `last_connection` = utc_timestamp() WHERE `pk_station_id` = ?");
    $thresholds->execute([$data_json["id"]]);
    echo $thresholds->rowCount() == 1 ? "pong" : "not pong";
}
