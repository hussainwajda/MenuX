package com.menux.backend.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
@EnableConfigurationProperties({SupabaseProperties.class, AppProperties.class})
public class SupabaseConfig {

    @Bean
    public WebClient supabaseWebClient(SupabaseProperties properties) {
        return WebClient.builder()
                .baseUrl(properties.url())
                .build();
    }
}
