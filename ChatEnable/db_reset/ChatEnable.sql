-- Create database:

DROP DATABASE IF EXISTS chatenable;

CREATE DATABASE chatenable;

-- Create database tables:

USE chatenable;

-- Create database:

DROP DATABASE IF EXISTS chatenable;

CREATE DATABASE chatenable;

-- Create database tables:

USE chatenable;

CREATE TABLE `user` (
  `id` varchar(255) PRIMARY KEY,
  `username` varchar(255),
  `firstname` varchar(255),
  `lastname` varchar(255),
  `password` varchar(255),
  `email` varchar(255),
  `confirmed` boolean,
  `picture` varchar(255)
);

CREATE TABLE `friendsList` (
  `id1` varchar(255),
  `id2` varchar(255),
  `lastCall` varchar(255),
  PRIMARY KEY (`id1`, `id2`)
);

CREATE TABLE `userToken` (
  `id` varchar(255),
  `token` varchar(255),
  PRIMARY KEY (`id`, `token`)
);

ALTER TABLE `friendsList` ADD FOREIGN KEY (`id1`) REFERENCES `user` (`id`);

ALTER TABLE `friendsList` ADD FOREIGN KEY (`id2`) REFERENCES `user` (`id`);

ALTER TABLE `userToken` ADD FOREIGN KEY (`id`) REFERENCES `user` (`id`);
