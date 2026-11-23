DROP TABLE IF EXISTS review_tags;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS admins;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS  users CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS location_tags;


CREATE TABLE IF NOT EXISTS tags(
	tag_code CHAR(4) NOT NULL,
	tag_name VARCHAR(25) NOT NULL,
	tag_description TEXT,

	PRIMARY KEY(tag_code)
);

CREATE TABLE locations(
	location_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	location_name TEXT NOT NULL,
	country VARCHAR(25) NOT NULL,
	province TEXT NOT NULL,
	city TEXT NOT NULL,
	barangay TEXT NOT NULL,
	location_description TEXT,
	enjoyment_rating DECIMAL(3, 1) NOT NULL DEFAULT 0,
	budget_rating DECIMAL(3, 1) NOT NULL DEFAULT 0
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
	password_hash VARCHAR(255) NOT NULL,
	email VARCHAR(100) UNIQUE NOT NULL,
	role_category VARCHAR(20) NOT NULL DEFAULT 'USER',
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE admins(
	admin_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	user_id INT UNIQUE REFERENCES users(user_id)
);

CREATE TABLE reviews(
	review_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	user_id INT,
	location_id INT,
	enjoyment_rating INT NOT NULL,
	budget_rating INT NOT NULL,
	written_review TEXT,
	stat VARCHAR(20) DEFAULT 'PENDING',
	verified_by_admin_id INT REFERENCES admins(admin_id),
	proposed_location_name VARCHAR(255),
	proposed_country VARCHAR(25),
	proposed_province VARCHAR(255),
	proposed_city VARCHAR(255),
	proposed_barangay VARCHAR(255),
	proposed_location_key TEXT,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

	CONSTRAINT fk_user_id
		FOREIGN KEY(user_id) REFERENCES users(user_id),

	CONSTRAINT fk_location_id
		FOREIGN KEY(location_id) REFERENCES locations(location_id)
);

CREATE TABLE review_tags(
	review_id INT NOT NULL REFERENCES reviews(review_id),
	tag_code CHAR(4) NOT NULL REFERENCES tags(tag_code),
	PRIMARY KEY(review_id, tag_code)
);
