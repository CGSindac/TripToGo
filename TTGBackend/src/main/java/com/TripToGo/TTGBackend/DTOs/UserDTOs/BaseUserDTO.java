package com.TripToGo.TTGBackend.DTOs.UserDTOs;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter  @Setter 
@NoArgsConstructor @AllArgsConstructor 
public class BaseUserDTO {
    private Integer userID;
    private String username;
}
