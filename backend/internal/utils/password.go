package utils

import (
	"golang.org/x/crypto/bcrypt"
)

// HashPassword generates a bcrypt hash from the given password string.
// Returns the hashed password string and any error encountered during hashing.
// Uses bcrypt's default cost factor for security.
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

// CheckPasswordHash securely compares a plaintext password with a bcrypt hash.
// Returns true if the password matches the hash, false otherwise.
// The comparison is done in constant time to prevent timing attacks.
func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}
