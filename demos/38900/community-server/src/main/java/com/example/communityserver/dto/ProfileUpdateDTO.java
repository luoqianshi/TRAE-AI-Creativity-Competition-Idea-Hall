package com.example.communityserver.dto;

import lombok.Data;

@Data
public class ProfileUpdateDTO {
    private String username;
    private String realName;
    private String phone;
}
