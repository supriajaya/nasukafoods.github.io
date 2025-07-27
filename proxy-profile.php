<?php
// CORS agar bisa diakses dari mana saja (misalnya dari GAS)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Endpoint API JasmediaOne
$target_url = "https://jasmediaone.id/api/profile";

// Data yang akan dikirim ke API asli
$data = [
    "api_id" => "708",
    "secret_key" => "supriajaya"
];

// Inisialisasi CURL
$ch = curl_init($target_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);

// Eksekusi request
$response = curl_exec($ch);

// Jika gagal, kirim pesan error
if (curl_errno($ch)) {
    echo json_encode(["success" => false, "error" => curl_error($ch)]);
} else {
    echo $response;
}

curl_close($ch);
