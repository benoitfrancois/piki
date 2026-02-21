package com.personalwiki.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private static final String[] PUBLIC_API = {
            "/api/auth/login", "/api/auth/check",
            "/api/setup/status", "/api/setup/configure",
            "/api/setup/verify-recovery-key", "/api/setup/reset-password"
    };

    private static final String[] PUBLIC_EXTENSIONS = {
            ".js", ".css", ".ico", ".png", ".jpg", ".woff", ".woff2", ".ttf"
    };

    private static final String[] PUBLIC_PAGES = {
            "/login", "/setup", "/reset-password", "/index.csr.html"
    };

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
                .addFilterBefore(sessionAuthFilter(), UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public OncePerRequestFilter sessionAuthFilter() {
        return new OncePerRequestFilter() {
            @Override
            protected void doFilterInternal(HttpServletRequest request,
                                            HttpServletResponse response,
                                            FilterChain filterChain)
                    throws ServletException, IOException {

                String path = request.getRequestURI();

                if (isPublic(path)) {
                    filterChain.doFilter(request, response);
                    return;
                }

                HttpSession session = request.getSession(false);
                boolean authenticated = session != null
                        && Boolean.TRUE.equals(session.getAttribute("authenticated"));

                if (authenticated) {
                    filterChain.doFilter(request, response);
                } else {
                    if (path.startsWith("/api/")) {
                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                        response.setContentType("application/json");
                        response.getWriter().write("{\"error\":\"Unauthorized\",\"code\":401}");
                    } else {
                        response.sendRedirect("/login");
                    }
                }
            }

            private boolean isPublic(String path) {
                for (String p : PUBLIC_API) {
                    if (path.equals(p)) return true;
                }
                for (String p : PUBLIC_PAGES) {
                    if (path.equals(p)) return true;
                }
                for (String ext : PUBLIC_EXTENSIONS) {
                    if (path.endsWith(ext)) return true;
                }
                if (path.startsWith("/uploads/")) return true;
                return false;
            }
        };
    }
}
