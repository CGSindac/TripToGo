package com.TripToGo.TTGBackend.Components;

import java.util.List;

import org.springframework.http.ResponseEntity;

import com.TripToGo.TTGBackend.DTOs.UserDTOs.UserResponseDTO;
import com.TripToGo.TTGBackend.Models.User;

public class UserResponseMapper implements ResponseMapper<User, UserResponseDTO>{
    
    @Override 
    public UserResponseDTO toDTO(User user)
    {
        return new UserResponseDTO(
            user.getUserId(),
            user.getUsername(),
            user.getEmail()
        );
    }

    @Override 
    public ResponseEntity<UserResponseDTO> mapOkResponse(User user)
    {
        if (user == null) return ResponseEntity.notFound().build();

        UserResponseDTO responseDTO = toDTO(user);
        
        return ResponseEntity.ok(responseDTO);
    }

    @Override 
    public ResponseEntity<List<UserResponseDTO>> mapListOkResponse(List<User> sources)
    {   
        return null;
    }

    public ResponseEntity<UserResponseDTO> mapCreatedResponse(User source)
    {
        return null;
    }
}
