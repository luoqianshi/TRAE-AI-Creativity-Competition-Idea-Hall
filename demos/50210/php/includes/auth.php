<?php
require_once __DIR__ . '/response.php';

class Auth {
    private static $secretKey = 'circuit_community_secret_key_2024';
    private static $tokenExpiry = 86400; // 24 hours
    
    public static function generateToken($userId, $username) {
        $payload = [
            'user_id' => $userId,
            'username' => $username,
            'exp' => time() + self::$tokenExpiry,
            'iat' => time()
        ];
        
        $token = self::base64UrlEncode(json_encode(['alg' => 'HS256', 'typ' => 'JWT'])) . '.' .
                  self::base64UrlEncode(json_encode($payload));
        
        $signature = hash_hmac('sha256', $token, self::$secretKey);
        $token .= '.' . self::base64UrlEncode($signature);
        
        return $token;
    }
    
    public static function validateToken($token) {
        if (!$token) {
            return null;
        }
        
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return null;
        }
        
        list($header, $payload, $signature) = $parts;
        
        $expectedSignature = self::base64UrlEncode(
            hash_hmac('sha256', $header . '.' . $payload, self::$secretKey)
        );
        
        if ($signature !== $expectedSignature) {
            return null;
        }
        
        $payloadData = json_decode(self::base64UrlDecode($payload), true);
        
        if (!$payloadData || $payloadData['exp'] < time()) {
            return null;
        }
        
        return $payloadData;
    }
    
    public static function authenticate() {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        
        if (preg_match('/Bearer\s+(.+)$/i', $authHeader, $matches)) {
            $token = $matches[1];
            $payload = self::validateToken($token);
            
            if ($payload) {
                return $payload;
            }
        }
        
        Response::error('未授权，请先登录', 401);
        return null;
    }
    
    public static function getUserId() {
        $user = self::authenticate();
        return $user ? $user['user_id'] : null;
    }
    
    private static function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
    
    private static function base64UrlDecode($data) {
        return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', 3 - (3 + strlen($data)) % 4));
    }
}
