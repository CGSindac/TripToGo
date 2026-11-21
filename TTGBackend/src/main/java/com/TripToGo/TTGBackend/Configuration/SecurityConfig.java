package com.TripToGo.TTGBackend.Configuration;

import java.util.List;
import java.util.Map;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.password.DelegatingPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.crypto.password.Pbkdf2PasswordEncoder;
import org.springframework.security.crypto.password.Pbkdf2PasswordEncoder.SecretKeyFactoryAlgorithm;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.logout.HttpStatusReturningLogoutSuccessHandler;
import org.springframework.security.web.authentication.session.ChangeSessionIdAuthenticationStrategy;
import org.springframework.security.web.authentication.session.CompositeSessionAuthenticationStrategy;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CsrfAuthenticationStrategy;
import org.springframework.security.web.csrf.CsrfTokenRepository;
import org.springframework.security.web.csrf.HttpSessionCsrfTokenRepository;

import jakarta.servlet.DispatcherType;

@Configuration(proxyBeanMethods = false)
@EnableWebSecurity
public class SecurityConfig {

    private static final String[] PUBLIC_READ_PATHS = {"/auth/health", "/auth/csrf", "/users/health",
            "/location/health", "/locations", "/locations/**", "/reviews/health"};

    @Bean
    PasswordEncoder passwordEncoder() {
        String hashVersion = "pbkdf2-v1";
        PasswordEncoder pbkdf2 = new Pbkdf2PasswordEncoder("", 16, 600_000,
                SecretKeyFactoryAlgorithm.PBKDF2WithHmacSHA256);
        return new DelegatingPasswordEncoder(hashVersion, Map.of(hashVersion, pbkdf2));
    }

    @Bean
    SecurityContextRepository securityContextRepository() {
        return new HttpSessionSecurityContextRepository();
    }

    @Bean
    CsrfTokenRepository csrfTokenRepository() {
        return new HttpSessionCsrfTokenRepository();
    }

    @Bean
    SessionAuthenticationStrategy loginSessionStrategy(CsrfTokenRepository csrfTokens) {
        // The JSON login controller calls this explicitly before it saves the authenticated session.
        return new CompositeSessionAuthenticationStrategy(List.of(
                new ChangeSessionIdAuthenticationStrategy(), new CsrfAuthenticationStrategy(csrfTokens)));
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, SecurityContextRepository contexts,
            CsrfTokenRepository csrfTokens) throws Exception {
        http.securityContext(context -> context.securityContextRepository(contexts))
                .csrf(csrf -> csrf.csrfTokenRepository(csrfTokens))
                .requestCache(cache -> cache.disable())
                .exceptionHandling(exceptions -> exceptions.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
                .authorizeHttpRequests(routes -> routes
                        .dispatcherTypeMatchers(DispatcherType.ERROR).permitAll()
                        .requestMatchers(HttpMethod.GET, PUBLIC_READ_PATHS).permitAll()
                        .requestMatchers(HttpMethod.HEAD, PUBLIC_READ_PATHS).permitAll()
                        .requestMatchers(HttpMethod.POST, "/auth/register", "/auth/login", "/recommendations").permitAll()
                        .requestMatchers(HttpMethod.POST, "/locations", "/locations/{locationId}/reviews").authenticated()
                        .requestMatchers(HttpMethod.GET, "/reviews/pending").authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/reviews/{reviewId}/moderation").authenticated()
                        .requestMatchers("/users", "/users/**").authenticated()
                        .anyRequest().denyAll())
                .logout(logout -> logout.logoutUrl("/auth/logout")
                        .logoutSuccessHandler(new HttpStatusReturningLogoutSuccessHandler(HttpStatus.NO_CONTENT)));
        return http.build();
    }
}
