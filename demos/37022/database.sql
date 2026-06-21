-- 家庭点菜系统数据库
CREATE DATABASE IF NOT EXISTS family_ordering DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE family_ordering;

-- 家庭成员表
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nickname VARCHAR(50) NOT NULL DEFAULT '家庭成员',
    role_name VARCHAR(50) NOT NULL DEFAULT '成员',
    avatar VARCHAR(255) DEFAULT NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 菜品库
CREATE TABLE IF NOT EXISTS dishes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255) DEFAULT '',
    category ENUM('meat','veg','soup','drink') NOT NULL DEFAULT 'meat',
    emoji VARCHAR(10) DEFAULT NULL,
    image_url VARCHAR(255) DEFAULT NULL,
    created_by INT DEFAULT NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 点菜记录
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    dish_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    order_date DATE NOT NULL,
    status ENUM('pending','confirmed','cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 做菜记录
CREATE TABLE IF NOT EXISTS cooking_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    dish_id INT NOT NULL,
    cooking_date DATE NOT NULL,
    note VARCHAR(255) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 公告
CREATE TABLE IF NOT EXISTS announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    author_id INT NOT NULL,
    is_pinned TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 照片墙
CREATE TABLE IF NOT EXISTS photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    url VARCHAR(500) NOT NULL,
    album_name VARCHAR(100) DEFAULT '默认相册',
    caption VARCHAR(255) DEFAULT '',
    uploaded_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 重要日期
CREATE TABLE IF NOT EXISTS important_dates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    event_date DATE NOT NULL,
    date_type ENUM('birthday','anniversary','other') DEFAULT 'other',
    related_user_id INT DEFAULT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (related_user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 初始菜品数据
INSERT INTO dishes (name, description, category, emoji) VALUES
('红烧排骨', '精选猪小排，酱香浓郁', 'meat', '🍖'),
('可乐鸡翅', '甜香嫩滑，老少皆宜', 'meat', '🍗'),
('清蒸鲈鱼', '新鲜鲈鱼，原汁原味', 'meat', '🐟'),
('糖醋里脊', '外酥里嫩，酸甜可口', 'meat', '🥩'),
('番茄炒蛋', '家常经典，下饭首选', 'veg', '🍅'),
('蒜蓉西兰花', '清淡爽口，营养丰富', 'veg', '🥦'),
('干煸四季豆', '香辣脆嫩，口感十足', 'veg', '🫘'),
('清炒时蔬', '当季新鲜蔬菜', 'veg', '🥬'),
('紫菜蛋花汤', '清淡鲜美，暖胃佳品', 'soup', '🥣'),
('番茄牛腩汤', '酸甜浓郁，牛肉软烂', 'soup', '🍲'),
('玉米排骨汤', '鲜甜滋补，营养满分', 'soup', '🌽'),
('酸梅汤', '冰爽解暑，消食开胃', 'drink', '🧃'),
('柠檬蜂蜜水', '清新怡人，美容养颜', 'drink', '🍋'),
('椰汁', '香甜可口，热带风味', 'drink', '🥥'),
('豆浆', '现磨浓香，健康饮品', 'drink', '🥛');

-- 初始用户
INSERT INTO users (nickname, role_name) VALUES ('爸爸', '家长'), ('妈妈', '家长'), ('孩子', '成员');
