<?php
    $json = file_get_contents("php://input");
    file_put_contents("assignments.json", json_encode([
        "assignments" => json_decode($json, true)
    ], JSON_PRETTY_PRINT));
?>
