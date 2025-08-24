DROP TABLE IF EXISTS adoption_interests;
DROP TABLE IF EXISTS items_cleaned;
DROP TABLE IF EXISTS items;

CREATE TABLE items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kind VARCHAR(16) NOT NULL DEFAULT 'ADOPT', -- ADOPT | LOST
  pet_name VARCHAR(120) NULL,
  zone VARCHAR(120) NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NULL,
  image_url VARCHAR(500) NULL,
  contact_name VARCHAR(120) NULL,
  contact_phone VARCHAR(60) NULL,
  contact_email VARCHAR(120) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_items_kind (kind),
  INDEX idx_items_pet_name (pet_name),
  INDEX idx_items_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE items_cleaned (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NULL,
  image_url VARCHAR(500) NULL,
  source_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE adoption_interests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  item_id INT NOT NULL,
  person_name VARCHAR(120) NOT NULL,
  phone VARCHAR(60),
  email VARCHAR(120),
  message VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_interest_item (item_id),
  CONSTRAINT fk_interest_item
    FOREIGN KEY (item_id)
    REFERENCES items(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


