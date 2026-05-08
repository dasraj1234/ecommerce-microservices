package com.MCA.authN_Z;

import java.util.TimeZone;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AuthNZApplication {
	static {
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Kolkata"));
    }
	public static void main(String[] args) {
		SpringApplication.run(AuthNZApplication.class, args);
	}

}
