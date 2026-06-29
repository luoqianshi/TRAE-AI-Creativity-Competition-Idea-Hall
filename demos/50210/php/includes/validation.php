<?php
class Validation {
    public static function required($value, $fieldName) {
        if (empty(trim($value))) {
            return "{$fieldName} 不能为空";
        }
        return null;
    }
    
    public static function email($value) {
        if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
            return "邮箱格式不正确";
        }
        return null;
    }
    
    public static function minLength($value, $min, $fieldName) {
        if (strlen($value) < $min) {
            return "{$fieldName} 长度不能少于 {$min} 个字符";
        }
        return null;
    }
    
    public static function maxLength($value, $max, $fieldName) {
        if (strlen($value) > $max) {
            return "{$fieldName} 长度不能超过 {$max} 个字符";
        }
        return null;
    }
    
    public static function username($value) {
        if (!preg_match('/^[a-zA-Z0-9_]{3,20}$/', $value)) {
            return "用户名只能包含字母、数字和下划线，长度3-20位";
        }
        return null;
    }
    
    public static function password($value) {
        if (strlen($value) < 6) {
            return "密码长度不能少于6位";
        }
        return null;
    }
    
    public static function numeric($value, $fieldName) {
        if (!is_numeric($value)) {
            return "{$fieldName} 必须是数字";
        }
        return null;
    }
    
    public static function validate($data, $rules) {
        $errors = [];
        
        foreach ($rules as $field => $fieldRules) {
            $value = $data[$field] ?? null;
            
            foreach ($fieldRules as $rule) {
                $error = null;
                
                if (is_array($rule)) {
                    $ruleName = $rule[0];
                    $params = array_slice($rule, 1);
                } else {
                    $ruleName = $rule;
                    $params = [];
                }
                
                switch ($ruleName) {
                    case 'required':
                        $error = self::required($value, $field);
                        break;
                    case 'email':
                        $error = self::email($value);
                        break;
                    case 'username':
                        $error = self::username($value);
                        break;
                    case 'password':
                        $error = self::password($value);
                        break;
                    case 'minLength':
                        $error = self::minLength($value, $params[0], $field);
                        break;
                    case 'maxLength':
                        $error = self::maxLength($value, $params[0], $field);
                        break;
                    case 'numeric':
                        $error = self::numeric($value, $field);
                        break;
                }
                
                if ($error) {
                    $errors[$field][] = $error;
                    break;
                }
            }
        }
        
        return empty($errors) ? null : $errors;
    }
}
