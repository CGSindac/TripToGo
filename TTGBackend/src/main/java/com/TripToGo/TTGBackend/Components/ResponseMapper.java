package com.TripToGo.TTGBackend.Components;

import java.util.List;

import org.springframework.http.ResponseEntity;

// Maps a model 'S' to a DTO 'T' an returns a ResponseEntity
public interface ResponseMapper<S, T> {
    
    public T toDTO(S source);

    public ResponseEntity<T> mapOkResponse(S sources);

    public ResponseEntity<List<T>> mapListOkResponse(List<S> sources);

    public ResponseEntity<T> mapCreatedResponse(S source);

}
