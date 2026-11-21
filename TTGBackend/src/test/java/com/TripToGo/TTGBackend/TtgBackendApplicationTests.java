package com.TripToGo.TTGBackend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
		"spring.jpa.hibernate.ddl-auto=none",
		"spring.jpa.properties.hibernate.boot.allow_jdbc_metadata_access=false"
})
class TtgBackendApplicationTests {

	@Test
	void contextLoads() {
	}

}
