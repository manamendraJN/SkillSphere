package com.sliit.backend.security;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.mongodb.lang.NonNull;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger LOGGER = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsService userDetailsService;

    @SuppressWarnings("null")
    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,@NonNull HttpServletResponse response,@NonNull FilterChain filterChain)
            throws ServletException, IOException {
        LOGGER.info("Processing request in JwtAuthenticationFilter for URI: {}", request.getRequestURI());

        String authHeader = request.getHeader("Authorization");
        String token = null;
        String username = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
            try {
                username = jwtUtil.extractUsername(token);
                LOGGER.info("Extracted username from token: {}", username);
            } catch (ExpiredJwtException e) {
                LOGGER.warn("JWT token is expired: {}", e.getMessage());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            } catch (SignatureException | MalformedJwtException e) {
                LOGGER.warn("Invalid JWT token: {}", e.getMessage());
                response.setStatus(HttpServletResponse.SC_FORBIDDEN); // This causes the 403
                return;
            } catch (Exception e) {
                LOGGER.error("Error processing JWT token: {}", e.getMessage());
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                return;
            }
        } else {
            LOGGER.info("No Bearer token found in Authorization header");
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            if (jwtUtil.validateToken(token, userDetails.getUsername())) {
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
                LOGGER.info("Authenticated user: {}", username);
            } else {
                LOGGER.warn("JWT token validation failed for user: {}", username);
            }
        }

        filterChain.doFilter(request, response);
    }
}
