package controllers

import (
	"fmt"
	"net/http"
	"server-cookie/database"
	"server-cookie/middleware"
	"server-cookie/models"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type UserResponse struct {
	Id       string `json:"id"`
	Username string `json:"username"`
	Email string `json:"email"`
}

var validate = validator.New()

// Fungsi untuk mengubah error validator ke format yang lebih jelas
func formatValidationError(err error) map[string]string {
	errors := make(map[string]string)
	if validationErrors, ok := err.(validator.ValidationErrors); ok {
		for _, e := range validationErrors {
			field := e.Field()
			switch e.Tag() {
			case "required":
				errors[field] = field + " harus diisi"
			case "email":
				errors[field] = "Format email tidak valid"
			case "min":
				errors[field] = field + " minimal " + e.Param() + " karakter"
			case "max":
				errors[field] = field + " maksimal " + e.Param() + " karakter"
			default:
				errors[field] = "Format tidak valid"
			}
		}
	}
	return errors
}

func Register(c *gin.Context) {
	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 🔥 Validasi otomatis dengan library validator
	if err := validate.Struct(user); err != nil {
		formattedErrors := formatValidationError(err)
		c.JSON(http.StatusBadRequest, gin.H{"error": formattedErrors})
		return
	}

	// 🔥 Cek apakah username atau email sudah digunakan
	var existingUser models.User
	if err := database.DB.Where("username = ?", user.Username).Or("email = ?", user.Email).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Username atau Email sudah digunakan"})
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not hash password"})
		return
	}
	user.Password = string(hashedPassword)

	// Save user to database
	if err := database.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create user"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "User registered successfully"})
}

func Login(c *gin.Context) {
	var inputUser models.User
	if err := c.ShouldBindJSON(&inputUser); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var dbUser models.User
	if err := database.DB.Where("username = ?", inputUser.Username).First(&dbUser).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credential"})
		return
	}

	//compare password
	if err := bcrypt.CompareHashAndPassword([]byte(dbUser.Password), []byte(inputUser.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credential"})
		return
	}

	// Gunakan fungsi GenerateToken dari middleware
	tokenString, err := middleware.GenerateToken(dbUser.Id.String(), dbUser.Username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate token"})
		return
	}

	// Set token in cookie
	expiry := 60 * 60 //24 * 60 * 60 = 24jam
	c.SetCookie("token", tokenString, expiry, "/", "localhost", false, true)
	// Gunakan struct UserResponse untuk response tanpa password
	userResponse := UserResponse{
		Id:       dbUser.Id.String(),
		Username: dbUser.Username,
		Email: dbUser.Email,
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Logged in successfully",
		"user":    userResponse,
	})
}

// // Logout handler
// func Logout(c *gin.Context) {
//
// 	// Hapus token di cookie (expired dengan maxAge -1)
// 	c.SetCookie("token", "", -1, "/", "localhost", false, true)
// 	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
// }

func Logout(c *gin.Context) {
	// Periksa apakah cookie ada
	token, err := c.Cookie("token")
	if err != nil {
		fmt.Println("❌ Token not found in cookie:", err)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token not found"})
		return
	}

	fmt.Println("✅ Token for logout:", token)

	// Hapus token di cookie (expire segera)
	c.SetCookie("token", "", -1, "/", "localhost", false, true)

	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

// GetProfile - Mendapatkan profil pengguna berdasarkan ID
func GetProfile(c *gin.Context) {
	userId := c.Param("id")
	var user models.User

	// Validasi UUID
	parsedUUID, err := uuid.Parse(userId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	if err := database.DB.First(&user, "id = ?", parsedUUID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	userResponse := UserResponse{
		Id:       user.Id.String(),
		Username: user.Username,
		Email: user.Email,
	}



	c.JSON(http.StatusOK, gin.H{"user": userResponse})
}

// UpdateProfile - Memperbarui profil pengguna
func UpdateProfile(c *gin.Context) {
	userId := c.Param("id")
	var user models.User

	// Validasi UUID
	parsedUUID, err := uuid.Parse(userId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	// Cari user
	if err := database.DB.First(&user, "id = ?", parsedUUID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	var updateData struct {
		Username string `json:"username"`
		Email    string `json:"email" validate:"required,email"`
		Password string `json:"password" validate:"omitempty,min=6"`
	}

	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update username dan email
	user.Username = updateData.Username
	user.Email = updateData.Email

	// Jika password diisi, hash ulang
	if updateData.Password != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(updateData.Password), bcrypt.DefaultCost)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not hash password"})
			return
		}
		user.Password = string(hashedPassword)
	}

	// Simpan perubahan
	if err := database.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
		return
	}
	userResponse := UserResponse{
		Id:       user.Id.String(),
		Username: user.Username,
		Email: user.Email,
	}

	c.JSON(http.StatusOK, gin.H{"message": "Profile updated successfully", "user":userResponse})
}
