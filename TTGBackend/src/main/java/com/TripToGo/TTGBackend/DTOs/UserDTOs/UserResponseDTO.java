
package com.TripToGo.TTGBackend.DTOs.UserDTOs;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter 
@AllArgsConstructor @NoArgsConstructor 
public class UserResponseDTO{
    private Integer userID;
    private String username;
    private String email;
}
