package com.Bank.Online;

import com.Bank.Online.config.LocalEnvLoader;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class OnlineApplication {

	public static void main(String[] args) {
		LocalEnvLoader.load();
		SpringApplication.run(OnlineApplication.class, args);
	}

}
