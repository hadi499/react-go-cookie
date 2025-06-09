package main

import (
	"net/http"
	"server-cookie/controllers"
	"server-cookie/database"
	"server-cookie/middleware"

	"github.com/gin-gonic/gin"
)

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000") // Ganti * dengan domain tertentu jika perlu
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")

		// Jika method OPTIONS, langsung response 200 OK
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusOK)
			return
		}

		c.Next()
	}
}

func main() {
	database.ConnectDatabase()

	r := gin.Default()
	r.Use(CORSMiddleware())
	r.Static("/uploads", "./uploads")
	r.POST("/register", controllers.Register)
	r.POST("/login", controllers.Login)
	// Protected routes
	protectedRoutes := r.Group("/")
	protectedRoutes.Use(middleware.AuthMiddleware())
	{
		protectedRoutes.GET("/logout", controllers.Logout)
		protectedRoutes.GET("/products", controllers.GetAllProducts)
		protectedRoutes.GET("/products/:id", controllers.GetProductDetail)
		protectedRoutes.DELETE("/products/:id", controllers.DeleteProduct)
		protectedRoutes.PUT("/products/:id", controllers.UpdateProduct)
		protectedRoutes.POST("/products", controllers.CreateProduct)
		protectedRoutes.GET("/profile/:id", controllers.GetProfile)
		protectedRoutes.PUT("/profile/:id", controllers.UpdateProfile)
	}

	r.Run(":8080")

}
