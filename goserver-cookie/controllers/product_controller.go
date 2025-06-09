package controllers

import (
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"server-cookie/database"
	"server-cookie/models"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// DeleteImage menghapus file gambar berdasarkan path
func DeleteImage(filePath string) error {
	err := os.Remove(filePath)
	return err
}

func GetAllProducts(c *gin.Context) {
	var products []models.Product

	// Ambil parameter page, limit, dan search dari query string
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	search := c.Query("search")

	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}

	// Hitung offset
	offset := (page - 1) * limit

	db := database.GetDB()

	// Query dasar dengan preload user dan sorting
	query := db.Preload("User").Order("created_at DESC")

	// Jika ada parameter search, tambahkan filter (case-insensitive untuk MariaDB)
	if search != "" {
		query = query.Where("LOWER(name) LIKE LOWER(?)", "%"+search+"%")
	}

	// Hitung total produk setelah filter
	var totalItems int64
	if err := query.Model(&models.Product{}).Count(&totalItems).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count products", "details": err.Error()})
		return
	}

	// Ambil produk dengan pagination
	if err := query.Limit(limit).Offset(offset).Find(&products).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve products", "details": err.Error()})
		return
	}

	// Ubah ke format ProductResponse
	var productResponses []models.ProductResponse
	for _, product := range products {
		productResponses = append(productResponses, models.ProductResponse{
			Id:    product.Id.String(),
			Name:  product.Name,
			Price: product.Price,
			Image: product.Image,
			User: models.UserMinimal{
				Id:       product.User.Id.String(),
				Username: product.User.Username,
			},
		})
	}

	// Hitung total halaman
	totalPages := int((totalItems + int64(limit) - 1) / int64(limit))

	// Kirim response dengan metadata pagination
	c.JSON(http.StatusOK, gin.H{
		"products":    productResponses,
		"page":        page,
		"limit":       limit,
		"totalItems":  totalItems,
		"totalPages":  totalPages,
		"hasNextPage": page < totalPages,
	})
}




// func GetAllProducts(c *gin.Context) {
// 	var products []models.Product

// 	// Ambil parameter page & limit dari query string
// 	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
// 	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

// 	if page < 1 {
// 		page = 1
// 	}
// 	if limit < 1 {
// 		limit = 10
// 	}

// 	// Hitung offset
// 	offset := (page - 1) * limit

// 	db := database.GetDB()

// 	// Hitung total produk untuk pagination
// 	var totalItems int64
// 	if err := db.Model(&models.Product{}).Count(&totalItems).Error; err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count products", "details": err.Error()})
// 		return
// 	}

// 	// Ambil produk dengan pagination, preload user, dan urutkan berdasarkan created_at
// 	if err := db.Preload("User").Order("created_at DESC").Limit(limit).Offset(offset).Find(&products).Error; err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve products", "details": err.Error()})
// 		return
// 	}

// 	// Ubah ke format ProductResponse
// 	var productResponses []models.ProductResponse
// 	for _, product := range products {
// 		productResponses = append(productResponses, models.ProductResponse{
// 			Id:    product.Id.String(),
// 			Name:  product.Name,
// 			Price: product.Price,
// 			Image: product.Image,
// 			User: models.UserMinimal{
// 				Id:       product.User.Id.String(),
// 				Username: product.User.Username,
// 			},
// 		})
// 	}

// 	// Hitung total halaman
// 	totalPages := int((totalItems + int64(limit) - 1) / int64(limit))

// 	// Kirim response dengan metadata pagination
// 	c.JSON(http.StatusOK, gin.H{
// 		"products":    productResponses,
// 		"page":        page,
// 		"limit":       limit,
// 		"totalItems":  totalItems,
// 		"totalPages":  totalPages,
// 		"hasNextPage": page < totalPages,
// 	})
// }


// func GetAllProducts(c *gin.Context) {
// 	var products []models.Product

// 	// Ambil data produk dengan user terkaitnya
// 	db := database.GetDB()
// 	if err := db.Preload("User").Order("created_at DESC").Find(&products).Error; err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve products", "details": err.Error()})
// 		return
// 	}

// 	// Ubah ke format ProductResponse agar hanya menampilkan id & username user
// 	var productResponses []models.ProductResponse
// 	for _, product := range products {
// 		productResponses = append(productResponses, models.ProductResponse{
// 			Id:    product.Id.String(),
// 			Name:  product.Name,
// 			Price: product.Price,
// 			Image: product.Image,
// 			User: models.UserMinimal{
// 				Id:       product.User.Id.String(),
// 				Username: product.User.Username,
// 			},
// 		})
// 	}

// 	// Kirim response
// 	c.JSON(http.StatusOK, gin.H{"products": productResponses})
// }

func UploadImage(file *multipart.FileHeader) (string, error) {
	uploadDir := "./uploads"

	//cek apakah directory upload ada apa tidak
	if _, err := os.Stat(uploadDir); os.IsNotExist(err) {
		os.MkdirAll(uploadDir, os.ModePerm)
	}

	//memberi name file
	ext := filepath.Ext(file.Filename)
	uniqueFilename := uuid.New().String() + ext
	filePath := filepath.Join(uploadDir, uniqueFilename)

	//buka file yang diunggah file masih disimpan di memory tmp
	src, err := file.Open()
	if err != nil {
		return "", fmt.Errorf("failed to create destination file: %w", err)
	}
	defer src.Close()

	dst, err := os.Create(filePath)
	if err != nil {
		return "", fmt.Errorf("failed to create destination file: %w", err)
	}
	defer dst.Close()

	// Salin isi file ke lokasi tujuan
	if _, err := io.Copy(dst, src); err != nil {
		return "", fmt.Errorf("failed to copy file content: %w", err)
	}

	return filePath, nil
}

func CreateProduct(c *gin.Context) {
	var product models.Product

	// Ambil data dari form-data
	product.Name = c.Request.FormValue("name")

	priceStr := c.Request.FormValue("price")
	if priceStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Price is required"})
		return
	}

	priceInt, err := strconv.ParseInt(priceStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid price format"})
		return
	}
	product.Price = priceInt

	userIdStr := c.Request.FormValue("user_id")

	// Konversi user_id dari string ke uuid.UUID
	userId, err := uuid.Parse(userIdStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user_id format"})
		return
	}
	product.UserId = userId

	//handle upload image
	file, err := c.FormFile("image")
	if err == nil {
		filePath, uploadErr := UploadImage(file)
		if uploadErr != nil {
			c.JSON(500, gin.H{"error": "Failed to upload image."})
			return
		}
		product.Image = filePath //simpan path ke database
	} else {
		product.Image = ""
	}

	// Simpan ke database
	db := database.GetDB()
	if db == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database not initialized"})
		return
	}

	if err := db.Create(&product).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create product", "details": err.Error()})
		return
	}

	// Ambil data lengkap dengan User
	var createdProduct models.Product
	if err := db.Preload("User").First(&createdProduct, product.Id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve created product", "details": err.Error()})
		return
	}

	// Format response sesuai struct custom
	response := models.ProductResponse{
		Id:    createdProduct.Id.String(),
		Name:  createdProduct.Name,
		Price: createdProduct.Price,
		Image: createdProduct.Image,
		User: models.UserMinimal{
			Id:       createdProduct.User.Id.String(),
			Username: createdProduct.User.Username,
		},
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Product created successfully",
		"product": response,
	})

}

func GetProductDetail(c *gin.Context) {
	var product models.Product

	// Ambil ID produk dari parameter URL
	productID := c.Param("id")

	// Ambil data produk berdasarkan ID dengan user terkaitnya
	db := database.GetDB()
	if err := db.Preload("User").First(&product, "id = ?", productID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	// Ubah ke format ProductDetailResponse
	productDetail := models.ProductResponse{
		Id:    product.Id.String(),
		Name:  product.Name,
		Price: product.Price,
		Image: product.Image,
		User: models.UserMinimal{
			Id:       product.User.Id.String(),
			Username: product.User.Username,
		},
	}

	// Kirim response
	c.JSON(http.StatusOK, gin.H{"product": productDetail})
}

func UpdateProduct(c *gin.Context) {
	var product models.Product

	// Ambil ID produk dari parameter URL
	productIDStr := c.Param("id")
	productID, err := uuid.Parse(productIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product_id format"})
		return
	}

	product.Id = productID

	// Cek apakah produk dengan ID tersebut ada di database
	db := database.GetDB()
	if err := db.First(&product, "id = ?", productID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	// Ambil data dari form-data (hanya update jika ada nilai baru)
	name := c.Request.FormValue("name")
	if name != "" {
		product.Name = name
	}

	priceStr := c.Request.FormValue("price")
	if priceStr != "" {
		priceInt, err := strconv.ParseInt(priceStr, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid price format"})
			return
		}
		product.Price = priceInt
	}

	userIdStr := c.Request.FormValue("user_id")

	// Konversi user_id dari string ke uuid.UUID
	userId, err := uuid.Parse(userIdStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user_id format"})
		return
	}
	product.UserId = userId

	// Handle upload image jika ada
	file, err := c.FormFile("image")
	if err == nil {
		// Hapus gambar lama jika ada sebelum menyimpan gambar baru
		if product.Image != "" {
			deleteErr := DeleteImage(product.Image)
			if deleteErr != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete old image"})
				return
			}
		}

		// Upload gambar baru
		filePath, uploadErr := UploadImage(file)
		if uploadErr != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upload image"})
			return
		}
		product.Image = filePath // Simpan path ke database
	}

	// Update produk di database
	if err := db.Save(&product).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update product", "details": err.Error()})
		return
	}

	// Ambil data lengkap dengan User setelah update
	var updatedProduct models.Product
	if err := db.Preload("User").First(&updatedProduct, productID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve updated product", "details": err.Error()})
		return
	}

	// Format response sesuai struct custom
	response := models.ProductResponse{
		Id:    updatedProduct.Id.String(),
		Name:  updatedProduct.Name,
		Price: updatedProduct.Price,
		Image: updatedProduct.Image,
		User: models.UserMinimal{
			Id:       updatedProduct.User.Id.String(),
			Username: updatedProduct.User.Username,
		},
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Product updated successfully",
		"product": response,
	})
}

func DeleteProduct(c *gin.Context) {
	var product models.Product

	// Ambil ID produk dari parameter URL
	productIDStr := c.Param("id")
	productID, err := uuid.Parse(productIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product_id format"})
		return
	}

	product.Id = productID

	// Cek apakah produk dengan ID tersebut ada di database
	db := database.GetDB()
	if err := db.First(&product, "id = ?", productID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	// Hapus gambar terkait jika ada
	if product.Image != "" {
		deleteErr := DeleteImage(product.Image)
		if deleteErr != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete product image"})
			return
		}
	}

	// Hapus produk dari database
	if err := db.Delete(&product).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete product", "details": err.Error()})
		return
	}

	// Response sukses
	c.JSON(http.StatusOK, gin.H{
		"message":    "Product deleted successfully",
		"product_id": productID,
	})
}
