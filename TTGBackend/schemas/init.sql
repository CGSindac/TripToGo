DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS  users CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS location_tags;
DROP TABLE IF EXISTS reviews;


CREATE TABLE IF NOT EXISTS tags(
	tag_code CHAR(4)   NOT NULL,
	tag_name VARCHAR(25) NOT NULL,
	description TEXT,

	PRIMARY KEY(tag_code)
);

-- Adress { Country, Province, City, Barangay,         

CREATE TABLE locations(
	location_id INTEGER NOT NULL,
	location_name TEXT NOT NULL,
	country VARCHAR(25) NOT NULL,
	province TEXT NOT NULL,
	city TEXT NOT NULL,
	barangay TEXT NOT NULL,
	description TEXT,
	enjoyment_rating DECIMAL(3, 1) NOT NULL DEFAULT 0,
	budget_rating DECIMAL(3, 1) NOT NULL DEFAULT 0,
	PRIMARY KEY(location_id)
);

CREATE TABLE IF NOT EXISTS location_tags(
	location_id INTEGER NOT NULL,
	tag_code CHAR(4) NOT NULL,

	CONSTRAINT fk_location_id
		FOREIGN KEY(location_id) REFERENCES locations(location_id),

	CONSTRAINT fk_tag_code
		FOREIGN KEY(tag_code) REFERENCES tags(tag_code)
);

 CREATE TABLE users(
	user_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	username VARCHAR (50) UNIQUE NOT NULL,
	password_hash VARCHAR(20) NOT NULL,
	email VARCHAR(100) UNIQUE NOT NULL,
	role VARCHAR(20) NOT NULL DEFAULT 'USER',
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE reviews(
	review_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	user_id INT,
	location_id INT,
	enjoyment_rating INT NOT NULL,
	budget_rating INT NOT NULL,
	written_review TEXT,
	status VARCHAR(20) DEFAULT 'PENDING',
	verified_by INT REFERENCES users(user_id),
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

	CONSTRAINT fk_user_id
		FOREIGN KEY(user_id) REFERENCES users(user_id),

	CONSTRAINT fk_location_id
		FOREIGN KEY(location_id) REFERENCES locations(location_id)
);