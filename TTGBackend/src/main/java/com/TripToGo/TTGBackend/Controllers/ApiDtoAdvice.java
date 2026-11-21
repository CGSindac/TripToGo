package com.TripToGo.TTGBackend.Controllers;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.bind.annotation.InitBinder;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import com.TripToGo.TTGBackend.DTOs.PageQueryDTO;
import com.TripToGo.TTGBackend.DTOs.RequestValidationException;

import tools.jackson.databind.exc.MismatchedInputException;

@RestControllerAdvice(assignableTypes = {LocationContoller.class, ReviewController.class, AuthController.class, Usercontroller.class})
public class ApiDtoAdvice extends ResponseEntityExceptionHandler {

    @InitBinder("pageQuery")
    public void validatePageQuery(WebDataBinder binder) {
        binder.addValidators(PageQueryDTO.VALIDATOR);
    }

    @Override
    protected ResponseEntity<Object> handleHttpMessageNotReadable(HttpMessageNotReadableException exception,
            HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(status, "Invalid request body");
        if (exception.getMostSpecificCause() instanceof RequestValidationException invalid) {
            if (invalid.field() == null) {
                problem.setDetail(invalid.getMessage());
            } else {
                problem.setProperty("fieldErrors", Map.of(invalid.field(), invalid.getMessage()));
            }
        } else if (exception.getCause() instanceof MismatchedInputException invalid && !invalid.getPath().isEmpty()) {
            String field = invalid.getPath().getFirst().getPropertyName();
            if (field != null) {
                String message = invalid.getTargetType() == Integer.class ? "Expected a whole number" : "Invalid value";
                problem.setProperty("fieldErrors", Map.of(field, message));
            }
        }
        return handleExceptionInternal(exception, problem, headers, status, request);
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException exception,
            HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        ProblemDetail problem = exception.getBody();
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        exception.getBindingResult().getFieldErrors().forEach(error -> fieldErrors.putIfAbsent(
                error.getField(), error.isBindingFailure() ? "Expected a whole number" : error.getDefaultMessage()));
        problem.setProperty("fieldErrors", fieldErrors);
        return handleExceptionInternal(exception, problem, headers, status, request);
    }
}
