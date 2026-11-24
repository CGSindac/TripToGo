
package com.TripToGo.TTGBackend.DTOs.UserDTOs;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter 
public class UserResponseDTO{
    private Integer userID;
    private String username;
    private String email;
}
