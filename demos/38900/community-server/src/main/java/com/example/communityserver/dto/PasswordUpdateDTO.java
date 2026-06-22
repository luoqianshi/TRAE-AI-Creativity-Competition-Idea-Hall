package com.example.communityserver.dto;

import lombok.Data;

@Data
public class PasswordUpdateDTO {
    private String oldPassword;
    private String newPassword;
    private String confirmPassword;
}
