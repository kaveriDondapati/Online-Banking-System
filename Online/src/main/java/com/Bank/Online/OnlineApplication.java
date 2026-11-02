package com.Bank.Online;

import com.Bank.Online.config.LocalEnvLoader;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;

@SpringBootApplication(exclude = {UserDetailsServiceAutoConfiguration.class})
public class OnlineApplication {

	public static void main(String[] args) {
		LocalEnvLoader.load();
		SpringApplication.run(OnlineApplication.class, args);
	}

}
